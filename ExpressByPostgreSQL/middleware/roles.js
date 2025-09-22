const { requireRole } = require('./auth')
// 權限檢查
const can = {
  // 管理員
  admin: requireRole(['admin']),
  // 作者或管理員
  authorOrAdmin: requireRole(['admin', 'author'])
}

module.exports = { can }


