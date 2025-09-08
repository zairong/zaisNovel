const mysql = require('mysql2/promise');

console.log('🔌 測試資料庫連接...\n');

// 從環境變數讀取配置
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'books'
};

console.log('📋 連接配置:');
console.log(`   Host: ${config.host}`);
console.log(`   Port: ${config.port}`);
console.log(`   Database: ${config.database}`);
console.log(`   Username: ${config.user}`);
console.log(`   Password: ${config.password ? '***已設定***' : '❌ 未設定'}`);

// 檢查必要的配置
if (!config.user) {
  console.log('\n❌ 錯誤: 未設定 DB_USERNAME');
  console.log('💡 請在 .env 檔案中設定 DB_USERNAME');
  process.exit(1);
}

if (!config.password) {
  console.log('\n❌ 錯誤: 未設定 DB_PASSWORD');
  console.log('💡 請在 .env 檔案中設定 DB_PASSWORD');
  process.exit(1);
}

async function testConnection() {
  let connection;
  
  try {
    console.log('\n🚀 嘗試連接資料庫...');
    
    // 創建連接
    connection = await mysql.createConnection(config);
    console.log('✅ 資料庫連接成功！');
    
    // 測試查詢
    console.log('\n📊 測試基本查詢...');
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as `current_time`');
    console.log('✅ 查詢測試成功:', rows[0]);
    
    // 檢查資料庫版本
    const [versionRows] = await connection.execute('SELECT VERSION() as version');
    console.log('✅ 資料庫版本:', versionRows[0].version);
    
    // 檢查資料庫編碼
    const [charsetRows] = await connection.execute('SHOW VARIABLES LIKE "character_set_database"');
    console.log('✅ 資料庫編碼:', charsetRows[0].Value);
    
    // 檢查資料表
    console.log('\n📋 檢查資料表...');
    const [tableRows] = await connection.execute('SHOW TABLES');
    if (tableRows.length > 0) {
      console.log(`✅ 發現 ${tableRows.length} 個資料表:`);
      tableRows.forEach((row, index) => {
        const tableName = Object.values(row)[0];
        console.log(`   ${index + 1}. ${tableName}`);
      });
    } else {
      console.log('⚠️ 沒有發現資料表');
    }
    
    console.log('\n🎉 資料庫連接測試完成！所有檢查都通過了。');
    
  } catch (error) {
    console.log('\n❌ 資料庫連接失敗:');
    console.log(`   錯誤類型: ${error.code || 'UNKNOWN'}`);
    console.log(`   錯誤訊息: ${error.message}`);
    
    // 提供常見錯誤的解決方案
    console.log('\n💡 常見問題解決方案:');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   1. 檢查 MySQL 服務是否正在運行');
      console.log('   2. 檢查埠號是否正確 (預設: 3306)');
      console.log('   3. 檢查防火牆設定');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('   1. 檢查用戶名和密碼是否正確');
      console.log('   2. 檢查用戶是否有連接權限');
      console.log('   3. 檢查用戶是否允許從該主機連接');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('   1. 檢查資料庫名稱是否正確');
      console.log('   2. 檢查資料庫是否存在');
      console.log('   3. 檢查用戶是否有該資料庫的權限');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   1. 檢查主機名稱是否正確');
      console.log('   2. 檢查網路連接');
      console.log('   3. 檢查 DNS 設定');
    }
    
    console.log('\n🔧 故障排除步驟:');
    console.log('   1. 確認 .env 檔案存在且配置正確');
    console.log('   2. 使用 MySQL 命令列工具測試連接:');
    console.log(`      mysql -u ${config.user} -p -h ${config.host} -P ${config.port} ${config.database}`);
    console.log('   3. 檢查 MySQL 服務狀態');
    console.log('   4. 檢查 MySQL 錯誤日誌');
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 資料庫連接已關閉');
    }
  }
}

// 執行測試
testConnection().catch(console.error);
