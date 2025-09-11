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

// 引入 API 路由模組
const apiRoutes = require('./api/index')

// CORS 中間件設定
const corsOptions = {
  origin: [
    'https://zaisnovel-frontend.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Origin',
    'Accept',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

// 專門處理 OPTIONS 請求的中間件
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept, Access-Control-Request-Method, Access-Control-Request-Headers')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Max-Age', '86400')
  res.sendStatus(200)
})

// 中間件設定
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(express.json({ limit: '2mb' }))
app.use(methodOverride('_method'))

// 靜態檔案
app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads/covers', express.static(path.join(__dirname, 'uploads', 'covers')))

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})

// 根路徑
app.get('/', (req, res) => {
  res.json({
    message: 'Zai\'s Novel API Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// API 路由設定
app.use('/api', apiRoutes)

// 404 錯誤處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API 端點未找到',
    path: req.originalUrl
  })
})

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('❌ Error caught by handler:', err && (err.stack || err))
  let status = err && (err.status || err.statusCode) || 500
  let message = '伺服器錯誤'

  if (err && err.type === 'entity.too.large') {
    status = 413
    message = '請求內容過大'
  } else if (err && (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeDatabaseError')) {
    status = 400
    message = err.message
  }

  res.status(status).json({
    success: false,
    message,
    error: err && err.message
  })
})

function listenOnAvailablePort(app, preferredPort) {
  return new Promise((resolve) => {
    const server = app.listen(preferredPort, '0.0.0.0', () => {
      console.log(`🚀 服務器正在監聽端口 ${preferredPort}`)
      resolve({ server, port: preferredPort })
    })
    
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        const nextPort = preferredPort + 1
        console.warn(`⚠️  端口 ${preferredPort} 已被佔用，嘗試 ${nextPort} ...`)
        resolve(listenOnAvailablePort(app, nextPort))
      } else {
        console.error('❌ 服務器啟動錯誤:', err)
        throw err
      }
    })
  })
}

async function start() {
  try {
    console.log('🔧 環境變數狀態檢查:')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '已設定' : '未設定')
    console.log('DB_HOST:', process.env.DB_HOST || '未設定')
    console.log('DB_PORT:', process.env.DB_PORT || '未設定')
    console.log('DB_NAME:', process.env.DB_NAME || '未設定')
    console.log('DB_USERNAME:', process.env.DB_USERNAME || '未設定')
    console.log('NODE_ENV:', process.env.NODE_ENV || '未設定')
    console.log('PORT:', process.env.PORT || '3000')
    
    // 先啟動服務器
    console.log('🚀 啟動服務器...')
    
  } catch (error) {
    console.error('❌ 啟動過程中發生錯誤：', error.message)
    process.exit(1)
  }

  const { port } = await listenOnAvailablePort(app, DEFAULT_PORT)
  console.log(`🚀 API 服務器正在運行於端口 ${port}`)
  console.log(`📦 API 路由: /api`)
  console.log(`🏥 健康檢查: /health`)
  console.log(`🌐 根路徑: /`)
  
  // 延遲測試資料庫連線
  setTimeout(async () => {
    try {
      const { sequelize } = require('./models')
      console.log('🔌 測試資料庫連線...')
      await sequelize.authenticate()
      console.log('✅ 資料庫連線成功')
    } catch (error) {
      console.error('❌ 資料庫連線失敗：', error.message)
      console.log('⚠️  服務器繼續運行，但資料庫功能可能不可用')
    }
  }, 10000) // 10秒後測試資料庫連線
}

start()
