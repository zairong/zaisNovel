const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware')
const { can } = require('../middleware/roles')
const { authController: ctrl } = require('../controllers')
const { wrap, wrapNoAudit } = require('../utils/http')
const { validateJoi, validationSchemas } = require('../middleware/validation')
const { loginRateLimit, registerRateLimit } = require('../middleware/security')
const { catchAsync } = require('../middleware/errorHandler')

// 登入註冊路由（包含驗證和速率限制）
router.post('/register', 
  registerRateLimit,
  validateJoi(validationSchemas.userRegister),
  catchAsync(ctrl.register)
)

router.post('/login', 
  loginRateLimit,
  validateJoi(validationSchemas.userLogin),
  catchAsync(ctrl.login)
)

// 需要認證的路由
router.get('/me', authenticate, catchAsync(ctrl.me))
router.put('/profile', 
  authenticate, 
  catchAsync(ctrl.updateProfile)
)
router.post('/apply-author', 
  authenticate, 
  catchAsync(ctrl.applyAuthor)
)
router.put('/change-password', 
  authenticate,
  validateJoi(validationSchemas.changePassword),
  catchAsync(ctrl.changePassword)
)

// 管理員路由
router.put('/author-applications/:userId', 
  authenticate, 
  can.admin, 
  catchAsync(ctrl.reviewAuthorApplication)
)
router.get('/users', 
  authenticate, 
  can.admin, 
  catchAsync(ctrl.listUsers)
)
router.put('/users/:id/status', 
  authenticate, 
  can.admin, 
  catchAsync(ctrl.updateUserStatus)
)
router.put('/users/:id/role', 
  authenticate, 
  can.admin, 
  catchAsync(ctrl.updateUserRole)
)
router.delete('/users/:id', 
  authenticate, 
  can.admin, 
  catchAsync(ctrl.deleteUser)
)

module.exports = router


