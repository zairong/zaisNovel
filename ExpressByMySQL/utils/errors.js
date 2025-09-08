/**
 * 自定義錯誤類別
 */

// 基礎應用錯誤類別
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // 標記為可預期的錯誤
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        timestamp: this.timestamp
      }
    };
  }
}

// 驗證錯誤
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }

  toJSON() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      errors: this.errors,
      timestamp: this.timestamp
    };
  }
}

// 認證錯誤
class AuthenticationError extends AppError {
  constructor(message = '認證失敗') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

// 授權錯誤
class AuthorizationError extends AppError {
  constructor(message = '權限不足') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

// 資源未找到錯誤
class NotFoundError extends AppError {
  constructor(message = '資源未找到', resource = '') {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.resource = resource;
  }

  toJSON() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      resource: this.resource,
      timestamp: this.timestamp
    };
  }
}

// 衝突錯誤（如重複資源）
class ConflictError extends AppError {
  constructor(message = '資源衝突') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

// 速率限制錯誤
class RateLimitError extends AppError {
  constructor(message = '請求過於頻繁', retryAfter = 60) {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      retryAfter: this.retryAfter,
      timestamp: this.timestamp
    };
  }
}

// 資料庫錯誤
class DatabaseError extends AppError {
  constructor(message = '資料庫操作失敗', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

// 檔案操作錯誤
class FileError extends AppError {
  constructor(message = '檔案操作失敗', operation = '') {
    super(message, 500, 'FILE_ERROR');
    this.operation = operation;
  }
}

// 業務邏輯錯誤
class BusinessLogicError extends AppError {
  constructor(message, statusCode = 400) {
    super(message, statusCode, 'BUSINESS_LOGIC_ERROR');
  }
}

// 外部服務錯誤
class ExternalServiceError extends AppError {
  constructor(message = '外部服務錯誤', service = '') {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
  }
}

/**
 * 錯誤工廠函數
 */
const ErrorFactory = {
  validation: (message, errors = []) => new ValidationError(message, errors),
  authentication: (message) => new AuthenticationError(message),
  authorization: (message) => new AuthorizationError(message),
  notFound: (message, resource) => new NotFoundError(message, resource),
  conflict: (message) => new ConflictError(message),
  rateLimit: (message, retryAfter) => new RateLimitError(message, retryAfter),
  database: (message, originalError) => new DatabaseError(message, originalError),
  file: (message, operation) => new FileError(message, operation),
  businessLogic: (message, statusCode) => new BusinessLogicError(message, statusCode),
  externalService: (message, service) => new ExternalServiceError(message, service),
  generic: (message, statusCode, code) => new AppError(message, statusCode, code)
};

/**
 * Sequelize 錯誤處理器
 */
function handleSequelizeError(error) {
  console.error('Sequelize 錯誤:', error);

  // 唯一性約束錯誤
  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors?.[0]?.path || 'unknown';
    return new ConflictError(`${field} 已存在`);
  }

  // 驗證錯誤
  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map(err => ({
      field: err.path,
      message: err.message
    }));
    return new ValidationError('資料驗證失敗', errors);
  }

  // 外鍵約束錯誤
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return new BusinessLogicError('關聯資料不存在或已被刪除');
  }

  // 連接錯誤
  if (error.name === 'SequelizeConnectionError') {
    return new DatabaseError('資料庫連接失敗');
  }

  // 其他資料庫錯誤
  return new DatabaseError('資料庫操作失敗', error);
}

/**
 * JWT 錯誤處理器
 */
function handleJWTError(error) {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('無效的認證令牌');
  }
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('認證令牌已過期');
  }
  if (error.name === 'NotBeforeError') {
    return new AuthenticationError('認證令牌尚未生效');
  }
  return new AuthenticationError('認證令牌錯誤');
}

/**
 * Multer 錯誤處理器
 */
function handleMulterError(error) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new ValidationError('檔案大小超過限制');
  }
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new ValidationError('檔案數量超過限制');
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new ValidationError('不支援的檔案欄位');
  }
  return new FileError('檔案上傳失敗');
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  FileError,
  BusinessLogicError,
  ExternalServiceError,
  ErrorFactory,
  handleSequelizeError,
  handleJWTError,
  handleMulterError
};
