// Render 專用啟動腳本 - 無資料庫依賴版
// 在資料庫連線失敗時仍能提供基本服務

// 只在沒有環境變數時載入 .env 文件
if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  require('dotenv').config()
}

const express = require('express')
const methodOverride = require('method-override')
const path = require('path')
const cors = require('cors')
const app = express()
const DEFAULT_PORT = parseInt(process.env.PORT || '3000', 10)

// CORS 中間件設定 - 強化版
const corsOptions = {
  origin: function (origin, callback) {
    // 允許的來源列表
    const allowedOrigins = [
      'https://zaisnovel-frontend.onrender.com',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
    
    // 允許沒有 origin 的請求（如移動應用程式或 Postman）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 CORS 拒絕來源:', origin);
      callback(new Error('不允許的 CORS 來源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Origin',
    'Accept',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials'
  ],
  optionsSuccessStatus: 200, // 支援舊版瀏覽器
  maxAge: 86400 // 預檢請求快取 24 小時
}

app.use(cors(corsOptions))

// CORS 調試中間件
app.use((req, res, next) => {
  console.log('🌐 請求詳情:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  });
  next();
});

// 專門處理 OPTIONS 請求的中間件 - 強化版
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://zaisnovel-frontend.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ];
  
  // 檢查來源是否被允許
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // 允許沒有 origin 的請求
    res.header('Access-Control-Allow-Origin', '*');
  } else {
    console.log('🚫 OPTIONS 請求拒絕來源:', origin);
    return res.status(403).json({ error: 'CORS 不允許的來源' });
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept, Access-Control-Request-Method, Access-Control-Request-Headers, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Access-Control-Allow-Origin, Access-Control-Allow-Credentials');
  res.header('Access-Control-Max-Age', '86400'); // 24 小時
  res.sendStatus(200);
})

// 中間件設定（提高 body 大小限制，避免描述或少量 Base64 過大導致 413）
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(express.json({ limit: '2mb' }))
app.use(methodOverride('_method'))

// 靜態檔案
app.use(express.static(path.join(__dirname, 'public')))
// 封面圖片靜態檔案服務
app.use('/uploads/covers', express.static(path.join(__dirname, 'uploads', 'covers')))

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服務器運行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// CORS 測試端點
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS 測試成功',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    headers: {
      'Access-Control-Allow-Origin': res.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': res.get('Access-Control-Allow-Credentials')
    }
  });
});

// 資料庫狀態檢查端點
app.get('/api/db-status', async (req, res) => {
  res.json({
    success: false,
    message: '資料庫連線不可用（維護模式）',
    timestamp: new Date().toISOString()
  })
})

// 簡化的認證端點 - 不依賴資料庫
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 收到登入請求:', req.body);
  
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: '請提供用戶名和密碼'
    });
  }
  
  // 模擬登入成功（暫時解決方案）
  res.json({
    success: true,
    message: '登入成功（維護模式）',
    data: {
      user: {
        id: 1,
        username: username,
        email: 'admin@zaisnovel.com',
        role: 'admin',
        is_active: true
      },
      token: 'maintenance-token-' + Date.now()
    }
  });
});

// 簡化的註冊端點 - 不依賴資料庫
app.post('/api/auth/register', (req, res) => {
  console.log('📝 收到註冊請求:', req.body);
  
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: '請提供用戶名、電子郵件和密碼'
    });
  }
  
  // 模擬註冊成功（暫時解決方案）
  res.json({
    success: true,
    message: '註冊成功（維護模式）',
    data: {
      user: {
        id: 2,
        username: username,
        email: email,
        role: 'user',
        is_active: true
      },
      token: 'maintenance-token-' + Date.now()
    }
  });
});

// 簡化的用戶資訊端點
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供認證令牌'
    });
  }
  
  // 模擬用戶資訊
  res.json({
    success: true,
    data: {
      user: {
        id: 1,
        username: 'admin',
        email: 'admin@zaisnovel.com',
        role: 'admin',
        is_active: true
      }
    }
  });
});

// 簡化的書籍端點
app.get('/api/books', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: '書籍服務暫時不可用（維護模式）'
  });
});

// 簡化的審計端點
app.post('/api/audit/log', (req, res) => {
  console.log('📊 收到審計事件:', req.body);
  res.json({
    success: true,
    message: '審計事件已記錄（維護模式）'
  });
});

// API 根端點
app.get('/api', (req, res) => {
  res.json({
    message: '歡迎使用 Express PostgreSQL API（維護模式）',
    version: '1.0.0',
    status: 'maintenance',
    endpoints: {
      books: '/api/books',
      audit: '/api/audit',
      auth: '/api/auth',
      userBooks: '/api/user-books',
      analytics: '/api/analytics',
      comments: '/api/comments'
    }
  })
})

// 404 錯誤處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API 端點未找到'
  })
})

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('❌ Error caught by handler:', err && (err.stack || err))
  let status = err && (err.status || err.statusCode) || 500
  let message = '伺服器錯誤'

  res.status(status).json({
    success: false,
    message,
    error: err && err.message
  })
})

function listenOnAvailablePort(app, preferredPort) {
  return new Promise((resolve) => {
    const server = app.listen(preferredPort)
    server.on('listening', () => resolve({ server, port: preferredPort }))
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        const nextPort = preferredPort + 1
        console.warn(`⚠️  埠號 ${preferredPort} 已被佔用，改嘗試 ${nextPort} ...`)
        resolve(listenOnAvailablePort(app, nextPort))
      } else {
        throw err
      }
    })
  })
}

async function start() {
  try {
    console.log('🌐 環境:', process.env.NODE_ENV || 'development')
    console.log('🔧 環境變數狀態檢查:')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '已設定' : '未設定')
    console.log('DB_HOST:', process.env.DB_HOST || '未設定')
    console.log('PORT:', process.env.PORT || '3000')
    
    // 啟動服務器
    console.log('🚀 啟動服務器（維護模式）...')
    const { port } = await listenOnAvailablePort(app, DEFAULT_PORT)
    console.log(`✅ 服務器啟動成功!`)
    console.log(`📍 監聽端口: ${port}`)
    console.log(`🌐 監聽地址: 0.0.0.0`)
    console.log(`🏥 健康檢查: http://localhost:${port}/health`)
    console.log(`🔐 登入測試: http://localhost:${port}/api/auth/login`)
    console.log('')
    console.log('🚀 應用程式正在運行（維護模式）...')
    console.log('⚠️  注意：資料庫功能暫時不可用，使用模擬數據')
    
  } catch (error) {
    console.error('❌ 啟動過程中發生錯誤：', error.message)
    process.exit(1)
  }
}

start()
