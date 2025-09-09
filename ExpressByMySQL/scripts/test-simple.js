const { Sequelize } = require('sequelize');

console.log('🚀 開始測試...');

// 直接配置資料庫連接
const sequelize = new Sequelize('books', 'root', '', {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'postgres',
  logging: false
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ 資料庫連接成功');
    
    // 測試簡單查詢
    const [results] = await sequelize.query('SELECT 1 as test');
    console.log('✅ 查詢測試成功:', results);
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔚 連接已關閉');
  }
}

testConnection();
