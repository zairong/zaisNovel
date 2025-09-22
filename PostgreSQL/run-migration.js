'use strict';

require('dotenv').config();
const { sequelize } = require('./models');

async function runMigration() {
  try {
    console.log('🔄 開始執行資料庫遷移...');
    
    // 執行新增年齡範圍欄位的遷移
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN age_range ENUM('10~20', '20~30', '30~40', '40~50', '50~60', '60以上') 
      COMMENT '年齡範圍'
    `);
    
    console.log('✅ 資料庫遷移完成！');
    console.log('📊 已新增 age_range 欄位到 users 表');
    
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('ℹ️  age_range 欄位已存在，跳過遷移');
    } else {
      console.error('❌ 遷移失敗:', error.message);
    }
  } finally {
    await sequelize.close();
  }
}

runMigration();
