// 使用環境變數作為資料庫設定，避免在版本控制中留下明碼
require('dotenv').config()

/**
 * PostgreSQL 資料庫配置
 * 推薦在開發與測試環境使用個別的環境變數（DB_HOST/DB_PORT/DB_NAME/DB_USERNAME/DB_PASSWORD）
 * 在生產環境可使用 DATABASE_URL 一次性指定（例如：postgresql://user:pass@host:5432/dbname）
 */

const common = {
  // 資料庫類型
  dialect: 'postgres',
  // 是否顯示 SQL 語句
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  // 連線池設定
  pool: {
    // 最大連線數
    max: 10,
    // 最小連線數
    min: 0,
    // 連線超時時間
    acquire: 30000,
    // 閒置連線超時時間
    idle: 10000
  },
  // 時區
  timezone: '+08:00',
  // PostgreSQL 專用設定
  define: {
    // 自動添加時間戳
    timestamps: true,
    // 使用下劃線命名
    underscored: false,
    // 凍結表名
    freezeTableName: false
  },
  // PostgreSQL 連線選項
  dialectOptions: {
    // SSL 設定（Render 等雲端平台需要）
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    // 連線超時
    connectTimeout: 20000,
    // 查詢超時
    statement_timeout: 10000,
    // 閒置超時
    idle_in_transaction_session_timeout: 10000
  }
}

module.exports = {
  // 開發環境
  development: {
    // 若有提供 DATABASE_URL，則優先使用
    use_env_variable: process.env.DATABASE_URL ? 'DATABASE_URL' : null,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'zaisnovel_dev',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ...common
  },
  // 測試環境
  test: {
    // 測試資料庫
    use_env_variable: process.env.TEST_DATABASE_URL ? 'TEST_DATABASE_URL' : null,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME_TEST || 'zaisnovel_test',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ...common
  },
  // 生產環境
  production: {
    // 生產環境建議使用 DATABASE_URL
    use_env_variable: 'DATABASE_URL',
    ...common
  }
}


