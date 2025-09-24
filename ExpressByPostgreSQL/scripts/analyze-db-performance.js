#!/usr/bin/env node

/**
 * 資料庫效能分析腳本
 * 用於分析 PostgreSQL 連線模式和查詢效能
 */

const { Sequelize } = require('sequelize');
const config = require('../config/config');

// 只在沒有環境變數時載入 .env 文件
if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  require('dotenv').config()
}

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

console.log('🔍 資料庫效能分析工具');
console.log('========================');
console.log(`環境: ${env}`);
console.log(`主機: ${dbConfig.host}`);
console.log(`資料庫: ${dbConfig.database}`);
console.log('');

let sequelize;

async function createConnection() {
  try {
    if (dbConfig.use_env_variable) {
      const url = process.env[dbConfig.use_env_variable];
      sequelize = new Sequelize(url, dbConfig);
    } else {
      sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password || '', dbConfig);
    }
    
    await sequelize.authenticate();
    console.log('✅ 資料庫連線成功');
    return sequelize;
  } catch (error) {
    console.error('❌ 資料庫連線失敗:', error.message);
    throw error;
  }
}

async function analyzeConnections() {
  try {
    console.log('\n📊 連線分析');
    console.log('================');
    
    const [connections] = await sequelize.query(`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections,
        count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
        count(*) FILTER (WHERE state = 'idle in transaction (aborted)') as idle_in_transaction_aborted
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `);
    
    console.log('📈 連線統計:');
    console.log(`   總連線數: ${connections[0].total_connections}`);
    console.log(`   活躍連線: ${connections[0].active_connections}`);
    console.log(`   閒置連線: ${connections[0].idle_connections}`);
    console.log(`   事務中閒置: ${connections[0].idle_in_transaction}`);
    console.log(`   事務中止閒置: ${connections[0].idle_in_transaction_aborted}`);
    
    // 檢查長時間運行的查詢
    const [longQueries] = await sequelize.query(`
      SELECT 
        pid,
        usename,
        application_name,
        client_addr,
        state,
        query_start,
        now() - query_start as duration,
        query
      FROM pg_stat_activity 
      WHERE datname = current_database()
        AND state = 'active'
        AND now() - query_start > interval '1 second'
      ORDER BY duration DESC
    `);
    
    if (longQueries.length > 0) {
      console.log('\n⏱️  長時間運行的查詢:');
      longQueries.forEach((query, index) => {
        console.log(`   ${index + 1}. PID: ${query.pid}, 用戶: ${query.usename}, 時長: ${query.duration}`);
        console.log(`      查詢: ${query.query.substring(0, 100)}...`);
      });
    } else {
      console.log('\n✅ 沒有長時間運行的查詢');
    }
    
  } catch (error) {
    console.error('❌ 連線分析失敗:', error.message);
  }
}

async function analyzeTableStats() {
  try {
    console.log('\n📋 資料表統計');
    console.log('================');
    
    const [tableStats] = await sequelize.query(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public'
      ORDER BY live_tuples DESC
    `);
    
    console.log('📊 資料表活動統計:');
    tableStats.forEach(table => {
      console.log(`\n   📚 ${table.tablename}:`);
      console.log(`      總行數: ${table.live_tuples}`);
      console.log(`      插入: ${table.inserts}, 更新: ${table.updates}, 刪除: ${table.deletes}`);
      console.log(`      死行數: ${table.dead_tuples}`);
      if (table.last_analyze) {
        console.log(`      最後分析: ${new Date(table.last_analyze).toLocaleString()}`);
      }
    });
    
  } catch (error) {
    console.error('❌ 資料表統計分析失敗:', error.message);
  }
}

async function analyzeIndexes() {
  try {
    console.log('\n🔍 索引分析');
    console.log('================');
    
    const [indexStats] = await sequelize.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan as index_scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public'
      ORDER BY index_scans DESC
    `);
    
    console.log('📈 索引使用統計:');
    indexStats.forEach(index => {
      console.log(`\n   🔗 ${index.indexname} (${index.tablename}):`);
      console.log(`      掃描次數: ${index.index_scans}`);
      console.log(`      讀取元組: ${index.tuples_read}`);
      console.log(`      獲取元組: ${index.tuples_fetched}`);
    });
    
    // 檢查未使用的索引
    const [unusedIndexes] = await sequelize.query(`
      SELECT 
        schemaname,
        tablename,
        indexname
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public'
        AND idx_scan = 0
      ORDER BY tablename, indexname
    `);
    
    if (unusedIndexes.length > 0) {
      console.log('\n⚠️  未使用的索引:');
      unusedIndexes.forEach(index => {
        console.log(`   ${index.tablename}.${index.indexname}`);
      });
    } else {
      console.log('\n✅ 所有索引都有被使用');
    }
    
  } catch (error) {
    console.error('❌ 索引分析失敗:', error.message);
  }
}

async function analyzeSlowQueries() {
  try {
    console.log('\n🐌 慢查詢分析');
    console.log('================');
    
    // 檢查 pg_stat_statements 擴展是否可用
    const [extensions] = await sequelize.query(`
      SELECT * FROM pg_extension WHERE extname = 'pg_stat_statements'
    `);
    
    if (extensions.length === 0) {
      console.log('⚠️  pg_stat_statements 擴展未安裝，無法分析慢查詢');
      console.log('💡 建議在 PostgreSQL 中安裝此擴展以獲得詳細的查詢統計');
      return;
    }
    
    const [slowQueries] = await sequelize.query(`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows,
        100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
      FROM pg_stat_statements 
      WHERE dbid = (SELECT oid FROM pg_database WHERE datname = current_database())
      ORDER BY mean_time DESC
      LIMIT 10
    `);
    
    if (slowQueries.length > 0) {
      console.log('🐌 最慢的查詢 (前10名):');
      slowQueries.forEach((query, index) => {
        console.log(`\n   ${index + 1}. 平均時間: ${Math.round(query.mean_time)}ms, 調用次數: ${query.calls}`);
        console.log(`      命中率: ${Math.round(query.hit_percent || 0)}%`);
        console.log(`      查詢: ${query.query.substring(0, 150)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ 慢查詢分析失敗:', error.message);
  }
}

async function checkBooksTablePerformance() {
  try {
    console.log('\n📚 Books 表效能檢查');
    console.log('====================');
    
    // 檢查 books 表的大小和索引
    const [tableInfo] = await sequelize.query(`
      SELECT 
        pg_size_pretty(pg_total_relation_size('books')) as total_size,
        pg_size_pretty(pg_relation_size('books')) as table_size,
        pg_size_pretty(pg_total_relation_size('books') - pg_relation_size('books')) as index_size
    `);
    
    console.log('📊 表大小資訊:');
    console.log(`   總大小: ${tableInfo[0].total_size}`);
    console.log(`   表大小: ${tableInfo[0].table_size}`);
    console.log(`   索引大小: ${tableInfo[0].index_size}`);
    
    // 檢查 has_ebook 欄位的分佈
    const [ebookStats] = await sequelize.query(`
      SELECT 
        has_ebook,
        count(*) as count,
        round(count(*) * 100.0 / sum(count(*)) OVER (), 2) as percentage
      FROM books 
      GROUP BY has_ebook
      ORDER BY has_ebook
    `);
    
    console.log('\n📈 has_ebook 分佈:');
    ebookStats.forEach(stat => {
      console.log(`   ${stat.has_ebook ? '有電子書' : '無電子書'}: ${stat.count} 本 (${stat.percentage}%)`);
    });
    
    // 測試查詢效能
    console.log('\n⚡ 查詢效能測試:');
    
    const startTime = Date.now();
    const [testResult] = await sequelize.query(`
      SELECT count(*) as total_books_with_ebooks 
      FROM books 
      WHERE has_ebook = true
    `);
    const endTime = Date.now();
    
    console.log(`   has_ebook = true 計數查詢: ${endTime - startTime}ms`);
    console.log(`   結果: ${testResult[0].total_books_with_ebooks} 本有電子書的書籍`);
    
  } catch (error) {
    console.error('❌ Books 表效能檢查失敗:', error.message);
  }
}

async function main() {
  try {
    sequelize = await createConnection();
    
    await analyzeConnections();
    await analyzeTableStats();
    await analyzeIndexes();
    await analyzeSlowQueries();
    await checkBooksTablePerformance();
    
    console.log('\n✅ 效能分析完成');
    
  } catch (error) {
    console.error('❌ 效能分析工具執行失敗:', error.message);
    process.exit(1);
  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log('\n🔌 資料庫連線已關閉');
    }
  }
}

// 處理程序終止
process.on('SIGINT', async () => {
  console.log('\n🛑 正在停止分析...');
  if (sequelize) {
    await sequelize.close();
  }
  console.log('✅ 分析已停止');
  process.exit(0);
});

// 執行主程式
main().catch(console.error);
