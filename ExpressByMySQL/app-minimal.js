const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000

console.log('🚀 啟動最小化應用程式...')
console.log('📍 端口:', PORT)
console.log('🌐 環境:', process.env.NODE_ENV || 'production')

// CORS 設定
app.use(cors({
  origin: [
    'https://zaisnovel-frontend.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
}))

// 中間件
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 健康檢查
app.get('/health', (req, res) => {
  console.log('🏥 健康檢查請求')
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production'
  })
})

// 根路徑
app.get('/', (req, res) => {
  console.log('🌐 根路徑請求')
  res.json({
    message: 'Zai\'s Novel API Server - Minimal Version',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0-minimal'
  })
})

// 測試 API 端點
app.get('/api/test', (req, res) => {
  console.log('🧪 API 測試請求')
  res.json({
    success: true,
    message: 'API 測試成功',
    timestamp: new Date().toISOString()
  })
})

// 認證測試端點
app.get('/api/auth/me', (req, res) => {
  console.log('🔐 認證測試請求')
  res.json({
    success: true,
    user: null,
    message: '未認證用戶 - 測試模式'
  })
})

// 電子書測試端點
app.get('/api/books/ebooks', (req, res) => {
  console.log('📚 電子書測試請求')
  res.json({
    success: true,
    data: [],
    message: '測試模式 - 無電子書數據',
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0
    }
  })
})

// 審計測試端點
app.post('/api/audit/log', (req, res) => {
  console.log('📝 審計測試請求')
  res.json({
    success: true,
    message: '審計日誌已記錄 - 測試模式'
  })
})

// 404 處理
app.use('*', (req, res) => {
  console.log('❌ 404 請求:', req.method, req.url)
  res.status(404).json({
    success: false,
    message: '端點未找到',
    path: req.originalUrl
  })
})

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('❌ 錯誤:', err)
  res.status(500).json({
    success: false,
    message: '伺服器錯誤',
    error: err.message
  })
})

// 啟動服務器
app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ 服務器啟動成功!')
  console.log(`📍 監聽端口: ${PORT}`)
  console.log(`🌐 監聽地址: 0.0.0.0`)
  console.log(`🏥 健康檢查: http://localhost:${PORT}/health`)
  console.log(`🧪 測試端點: http://localhost:${PORT}/api/test`)
  console.log('')
  console.log('🚀 應用程式正在運行...')
})
