// 使用環境變數作為資料庫設定，避免在版本控制中留下明碼
require('dotenv').config()

/**
 * 推薦在開發與測試環境使用個別的環境變數（DB_HOST/DB_PORT/DB_NAME/DB_USERNAME/DB_PASSWORD）
 * 在生產環境可使用 DATABASE_URL 一次性指定（例如：mysql://user:pass@host:3306/dbname）
 */

const common = {
  // 資料庫類型
  dialect: 'postgres',
  // 是否顯示 SQL 語句
  logging: false,
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
  // 在資料表層級設定編碼與排序規則（避免將 collate 傳入連線造成 mysql2 警告）
  define: {
    // 編碼
    charset: 'utf8mb4',
    // 排序規則
    collate: 'utf8mb4_unicode_ci'
  },
  // 資料庫選項
  dialectOptions: {
    // 編碼
    charset: 'utf8mb4'
  }
}

module.exports = {
  // 開發環境
  development: {
    // 若有提供 DATABASE_URL，則優先使用（例如：mysql://user:pass@host:3306/dbname）
    use_env_variable: process.env.DATABASE_URL ,
    ...common
  },
  // 測試環境
  test: {
    // 若有提供 DATABASE_URL，則優先使用
    use_env_variable: process.env.DATABASE_URL ,
    ...common
  },
  // 生產環境
  production: {
    // 生產環境建議使用 DATABASE_URL
    use_env_variable: process.env.DATABASE_URL ,
    ...common
  }
}


