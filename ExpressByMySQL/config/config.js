// 使用環境變數作為資料庫設定，避免在版本控制中留下明碼
// 只在沒有關鍵環境變數時載入 .env 文件
if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  require('dotenv').config()
}

/**
 * 推薦在開發與測試環境使用個別的環境變數（DB_HOST/DB_PORT/DB_NAME/DB_USERNAME/DB_PASSWORD）
 * 在生產環境可使用 DATABASE_URL 一次性指定（例如：postgresql://user:pass@host:5432/dbname）
 */

const common = {
  // 資料庫類型
  dialect: 'postgres',
  // 是否顯示 SQL 語句
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  // 連線池設定 - 針對 Render 平台優化
  pool: {
    // 最大連線數 (Render 免費方案限制)
    max: 3,
    // 最小連線數
    min: 0,
    // 連線超時時間 (增加到 90 秒)
    acquire: 90000,
    // 閒置連線超時時間 (減少到 30 秒，避免閒置過久)
    idle: 30000,
    // 定期回收過久未使用的連線（毫秒）
    evict: 5000,
    // 連線池健康檢查間隔
    validate: true
  },
  // 時區
  timezone: '+08:00',
  // 在資料表層級設定編碼與排序規則 (PostgreSQL 不需要 charset 和 collate)
  define: {
    // PostgreSQL 使用預設的 UTF-8 編碼
    underscored: false,
    freezeTableName: true
  },
  // 資料庫選項 - 針對 Render 平台優化
  dialectOptions: {
    // 保持連線存活，降低閒置中斷
    keepAlive: true,
    // 連線超時設定 (增加到 90 秒)
    connectTimeout: 90000,
    // 請求超時設定 (增加到 90 秒)
    requestTimeout: 90000,
    // SSL 設定 (生產環境可能需要)
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  // 重試設定 - 針對 Render 平台優化
  retry: {
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ESOCKETTIMEDOUT/,
      /EHOSTUNREACH/,
      /EPIPE/,
      /EAI_AGAIN/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /Connection reset by peer/,
      /Connection terminated unexpectedly/
    ],
    max: 5,
    // 重試間隔 (毫秒)
    backoffBase: 1000,
    backoffExponent: 2
  }
}

// 檢查是否為 Render 環境
const isRender = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';

// 生產環境特殊處理
const productionConfig = {
  // 優先使用 DATABASE_URL
  use_env_variable: process.env.DATABASE_URL ? 'DATABASE_URL' : undefined,
  username: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'zaisnovel',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ...common
};

// 如果沒有 DATABASE_URL 但有個別環境變數，強制使用個別變數
if (!process.env.DATABASE_URL && process.env.DB_HOST) {
  productionConfig.use_env_variable = undefined;
  console.log('🔧 使用個別環境變數配置資料庫連線');
}

module.exports = {
  // 開發環境
  development: {
    // 若有提供 DATABASE_URL，則優先使用（例如：postgresql://user:pass@host:5432/dbname）
    use_env_variable: process.env.DATABASE_URL ? 'DATABASE_URL' : undefined,
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'books',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    ...common
  },
  // 測試環境
  test: {
    // 若有提供 DATABASE_URL，則優先使用
    use_env_variable: process.env.DATABASE_URL ? 'DATABASE_URL' : undefined,
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'books',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    ...common
  },
  // 生產環境
  production: productionConfig
}


