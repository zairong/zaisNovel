// 引入非同步處理工具
const { asyncHandler } = require('./asyncHandler')
// 引入審計日誌中間件
const { auditLog } = require('../middleware')
// 將常用中介層（如 auditLog + asyncHandler）包一層，讓路由更精簡
// 用法：router.get('/', ...wrap(optionalAuth)(ctrl.listBooks))
const wrap = (...middlewares) => (handler) => {
  return [...middlewares, auditLog, asyncHandler(handler)]
}

// 若不想紀錄審計，可用這個
const wrapNoAudit = (...middlewares) => (handler) => {
  return [...middlewares, asyncHandler(handler)]
}

module.exports = { wrap, wrapNoAudit }


