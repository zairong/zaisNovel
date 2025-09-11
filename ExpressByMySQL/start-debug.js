#!/usr/bin/env node

/**
 * 除錯版啟動腳本
 * 用於診斷 PostgreSQL 連線問題
 */

console.log('🔍 除錯模式啟動...');

// 設定環境變數
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// 檢查必要的環境變數
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ 缺少必要的環境變數:', missingVars.join(', '));
  console.error('請在 Render Dashboard 中設定這些環境變數');
  process.exit(1);
}

console.log('✅ 環境變數檢查通過');

// 顯示環境變數狀態
console.log('🔧 環境變數狀態:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '已設定' : '未設定');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '已設定' : '未設定');

// 測試資料庫連線
async function testDatabaseConnection() {
  try {
    console.log('🔌 測試資料庫連線...');
    
    const { Sequelize } = require('sequelize');
    const config = require('./config/config');
    
    const env = process.env.NODE_ENV || 'production';
    const dbConfig = config[env];
    
    console.log('📊 資料庫配置:');
    console.log('  環境:', env);
    console.log('  使用環境變數:', dbConfig.use_env_variable);
    console.log('  主機:', dbConfig.host);
    console.log('  端口:', dbConfig.port);
    console.log('  資料庫:', dbConfig.database);
    console.log('  使用者:', dbConfig.username);
    
    let sequelize;
    if (dbConfig.use_env_variable) {
      const url = process.env[dbConfig.use_env_variable];
      console.log('🌐 使用 DATABASE_URL 連線');
      sequelize = new Sequelize(url, dbConfig);
    } else {
      console.log('🔧 使用個別環境變數連線');
      sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password || '', dbConfig);
    }
    
    console.log('🔍 測試連線...');
    await sequelize.authenticate();
    console.log('✅ 資料庫連線成功');
    
    // 關閉連線
    await sequelize.close();
    console.log('🔌 資料庫連線已關閉');
    
    return true;
  } catch (error) {
    console.error('❌ 資料庫連線失敗:', error.message);
    console.error('錯誤詳情:', error);
    return false;
  }
}

// 執行測試
testDatabaseConnection().then(success => {
  if (success) {
    console.log('✅ 資料庫連線測試通過，可以啟動應用程式');
    console.log('🚀 啟動應用程式...');
    require('./app.js');
  } else {
    console.error('❌ 資料庫連線測試失敗，無法啟動應用程式');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 測試過程中發生錯誤:', error);
  process.exit(1);
});
