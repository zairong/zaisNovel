const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { getEnvironmentConfig } = require('../config/env-validation');

// 獲取環境配置
const config = getEnvironmentConfig();

/**
 * 基本安全性中間件
 */
const basicSecurity = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // 避免與檔案上傳衝突
});

/**
 * API 速率限制
 */
const apiRateLimit = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS, // 時間窗口
  max: config.RATE_LIMIT.MAX_REQUESTS, // 最大請求數
  message: {
    success: false,
    message: '請求過於頻繁，請稍後再試',
    retryAfter: Math.ceil(config.RATE_LIMIT.WINDOW_MS / 1000)
  },
  standardHeaders: true, // 返回 `RateLimit-*` 標頭
  legacyHeaders: false, // 禁用 `X-RateLimit-*` 標頭
  skip: (req) => {
    // 跳過某些靜態資源請求
    return req.url.startsWith('/uploads/') || 
           req.url.startsWith('/static/') ||
           req.method === 'OPTIONS';
  }
});

/**
 * 登入速率限制（更嚴格）
 */
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 5, // 每15分鐘最多5次登入嘗試
  message: {
    success: false,
    message: '登入嘗試過於頻繁，請15分鐘後再試',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 成功的請求不計入限制
});

/**
 * 註冊速率限制
 */
const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小時
  max: 3, // 每小時最多3次註冊
  message: {
    success: false,
    message: '註冊過於頻繁，請1小時後再試',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 檔案上傳速率限制
 */
const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 10, // 每15分鐘最多10次上傳
  message: {
    success: false,
    message: '檔案上傳過於頻繁，請稍後再試',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * IP 白名單中間件（可選）
 */
function ipWhitelist(allowedIPs = []) {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      return next(); // 如果沒有設置白名單，跳過檢查
    }

    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const isAllowed = allowedIPs.some(ip => {
      if (ip.includes('/')) {
        // CIDR 格式檢查（簡化版）
        const [network, mask] = ip.split('/');
        return clientIP.startsWith(network.split('.').slice(0, parseInt(mask) / 8).join('.'));
      }
      return clientIP === ip;
    });

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: '訪問被拒絕：IP 不在允許列表中'
      });
    }

    next();
  };
}

/**
 * 防止 SQL 注入的基本檢查
 */
function sqlInjectionProtection(req, res, next) {
  const suspiciousPatterns = [
    /('|(\')|(\-\-)|(\;)|(\|)|(\*)|(\%)|(\+)|(\|)|(\=))/i,
    /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i,
    /(script|javascript|vbscript|onload|onerror|onclick)/i
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  if (checkValue(req.body) || checkValue(req.query) || checkValue(req.params)) {
    return res.status(400).json({
      success: false,
      message: '檢測到可疑輸入，請求被拒絕'
    });
  }

  next();
}

/**
 * 請求大小限制中間件
 */
function requestSizeLimit(maxSize = '10mb') {
  return (req, res, next) => {
    if (req.headers['content-length']) {
      const size = parseInt(req.headers['content-length']);
      const maxSizeBytes = typeof maxSize === 'string' ? 
        parseInt(maxSize) * (maxSize.includes('mb') ? 1024 * 1024 : 1) : 
        maxSize;

      if (size > maxSizeBytes) {
        return res.status(413).json({
          success: false,
          message: '請求內容過大'
        });
      }
    }
    next();
  };
}

/**
 * 使用者代理檢查（阻止已知的惡意爬蟲）
 */
function userAgentFilter(req, res, next) {
  const userAgent = req.get('User-Agent') || '';
  const blockedAgents = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    // 可以添加更多已知的惡意用戶代理
  ];

  // 在生產環境中啟用更嚴格的檢查
  if (config.NODE_ENV === 'production') {
    const isBlocked = blockedAgents.some(pattern => pattern.test(userAgent));
    if (isBlocked) {
      return res.status(403).json({
        success: false,
        message: '訪問被拒絕'
      });
    }
  }

  next();
}

/**
 * CORS 安全配置
 */
function corsConfig(req, res, next) {
  const allowedOrigins = [
    config.FRONTEND_URL,
    'https://zaisnovel-frontend.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}

module.exports = {
  basicSecurity,
  apiRateLimit,
  loginRateLimit,
  registerRateLimit,
  uploadRateLimit,
  ipWhitelist,
  sqlInjectionProtection,
  requestSizeLimit,
  userAgentFilter,
  corsConfig
};
