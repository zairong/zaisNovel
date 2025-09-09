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
    message: '歡迎使用 Express MySQL API',
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
// 導出路由
module.exports = router


