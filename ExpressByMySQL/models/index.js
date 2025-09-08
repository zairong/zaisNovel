'use strict';

const fs = require('fs'); // 檔案系統模組  
const path = require('path'); // 路徑模組
const Sequelize = require('sequelize'); // ORM 模組
// 確保無論從哪個工作目錄啟動，都讀取 ExpressByMySQL/.env
const envPath = path.resolve(__dirname, '../.env');
console.log('🔍 .env 檔案路徑:', envPath);
console.log('🔍 .env 檔案是否存在:', require('fs').existsSync(envPath));

// 強制重新載入 .env 檔案
console.log('🔍 嘗試載入 .env 檔案...');
const result = require('dotenv').config({ path: envPath, debug: true });
if (result.error) {
  console.error('❌ 載入 .env 檔案失敗:', result.error);
} else {
  console.log('✅ .env 檔案載入成功');
  console.log('🔍 dotenv 結果:', result);
}

const process = require('process'); // 進程模組

// 立即檢查環境變數是否被載入
console.log('🔍 立即檢查環境變數:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[已設定]' : '[未設定]');
const basename = path.basename(__filename); // 檔案名稱
const env = process.env.NODE_ENV || 'development'; // 環境變數

// 調試：再次檢查環境變數
console.log('🔍 環境變數再次檢查:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[已設定]' : '[未設定]');

const allConfig = require(__dirname + '/../config/config.js');
const config = allConfig[env]; // 對應環境的設定
const db = {}; // 資料庫物件

let sequelize; // Sequelize 實例
try {
  if (config.use_env_variable) {
    const url = process.env[config.use_env_variable];
    if (!url) {
      throw new Error(`環境變數 ${config.use_env_variable} 未設定或為空`);
    }
    sequelize = new Sequelize(url, config);
  } else {
    if (!config.username || !config.database || !config.host) {
      throw new Error('資料庫設定不完整，請確認 DB_USERNAME/DB_NAME/DB_HOST 是否已在 .env 設定');
    }
    sequelize = new Sequelize(config.database, config.username, config.password || '', config);
  }
} catch (error) {
  console.error('❌ 建立 Sequelize 連線設定失敗:', error.message);
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
