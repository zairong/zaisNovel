'use strict';

const fs = require('fs'); // 檔案系統模組  
const path = require('path'); // 路徑模組
const Sequelize = require('sequelize'); // ORM 模組

// 只在開發環境且沒有關鍵環境變數時載入 .env 文件
if (!process.env.DATABASE_URL && !process.env.DB_HOST && process.env.NODE_ENV !== 'production') {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log('🔍 已載入 .env 檔案');
  }
}

const basename = path.basename(__filename); // 檔案名稱
const env = process.env.NODE_ENV || 'development'; // 環境變數

const allConfig = require(__dirname + '/../config/config.js');
const config = allConfig[env]; // 對應環境的設定
const db = {}; // 資料庫物件

let sequelize; // Sequelize 實例
try {
  console.log('🔍 正在建立資料庫連線...');
  console.log('📊 環境:', env);
  console.log('🔧 使用環境變數:', config.use_env_variable);
  
  // 顯示所有相關的環境變數（隱藏敏感資訊）
  console.log('🌍 環境變數檢查:');
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? '已設定' : '未設定');
  console.log('  - DB_HOST:', process.env.DB_HOST || '未設定');
  console.log('  - DB_PORT:', process.env.DB_PORT || '未設定');
  console.log('  - DB_NAME:', process.env.DB_NAME || '未設定');
  console.log('  - DB_USERNAME:', process.env.DB_USERNAME || '未設定');
  console.log('  - DB_PASSWORD:', process.env.DB_PASSWORD ? '已設定' : '未設定');
  
  if (config.use_env_variable) {
    const url = process.env[config.use_env_variable];
    if (!url) {
      throw new Error(`環境變數 ${config.use_env_variable} 未設定或為空`);
    }
    console.log('🌐 使用 DATABASE_URL 連線');
    // 隱藏密碼的 URL 用於日誌
    const safeUrl = url.replace(/:([^:@]+)@/, ':***@');
    console.log('🔗 資料庫 URL:', safeUrl);
    
    // 檢查 URL 格式
    if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
      console.warn('⚠️  警告: DATABASE_URL 不是 PostgreSQL 格式');
    }
    
    sequelize = new Sequelize(url, config);
  } else {
    if (!config.username || !config.database || !config.host) {
      console.warn('⚠️  資料庫設定不完整，將使用預設配置');
      console.warn('🔧 請確認 DB_USERNAME/DB_NAME/DB_HOST 是否已在 .env 設定');
      // 使用預設配置，避免拋出錯誤
      config = {
        host: 'localhost',
        port: 5432,
        database: 'zaisnovel',
        username: 'postgres',
        password: '',
        dialect: 'postgres',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      };
    }
    console.log('🔧 使用個別環境變數連線');
    console.log('🏠 主機:', config.host);
    console.log('🔌 端口:', config.port);
    console.log('📚 資料庫:', config.database);
    console.log('👤 用戶名:', config.username);
    sequelize = new Sequelize(config.database, config.username, config.password || '', config);
  }
  
  console.log('✅ Sequelize 實例建立成功');
} catch (error) {
  console.error('❌ 建立 Sequelize 連線設定失敗:', error.message);
  console.error('🔍 錯誤詳情:', error);
  
  // 提供更詳細的故障排除建議
  console.log('\n🔧 故障排除建議:');
  console.log('1. 檢查 Render 環境變數設定');
  console.log('2. 確認 PostgreSQL 資料庫已建立');
  console.log('3. 檢查 DATABASE_URL 格式是否正確');
  console.log('4. 確認資料庫服務正在運行');
  
  throw error;
}
// 讀取所有模型檔案
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });
// 導出模型
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
// 導出序號
db.sequelize = sequelize;
db.Sequelize = Sequelize;
// 導出模型
module.exports = db;
