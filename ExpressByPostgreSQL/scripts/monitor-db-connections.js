#!/usr/bin/env node

/**
 * 資料庫連線監控腳本
 * 用於監控和診斷 PostgreSQL 連線問題
 */

const { Sequelize } = require('sequelize');
const config = require('../config/config');

// 只在沒有環境變數時載入 .env 文件
if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  require('dotenv').config()
}

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

console.log('🔍 資料庫連線監控工具');
console.log('========================');
console.log(`環境: ${env}`);
console.log(`主機: ${dbConfig.host}`);
console.log(`端口: ${dbConfig.port}`);
console.log(`資料庫: ${dbConfig.database}`);
console.log(`使用者: ${dbConfig.username}`);
console.log('');

let sequelize;
let connectionCount = 0;
let errorCount = 0;

async function createConnection() {
  try {
    if (dbConfig.use_env_variable) {
      const url = process.env[dbConfig.use_env_variable];
      sequelize = new Sequelize(url, dbConfig);
    } else {
      sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password || '', dbConfig);
    }
    
    // 監聽連線事件
    sequelize.connectionManager.on('connect', (connection) => {
      connectionCount++;
      console.log(`🔗 [${new Date().toISOString()}] 新連線建立 (總計: ${connectionCount})`);
    });
    
    sequelize.connectionManager.on('disconnect', (connection) => {
      console.log(`🔌 [${new Date().toISOString()}] 連線斷開`);
    });
    
    return sequelize;
  } catch (error) {
    console.error('❌ 建立 Sequelize 實例失敗:', error.message);
    throw error;
  }
}

async function testConnection() {
  try {
    console.log('🔌 測試資料庫連線...');
    await sequelize.authenticate();
    console.log('✅ 資料庫連線成功');
    return true;
  } catch (error) {
    errorCount++;
    console.error(`❌ 連線失敗 (錯誤 #${errorCount}):`, error.message);
    return false;
  }
}

async function getConnectionStats() {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `);
    
    return results[0];
  } catch (error) {
    console.error('❌ 無法取得連線統計:', error.message);
    return null;
  }
}

async function monitorConnections() {
  console.log('📊 開始監控資料庫連線...');
  console.log('按 Ctrl+C 停止監控\n');
  
  const startTime = Date.now();
  
  while (true) {
    try {
      const stats = await getConnectionStats();
      if (stats) {
        console.log(`📈 [${new Date().toISOString()}] 連線統計:`);
        console.log(`   總連線數: ${stats.total_connections}`);
        console.log(`   活躍連線: ${stats.active_connections}`);
        console.log(`   閒置連線: ${stats.idle_connections}`);
        console.log(`   錯誤次數: ${errorCount}`);
        console.log(`   運行時間: ${Math.round((Date.now() - startTime) / 1000)} 秒`);
        console.log('');
      }
      
      // 每 30 秒檢查一次
      await new Promise(resolve => setTimeout(resolve, 30000));
      
    } catch (error) {
      console.error('❌ 監控過程中發生錯誤:', error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

async function main() {
  try {
    sequelize = await createConnection();
    
    // 測試初始連線
    const connected = await testConnection();
    if (!connected) {
      console.log('❌ 初始連線失敗，無法開始監控');
      process.exit(1);
    }
    
    // 開始監控
    await monitorConnections();
    
  } catch (error) {
    console.error('❌ 監控工具啟動失敗:', error.message);
    process.exit(1);
  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log('🔌 資料庫連線已關閉');
    }
  }
}

// 處理程序終止
process.on('SIGINT', async () => {
  console.log('\n🛑 正在停止監控...');
  if (sequelize) {
    await sequelize.close();
  }
  console.log('✅ 監控已停止');
  process.exit(0);
});

// 執行主程式
main().catch(console.error);
