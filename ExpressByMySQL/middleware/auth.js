// 引入 jsonwebtoken
const jwt = require('jsonwebtoken');
// 引入 User 模型
const { User } = require('../models');
// 引入 AuditLog 模型
const { AuditLog } = require('../models');
// 引入環境變數配置
const { getEnvironmentConfig } = require('../config/env-validation');

// 獲取環境配置
const config = getEnvironmentConfig();
const JWT_SECRET = config.JWT_SECRET;

// 確保 JWT_SECRET 存在
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET 必須在環境變數中設定');
}

// 生成 JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
};

// 驗證 JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// 認證中間件
const authenticate = async (req, res, next) => {
  try {
    // 允許特定公開端點在未帶認證令牌時通行（如電子書閱讀/下載）
    // 使用 baseUrl + path 更穩定地比對實際路徑（避免 originalUrl 在掛載時不一致）
    const normalizedPath = `${req.baseUrl || ''}${req.path || ''}`
    const isPublicEbookGet = req.method === 'GET' && (
      /^\/api\/books\/[0-9]+\/read-ebook$/.test(normalizedPath) ||
      /^\/api\/books\/[0-9]+\/download-ebook$/.test(normalizedPath)
    )
    if (isPublicEbookGet) {
      return next()
    }
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供認證令牌'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '無效的認證令牌'
      });
    }

    // 檢查用戶是否存在且啟用
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: '用戶不存在或已被停用'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('認證錯誤:', error);
    return res.status(500).json({
      success: false,
      message: '認證過程發生錯誤'
    });
  }
};

// 權限檢查中間件
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '需要認證'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '權限不足'
      });
    }

    next();
  };
};

// 審計日誌中間件（加強容錯）
const auditLog = async (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    try {
      if (req.user) {
        let parsedResponse = null
        try {
          if (typeof data === 'string') {
            parsedResponse = JSON.parse(data)
          } else if (Buffer.isBuffer(data)) {
            parsedResponse = JSON.parse(data.toString('utf8'))
          } else {
            parsedResponse = data
          }
        } catch (_) {
          parsedResponse = data
        }

        const logData = {
          user_id: req.user.id,
          action: req.method + ' ' + req.originalUrl,
          resource_type: (req.baseUrl || '').replace('/api/', ''),
          resource_id: req.params && (req.params.id || null),
          details: {
            method: req.method,
            url: req.originalUrl,
            body: req.body,
            query: req.query,
            response: parsedResponse
          },
          ip_address: req.ip || (req.connection && req.connection.remoteAddress),
          user_agent: req.get('User-Agent'),
          status: res.statusCode < 400 ? 'success' : 'failure'
        }

        AuditLog.create(logData).catch((err) => {
          console.error('審計日誌記錄失敗:', err)
        })
      }
    } catch (e) {
      // 不影響回應發送
    }

    return originalSend.call(this, data)
  }

  next()
}

// 可選認證中間件（用於某些端點）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // 如果認證頭存在且以 Bearer 開頭
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // 提取 token
      const token = authHeader.substring(7);
      // 驗證 token
      const decoded = verifyToken(token);
      // 如果 token 驗證成功
      if (decoded) {
        // 查找用戶
        const user = await User.findByPk(decoded.id);
        // 如果用戶存在且啟用
        if (user && user.is_active) {
          // 設置用戶
          req.user = user;
        }
      }
    }
    // 繼續執行下一個中間件
    next();
  } catch (error) {
    console.error('可選認證錯誤:', error);
    next();
  }
};

// 導出中間件方法
module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  requireRole,
  auditLog,
  optionalAuth,
  JWT_SECRET
};
