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
  logging: false,
  // 連線池設定
  pool: {
    // 最大連線數
    max: 5,
    // 最小連線數
    min: 1,
    // 連線超時時間
    acquire: 30000,
    // 閒置連線超時時間
    idle: 60000,
    // 定期回收過久未使用的連線（毫秒）
    evict: 10000
  },
  // 時區
  timezone: '+08:00',
  // 在資料表層級設定編碼與排序規則
  define: {
    // 編碼
    charset: 'utf8mb4',
    // 排序規則
    collate: 'utf8mb4_unicode_ci'
  },
  // 資料庫選項
  dialectOptions: {
    // 編碼
    charset: 'utf8mb4',
    // 保持連線存活，降低閒置中斷
    keepAlive: true
  }
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
  production: {
    // 若有提供 DATABASE_URL，則優先使用，否則使用個別環境變數
    use_env_variable: process.env.DATABASE_URL ? 'DATABASE_URL' : undefined,
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'books',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    ...common
  }
}


