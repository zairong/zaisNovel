#!/usr/bin/env node

/**
 * CORS 測試服務器
 * 專門用於測試跨域請求
 */

const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000

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

// 專門處理 OPTIONS 請求
app.options('*', (req, res) => {
  console.log('🔍 OPTIONS 請求:', req.method, req.url)
  console.log('🌐 Origin:', req.headers.origin)
  console.log('📋 Headers:', req.headers)
  
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept, Access-Control-Request-Method, Access-Control-Request-Headers')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Max-Age', '86400')
  res.sendStatus(200)
})

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
    cors: 'enabled'
  })
})

// 測試端點
app.get('/api/test', (req, res) => {
  console.log('🧪 測試端點請求')
  res.json({
    success: true,
    message: 'CORS 測試成功',
    timestamp: new Date().toISOString()
  })
})

// 認證測試端點
app.get('/api/auth/me', (req, res) => {
  console.log('🔐 認證測試請求')
  res.json({
    success: true,
    user: null,
    message: '未認證用戶'
  })
})

// 電子書測試端點
app.get('/api/books/ebooks', (req, res) => {
  console.log('📚 電子書測試請求')
  res.json({
    success: true,
    data: [],
    message: '測試模式 - 無電子書數據'
  })
})

// 審計測試端點
app.post('/api/audit/log', (req, res) => {
  console.log('📝 審計測試請求')
  res.json({
    success: true,
    message: '審計日誌已記錄'
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
app.listen(PORT, () => {
  console.log('🚀 CORS 測試服務器啟動成功')
  console.log(`📍 端口: ${PORT}`)
  console.log(`🏥 健康檢查: http://localhost:${PORT}/health`)
  console.log(`🧪 測試端點: http://localhost:${PORT}/api/test`)
  console.log(`🔐 認證測試: http://localhost:${PORT}/api/auth/me`)
  console.log(`📚 電子書測試: http://localhost:${PORT}/api/books/ebooks`)
  console.log('')
  console.log('🌐 允許的來源:')
  corsOptions.origin.forEach(origin => {
    console.log(`  - ${origin}`)
  })
})
