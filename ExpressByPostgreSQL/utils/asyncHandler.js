// 非同步處理工具
function asyncHandler(handler) {
  // 包裝處理函數
  return function wrappedHandler(req, res, next) {
    // 使用 Promise 包裝處理函數
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

module.exports = { asyncHandler }


