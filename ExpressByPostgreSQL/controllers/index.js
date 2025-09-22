// Barrel export for controllers
module.exports = {
  // 認證控制器
  authController: require('./authController'),
  // 書籍控制器
  bookController: require('./bookController'),
  // 用戶書籍控制器
  userBookController: require('./userBookController'),
  // 審計控制器
  auditController: require('./auditController'),
  // 分析控制器
  analyticsController: require('./analyticsController'),
  // 評論控制器
  commentController: require('./commentController')
}


