// 環境變數驗證和設定
const crypto = require('crypto');

/**
 * 驗證必要的環境變數
 */
function validateEnvironment() {
  const errors = [];
  
  // 驗證 JWT 密鑰
  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET 環境變數未設定');
  } else if (process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET 必須至少 32 個字符長度');
  } else if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-at-least-32-characters-long') {
    errors.push('請更改預設的 JWT_SECRET 值');
  }
  
  // 驗證資料庫配置
  if (!process.env.DATABASE_URL) {
    if (!process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_USERNAME || !process.env.DB_PASSWORD) {
      errors.push('需要設定 DATABASE_URL 或完整的資料庫配置 (DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD)');
    }
  }
  
  // 驗證 NODE_ENV
  const validEnvironments = ['development', 'production', 'test'];
  if (!process.env.NODE_ENV || !validEnvironments.includes(process.env.NODE_ENV)) {
    errors.push(`NODE_ENV 必須是以下值之一: ${validEnvironments.join(', ')}`);
  }
  
  // 生產環境額外檢查
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET === '123456789' || process.env.JWT_SECRET.includes('test')) {
      errors.push('生產環境不能使用測試用的 JWT_SECRET');
    }
    
    if (!process.env.FRONTEND_URL) {
      errors.push('生產環境必須設定 FRONTEND_URL');
    }
  }
  
  if (errors.length > 0) {
    console.error('❌ 環境變數驗證失敗:');
    errors.forEach(error => console.error(`   • ${error}`));
    console.error('\n💡 請檢查 .env 檔案或參考 env.example 設定正確的環境變數');
    process.exit(1);
  }
  
  console.log('✅ 環境變數驗證通過');
}

/**
 * 獲取環境配置
 */
function getEnvironmentConfig() {
  return {
    // 基本配置
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    
    // 安全配置
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    
    // 資料庫配置
    DATABASE_URL: process.env.DATABASE_URL,
    DB_CONFIG: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
    
    // 檔案上傳配置
    UPLOAD: {
      PATH: process.env.UPLOAD_PATH || './uploads',
      MAX_SIZE: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10), // 10MB
      ALLOWED_TYPES: process.env.UPLOAD_ALLOWED_TYPES ? 
        process.env.UPLOAD_ALLOWED_TYPES.split(',') : 
        ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt', 'md']
    },
    
    // CORS 配置
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    
    // 速率限制配置
    RATE_LIMIT: {
      WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15分鐘
      MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
    },
    
    // 日誌配置
    LOG: {
      LEVEL: process.env.LOG_LEVEL || 'info',
      FILE_PATH: process.env.LOG_FILE_PATH || './logs/app.log'
    }
  };
}

/**
 * 生成安全的 JWT 密鑰
 */
function generateJWTSecret() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 檢查是否為開發環境
 */
function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

/**
 * 檢查是否為生產環境
 */
function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * 檢查是否為測試環境
 */
function isTest() {
  return process.env.NODE_ENV === 'test';
}

module.exports = {
  validateEnvironment,
  getEnvironmentConfig,
  generateJWTSecret,
  isDevelopment,
  isProduction,
  isTest
};
