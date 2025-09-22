// 目前沿用記憶體模擬審計資料，若要切到 DB 可改用 models.AuditLog
let auditLogs = []
// 審計事件記錄
async function logEvent(req, res) {
  const { type, path, userPermissions, userId, oldRole, newRole, userAgent, timestamp } = req.body
  const auditEvent = {
    id: Date.now(),
    type,
    path,
    userPermissions,
    userId,
    oldRole,
    newRole,
    userAgent,
    timestamp: timestamp || new Date().toISOString(),
    ip: req.ip,
    method: req.method
  }
  auditLogs.push(auditEvent)
  return res.json({ success: true, message: '審計事件已記錄', eventId: auditEvent.id })
}

// 審計日誌列表
async function listLogs(req, res) {
  const { type, userId, startDate, endDate, limit = 100 } = req.query
  let filtered = [...auditLogs]
  if (type) filtered = filtered.filter(l => l.type === type)
  if (userId) filtered = filtered.filter(l => l.userId === userId)
  if (startDate) filtered = filtered.filter(l => l.timestamp >= startDate)
  if (endDate) filtered = filtered.filter(l => l.timestamp <= endDate)
  filtered = filtered.slice(-limit)
  return res.json({ success: true, logs: filtered, total: filtered.length })
}

// 審計統計
async function stats(req, res) {
  const stats = {
    totalEvents: auditLogs.length,
    permissionDenied: auditLogs.filter(l => l.type === 'PERMISSION_DENIED').length,
    permissionGranted: auditLogs.filter(l => l.type === 'PERMISSION_GRANTED').length,
    roleSwitches: auditLogs.filter(l => l.type === 'ROLE_SWITCH').length,
    recentEvents: auditLogs.slice(-10)
  }
  return res.json({ success: true, stats })
}

// 創建審計日誌（用於其他控制器）
async function createAuditLog(auditData) {
  try {
    const auditEvent = {
      id: Date.now(),
      type: auditData.action || 'SYSTEM',
      path: auditData.resource_type || 'unknown',
      userPermissions: auditData.details || {},
      userId: auditData.user_id || null,
      userAgent: auditData.user_agent || 'unknown',
      timestamp: new Date().toISOString(),
      ip: auditData.ip_address || 'unknown',
      method: 'AUDIT_LOG'
    }
    auditLogs.push(auditEvent)
    console.log('審計日誌已記錄:', auditEvent.type)
    return auditEvent
  } catch (error) {
    console.error('審計日誌記錄失敗:', error)
    // 不拋出錯誤，避免影響主要功能
    return null
  }
}

// 導出控制器方法
module.exports = { logEvent, listLogs, stats, createAuditLog }


