const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware')
const { can } = require('../middleware/roles')
const { authController: ctrl } = require('../controllers')
const { wrap, wrapNoAudit } = require('../utils/http')

// 一般不需要驗證的登入註冊可以不記審計（也可改用 wrap 看需求）
router.post('/register', ...wrapNoAudit()(ctrl.register))
router.post('/login', ...wrapNoAudit()(ctrl.login))

router.get('/me', ...wrap(authenticate)(ctrl.me))
router.put('/profile', ...wrap(authenticate)(ctrl.updateProfile))
router.post('/apply-author', ...wrap(authenticate)(ctrl.applyAuthor))
router.put('/author-applications/:userId', ...wrap(authenticate, can.admin)(ctrl.reviewAuthorApplication))
router.put('/change-password', ...wrap(authenticate)(ctrl.changePassword))
router.get('/users', ...wrap(authenticate, can.admin)(ctrl.listUsers))
router.put('/users/:id/status', ...wrap(authenticate, can.admin)(ctrl.updateUserStatus))
router.put('/users/:id/role', ...wrap(authenticate, can.admin)(ctrl.updateUserRole))
router.delete('/users/:id', ...wrap(authenticate, can.admin)(ctrl.deleteUser))

module.exports = router


