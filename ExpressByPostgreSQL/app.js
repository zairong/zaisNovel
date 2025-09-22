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
const PORT = parseInt(process.env.PORT || '3000', 10)

// 引入 API 路由模組
const apiRoutes = require('./api/index')

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

// API 路由設定
app.use('/api', apiRoutes)

// 404 錯誤處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API 端點未找到'
  })
})

// 錯誤處理中間件
app.use((err, req, res, next) => {
  // 更完整的錯誤分類與回應
  console.error('❌ Error caught by handler:', err && (err.stack || err))
  let status = err && (err.status || err.statusCode) || 500
  let message = '伺服器錯誤'

  // 請求內容過大（body-parser）
  if (err && err.type === 'entity.too.large') {
    status = 413
    message = '請求內容過大'
  }
  // Sequelize 常見錯誤
  else if (err && (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeDatabaseError')) {
    status = 400
    message = err.message
  }

  res.status(status).json({
    success: false,
    message,
    error: err && err.message
  })
})

async function start() {
  console.log('🔧 環境變數狀態檢查:')
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '已設定' : '未設定')
  console.log('DB_HOST:', process.env.DB_HOST || '未設定')
  console.log('DB_PORT:', process.env.DB_PORT || '未設定')
  console.log('DB_NAME:', process.env.DB_NAME || '未設定')
  console.log('DB_USERNAME:', process.env.DB_USERNAME || '未設定')
  console.log('NODE_ENV:', process.env.NODE_ENV || '未設定')
  
  // 僅在指定的 PORT 上啟動（Render 只會將流量導向該 PORT）
  const server = app.listen(PORT, () => {
    console.log(`🚀 API 服務器正在運行於 http://localhost:${PORT}`)
    console.log(`📦 API 路由: /api`)
  })

  // 改善與代理/負載平衡器的連線穩定性
  // 避免與上游 60s 超時邊界過於接近
  server.keepAliveTimeout = 65000
  server.headersTimeout = 66000
  
  // 延遲測試資料庫連線，避免阻塞服務器啟動
  setTimeout(async () => {
    try {
      console.log('🔌 測試資料庫連線...')
      await sequelize.authenticate()
      console.log('✅ 資料庫連線成功')
      
      // 設定連線錯誤處理 (僅在開發環境)
      if (process.env.NODE_ENV === 'development') {
        sequelize.connectionManager.on('connect', (connection) => {
          console.log('🔗 新資料庫連線已建立')
        })
        
        sequelize.connectionManager.on('disconnect', (connection) => {
          console.log('🔌 資料庫連線已斷開')
        })
      }
      
      // 定期檢查連線健康狀態
      setInterval(async () => {
        try {
          await sequelize.authenticate()
          console.log('💚 資料庫連線健康檢查通過')
        } catch (error) {
          console.error('💔 資料庫連線健康檢查失敗:', error.message)
        }
      }, 300000) // 每 5 分鐘檢查一次
      
    } catch (error) {
      console.error('❌ 無法連線至資料庫：', error.message)
      console.error('👉 請檢查 .env 是否正確設定 DB_HOST/DB_PORT/DB_NAME/DB_USERNAME/DB_PASSWORD 或 DATABASE_URL')
      console.log('⚠️  服務器繼續運行，但資料庫功能可能不可用（不重啟服務器，避免埠號漂移）')
    }
  }, 5000) // 5秒後測試資料庫連線
}

start()