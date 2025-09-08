const { 
  AppError, 
  handleSequelizeError, 
  handleJWTError, 
  handleMulterError,
  ErrorFactory
} = require('../utils/errors');
const { getEnvironmentConfig, isDevelopment } = require('../config/env-validation');

const config = getEnvironmentConfig();

/**
 * 開發環境錯誤回應
 */
function sendErrorDev(err, res) {
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      name: err.name,
      message: err.message,
      code: err.code || 'INTERNAL_ERROR',
      statusCode: err.statusCode || 500,
      stack: err.stack,
      timestamp: new Date().toISOString(),
      // 如果是自定義錯誤，包含額外資訊
      ...(err.errors && { errors: err.errors }),
      ...(err.resource && { resource: err.resource }),
      ...(err.retryAfter && { retryAfter: err.retryAfter })
    }
  });
}

/**
 * 生產環境錯誤回應
 */
function sendErrorProd(err, res) {
  // 如果是可預期的錯誤，返回詳細資訊
  if (err.isOperational) {
    return res.status(err.statusCode).json(err.toJSON ? err.toJSON() : {
      success: false,
      message: err.message,
      code: err.code || 'OPERATIONAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  // 未預期的錯誤，返回通用錯誤訊息
  console.error('💥 未預期的錯誤:', err);
  res.status(500).json({
    success: false,
    message: '伺服器內部錯誤',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
}

/**
 * 全域錯誤處理中間件
 */
function globalErrorHandler(err, req, res, next) {
  // 如果回應已經發送，交給 Express 預設處理
  if (res.headersSent) {
    return next(err);
  }

  let error = err;

  // 記錄錯誤到控制台
  console.error(`🚨 錯誤發生於 ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    stack: isDevelopment() ? err.stack : undefined,
    user: req.user ? { id: req.user.id, username: req.user.username } : null,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // 處理不同類型的錯誤
  if (err.name && err.name.startsWith('Sequelize')) {
    error = handleSequelizeError(err);
  } else if (err.name && err.name.includes('JsonWebToken')) {
    error = handleJWTError(err);
  } else if (err.code && err.code.startsWith('LIMIT_')) {
    error = handleMulterError(err);
  } else if (err.type === 'entity.parse.failed') {
    error = ErrorFactory.validation('請求體格式錯誤');
  } else if (err.type === 'entity.too.large') {
    error = ErrorFactory.validation('請求內容過大');
  } else if (err.code === 'ENOENT') {
    error = ErrorFactory.file('檔案不存在');
  } else if (err.code === 'EACCES') {
    error = ErrorFactory.file('檔案訪問權限不足');
  } else if (err.code === 'EMFILE' || err.code === 'ENFILE') {
    error = ErrorFactory.file('系統檔案描述符不足');
  } else if (!error.isOperational) {
    // 如果不是自定義錯誤，包裝成通用錯誤
    error = new AppError(
      isDevelopment() ? err.message : '伺服器內部錯誤',
      err.statusCode || 500,
      err.code || 'INTERNAL_ERROR'
    );
  }

  // 確保錯誤有狀態碼
  error.statusCode = error.statusCode || 500;

  // 根據環境發送適當的錯誤回應
  if (isDevelopment()) {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
}

/**
 * 404 錯誤處理中間件
 */
function notFoundHandler(req, res, next) {
  const error = ErrorFactory.notFound(
    `找不到路由: ${req.method} ${req.originalUrl}`,
    'route'
  );
  next(error);
}

/**
 * 非同步錯誤捕獲包裝器
 */
function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 未捕獲的異常處理
 */
function handleUncaughtException() {
  process.on('uncaughtException', (err) => {
    console.error('💥 未捕獲的異常! 關閉應用程式...');
    console.error(err.name, err.message, err.stack);
    
    // 給正在進行的請求一些時間完成
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
}

/**
 * 未處理的 Promise 拒絕處理
 */
function handleUnhandledRejection() {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 未處理的 Promise 拒絕:', reason);
    console.error('Promise:', promise);
    
    // 可以選擇關閉應用程式或記錄錯誤
    if (isDevelopment()) {
      console.error('在開發環境中繼續運行，但請修復此問題');
    } else {
      console.error('在生產環境中，這可能需要重啟應用程式');
      // process.exit(1); // 可選：在生產環境中退出
    }
  });
}

/**
 * 優雅關閉處理
 */
function handleGracefulShutdown(server) {
  const shutdown = (signal) => {
    console.log(`收到 ${signal} 信號，開始優雅關閉...`);
    
    server.close((err) => {
      console.log('HTTP 伺服器已關閉');
      
      if (err) {
        console.error('關閉伺服器時發生錯誤:', err);
        process.exit(1);
      }
      
      process.exit(0);
    });
    
    // 強制關閉超時
    setTimeout(() => {
      console.error('強制關閉應用程式');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

/**
 * 錯誤響應格式化器
 */
function formatErrorResponse(error, req) {
  const baseResponse = {
    success: false,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  if (error.toJSON && typeof error.toJSON === 'function') {
    return { ...baseResponse, ...error.toJSON() };
  }

  return {
    ...baseResponse,
    message: error.message || '發生未知錯誤',
    code: error.code || 'UNKNOWN_ERROR',
    statusCode: error.statusCode || 500
  };
}

module.exports = {
  globalErrorHandler,
  notFoundHandler,
  catchAsync,
  handleUncaughtException,
  handleUnhandledRejection,
  handleGracefulShutdown,
  formatErrorResponse
};
