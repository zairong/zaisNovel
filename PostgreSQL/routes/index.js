const express = require('express')
// 引入 express 路由器
const router = express.Router()
// 引入書籍路由
const bookRoutes = require('./bookRoutes')
// 引入審計路由
const auditRoutes = require('./auditRoutes')
// 引入認證路由
const authRoutes = require('./authRoutes')
// 引入用戶書籍路由
const userBookRoutes = require('./userBookRoutes')
// 引入分析路由
const analyticsRoutes = require('./analyticsRoutes')
// 引入評論路由
const commentRoutes = require('./commentRoutes')
// 使用書籍路由
router.use('/books', bookRoutes)
// 使用審計路由
router.use('/audit', auditRoutes)
// 使用認證路由
router.use('/auth', authRoutes)
// 使用用戶書籍路由
router.use('/user-books', userBookRoutes)
// 使用分析路由
router.use('/analytics', analyticsRoutes)
// 使用評論路由
router.use('/comments', commentRoutes)
// 導出路由
router.get('/', (req, res) => {
  // 返回 API 端點
  res.json({
    // 訊息
    message: '歡迎使用 Express PostgreSQL API',
    // 版本
    version: '1.0.0',
    // 端點
    endpoints: {
      // 書籍端點
      books: '/api/books',
      // 審計端點
      audit: '/api/audit',
      // 認證端點
      auth: '/api/auth',
      // 用戶書籍端點
      userBooks: '/api/user-books',
      // 分析端點
      analytics: '/api/analytics',
      // 評論端點
      comments: '/api/comments'
    }
  })
})
// 健康檢查端點
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// CORS 測試端點
router.get('/cors-test', (req, res) => {
  res.status(200).json({ 
    status: 'CORS 正常',
    timestamp: new Date().toISOString(),
    origin: req.get('Origin') || 'no-origin',
    userAgent: req.get('User-Agent') || 'no-user-agent',
    headers: req.headers
  })
})

// 專門的 OPTIONS 測試端點
router.options('/cors-test', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.sendStatus(200)
})
// 導出路由
module.exports = router


