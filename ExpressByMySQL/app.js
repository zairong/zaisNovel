require('dotenv').config()

// 驗證環境變數
const { validateEnvironment, getEnvironmentConfig } = require('./config/env-validation')
validateEnvironment()

const express = require('express')
const methodOverride = require('method-override')
const path = require('path')
const app = express()
const { sequelize } = require('./models')

// 獲取環境配置
const config = getEnvironmentConfig()
const DEFAULT_PORT = config.PORT

// 引入安全性中間件
const { 
  basicSecurity, 
  apiRateLimit, 
  corsConfig, 
  sqlInjectionProtection,
  requestSizeLimit
} = require('./middleware/security')

// 引入錯誤處理中間件
const { 
  globalErrorHandler, 
  notFoundHandler, 
  handleUncaughtException, 
  handleUnhandledRejection 
} = require('./middleware/errorHandler')

// 引入驗證中間件
const { sanitizeInput } = require('./middleware/validation')

// 引入 API 路由模組
const apiRoutes = require('./routes/index')

// 設置未捕獲異常處理
handleUncaughtException()
handleUnhandledRejection()

// 設定信任代理（用於生產環境如 Render、Heroku 等）
if (config.NODE_ENV === 'production') {
  app.set('trust proxy', 1) // 信任第一個代理
}

// 安全性中間件
app.use(basicSecurity)
app.use(corsConfig)
app.use(apiRateLimit)
app.use(requestSizeLimit('10mb'))
app.use(sqlInjectionProtection)

// 基本中間件設定
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(express.json({ limit: '10mb' }))
app.use(methodOverride('_method'))

// 輸入清理中間件
app.use(sanitizeInput)

// 靜態檔案
app.use(express.static(path.join(__dirname, 'public')))
// 封面圖片靜態檔案服務
app.use('/uploads/covers', express.static(path.join(__dirname, 'uploads', 'covers')))

// API 路由設定
app.use('/api', apiRoutes)

// 404 錯誤處理
app.use('*', notFoundHandler)

// 全域錯誤處理中間件
app.use(globalErrorHandler)

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
    console.log('🔌 測試資料庫連線...')
    await sequelize.authenticate()
    console.log('✅ 資料庫連線成功')
  } catch (error) {
    console.error('❌ 無法連線至資料庫：', error.message)
    console.error('👉 請檢查 .env 是否正確設定 DB_HOST/DB_PORT/DB_NAME/DB_USERNAME/DB_PASSWORD 或 DATABASE_URL')
    process.exit(1)
  }

  const { server, port } = await listenOnAvailablePort(app, DEFAULT_PORT)
  console.log(`🚀 API 服務器正在運行於 http://localhost:${port}`)
  console.log(`📦 API 路由: /api`)
  console.log(`🛡️  安全性中間件已啟用`)
  console.log(`⚡ 環境模式: ${config.NODE_ENV}`)

  // 設置優雅關閉
  const { handleGracefulShutdown } = require('./middleware/errorHandler')
  handleGracefulShutdown(server)
}

start()