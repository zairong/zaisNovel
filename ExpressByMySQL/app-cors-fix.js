// 只在沒有環境變數時載入 .env 文件
if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  require('dotenv').config()
}
const express = require('express')
const methodOverride = require('method-override')
const path = require('path')
const cors = require('cors')
const app = express()
const { sequelize } = require('./models')
const DEFAULT_PORT = parseInt(process.env.PORT || '3000', 10)

// 引入 API 路由模組
const apiRoutes = require('./api/index')

// 強化版 CORS 配置
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
    
    console.log('🔍 CORS 檢查來源:', origin);
    
    // 允許沒有 origin 的請求（如移動應用程式或 Postman）
    if (!origin) {
      console.log('✅ 允許無來源請求');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ 允許來源:', origin);
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

// 應用 CORS 中間件
app.use(cors(corsOptions))

// 手動設置 CORS 標頭（備用方案）
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://zaisnovel-frontend.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept, Cache-Control, Pragma');
  
  // 處理預檢請求
  if (req.method === 'OPTIONS') {
    console.log('🔄 處理 OPTIONS 預檢請求:', req.url);
    return res.status(200).end();
  }
  
  next();
});

// 調試中間件
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

// 基本中間件
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

// API 路由
app.use('/api', apiRoutes)

// CORS 測試端點
app.get('/api/cors-test', (req, res) => {
  res.status(200).json({
    status: 'CORS 修復成功',
    timestamp: new Date().toISOString(),
    origin: req.get('Origin') || 'no-origin',
    userAgent: req.get('User-Agent') || 'no-user-agent',
    message: 'CORS 配置正常工作',
    corsHeaders: {
      'Access-Control-Allow-Origin': res.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': res.get('Access-Control-Allow-Credentials'),
      'Access-Control-Allow-Methods': res.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': res.get('Access-Control-Allow-Headers')
    }
  })
})

// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  })
})

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('❌ 錯誤:', err);
  
  if (err.message === '不允許的 CORS 來源') {
    return res.status(403).json({ 
      error: 'CORS 不允許的來源',
      origin: req.headers.origin,
      allowedOrigins: [
        'https://zaisnovel-frontend.onrender.com',
        'http://localhost:3000',
        'http://localhost:5173'
      ]
    });
  }
  
  res.status(500).json({ 
    error: '內部服務器錯誤',
    message: err.message 
  });
});

// 啟動服務器
const PORT = process.env.PORT || DEFAULT_PORT
app.listen(PORT, () => {
  console.log('🚀 CORS 修復服務器啟動成功')
  console.log('🔗 服務器地址: http://localhost:' + PORT)
  console.log('🔗 測試端點: http://localhost:' + PORT + '/api/cors-test')
  console.log('🔗 健康檢查: http://localhost:' + PORT + '/api/health')
  console.log('🌐 允許的來源:')
  console.log('  - https://zaisnovel-frontend.onrender.com')
  console.log('  - http://localhost:3000')
  console.log('  - http://localhost:5173')
  console.log('  - http://127.0.0.1:3000')
  console.log('  - http://127.0.0.1:5173')
})

module.exports = app
