const { User, AuditLog } = require('../models')
const { Op } = require('sequelize')
const { generateToken } = require('../middleware/auth')
const { validationSchemas } = require('../middleware/validation')

// 註冊
async function register(req, res) {
  try {
    // 輸入驗證
    const { error, value } = validationSchemas.userRegister.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: '輸入驗證失敗',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      })
    }

    const { username, email, password, age_range } = value

    const existingUser = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } })
    if (existingUser) {
      return res.status(400).json({ success: false, message: '用戶名或電子郵件已存在' })
    }

    const user = await User.create({ username, email, password, role: 'user', age_range })
    const token = generateToken(user)
    return res.status(201).json({ success: true, message: '註冊成功', data: { user: user.toJSON(), token } })
  } catch (err) {
    console.error('註冊錯誤:', err)
    return res.status(500).json({ success: false, message: '註冊過程發生錯誤' })
  }
}

// 登入
async function login(req, res) {
  try {
    // 輸入驗證
    const { error, value } = validationSchemas.userLogin.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: '輸入驗證失敗',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      })
    }

    const { username, password } = value
    const user = await User.findOne({ where: { [Op.or]: [{ username }, { email: username }] } })
    if (!user) return res.status(401).json({ success: false, message: '用戶名或密碼錯誤' })

    const isValidPassword = await user.validatePassword(password)
    if (!isValidPassword) return res.status(401).json({ success: false, message: '用戶名或密碼錯誤' })
    if (!user.is_active) return res.status(401).json({ success: false, message: '帳戶已被停用' })

    await user.update({ last_login: new Date() })
    const token = generateToken(user)
    return res.json({ success: true, message: '登入成功', data: { user: user.toJSON(), token } })
  } catch (err) {
    console.error('登入錯誤:', err)
    return res.status(500).json({ success: false, message: '登入過程發生錯誤' })
  }
}

// 取得當前用戶
async function me(req, res) {
  return res.json({ success: true, data: { user: req.user.toJSON() } })
}

// 更新個資
async function updateProfile(req, res) {
  const { username, email, profile } = req.body
  const updateData = {}
  if (username) updateData.username = username
  if (email) updateData.email = email
  if (profile) updateData.profile = profile
  await req.user.update(updateData)
  return res.json({ success: true, message: '資料更新成功', data: { user: req.user.toJSON() } })
}

// 申請成為作者
async function applyAuthor(req, res) {
  const { reason, portfolio, experience, termsAccepted } = req.body
  if (!termsAccepted) {
    return res.status(400).json({ success: false, message: '請先勾選同意條款' })
  }
  if (req.user.role === 'author') {
    return res.status(400).json({ success: false, message: '您已經是作者了' })
  }
  if (req.user.role === 'admin') {
    return res.status(400).json({ success: false, message: '管理員不需要申請作者權限' })
  }

  const applicationData = {
    user_id: req.user.id,
    reason: reason || '',
    portfolio: portfolio || '',
    experience: experience || '',
    status: 'approved',
    applied_at: new Date(),
    approved_at: new Date()
  }
  await AuditLog.create({
    user_id: req.user.id,
    action: 'AUTHOR_APPLICATION_AUTO_APPROVED',
    resource_type: 'author_application',
    resource_id: req.user.id,
    details: applicationData,
    ip_address: req.ip || req.connection.remoteAddress,
    user_agent: req.get('User-Agent'),
    status: 'success'
  })

  await req.user.update({ role: 'author' })
  const token = generateToken(req.user)
  return res.json({ success: true, message: '恭喜！已升級為作者', data: { user: req.user.toJSON(), token } })
}

// 管理員：審核作者申請
async function reviewAuthorApplication(req, res) {
  const { userId } = req.params
  const { status, reason } = req.body
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: '無效的審核狀態' })
  }
  const user = await User.findByPk(userId)
  if (!user) return res.status(404).json({ success: false, message: '用戶不存在' })
  if (status === 'approved') await user.update({ role: 'author' })
  await AuditLog.create({
    user_id: req.user.id,
    action: 'AUTHOR_APPLICATION_REVIEW',
    resource_type: 'author_application',
    resource_id: userId,
    details: { status, reason, reviewed_by: req.user.id },
    ip_address: req.ip || req.connection.remoteAddress,
    user_agent: req.get('User-Agent'),
    status: 'success'
  })
  return res.json({ success: true, message: `作者申請已${status === 'approved' ? '批准' : '拒絕'}`, data: { user: user.toJSON() } })
}

// 更改密碼
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: '請提供當前密碼和新密碼' })
  }
  const isValidPassword = await req.user.validatePassword(currentPassword)
  if (!isValidPassword) {
    return res.status(400).json({ success: false, message: '當前密碼錯誤' })
  }
  await req.user.update({ password: newPassword })
  return res.json({ success: true, message: '密碼更改成功' })
}

// 管理員：CRUD 使用者
async function listUsers(req, res) {
  const { page = 1, limit = 10, search = '' } = req.query
  const offset = (page - 1) * limit
  const whereClause = {}
  if (search) {
    whereClause[Op.or] = [
      { username: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ]
  }
  const { count, rows: users } = await User.findAndCountAll({ where: whereClause, limit: parseInt(limit), offset: parseInt(offset), order: [['created_at', 'DESC']] })
  return res.json({ success: true, data: { users: users.map(u => u.toJSON()), pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / limit) } } })
}
// 更新用戶狀態
async function updateUserStatus(req, res) {
  const { id } = req.params
  const { is_active } = req.body
  const user = await User.findByPk(id)
  if (!user) return res.status(404).json({ success: false, message: '用戶不存在' })
  await user.update({ is_active })
  return res.json({ success: true, message: '用戶狀態更新成功', data: { user: user.toJSON() } })
}
// 更新用戶角色
async function updateUserRole(req, res) {
  const { id } = req.params
  const { role } = req.body
  if (!['admin', 'author', 'user'].includes(role)) {
    return res.status(400).json({ success: false, message: '無效的角色' })
  }
  const user = await User.findByPk(id)
  if (!user) return res.status(404).json({ success: false, message: '用戶不存在' })
  await user.update({ role })
  return res.json({ success: true, message: '用戶角色更新成功', data: { user: user.toJSON() } })
}
// 刪除用戶
async function deleteUser(req, res) {
  const { id } = req.params
  const user = await User.findByPk(id)
  if (!user) return res.status(404).json({ success: false, message: '用戶不存在' })
  if (user.id === req.user.id) return res.status(400).json({ success: false, message: '無法刪除自己的帳戶' })
  await user.destroy()
  return res.json({ success: true, message: '用戶刪除成功' })
}
// 導出控制器方法
module.exports = {
  register,
  login,
  me,
  updateProfile,
  applyAuthor,
  reviewAuthorApplication,
  changePassword,
  listUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser
}


