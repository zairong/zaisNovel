// 權限審計服務 - 記錄權限相關事件
class AuditService {
  constructor() {
    this.events = []
  }

  // 記錄權限拒絕事件
  logPermissionDenied(path, userPermissions, userId = null) {
    const event = {
      type: 'PERMISSION_DENIED',
      path,
      userPermissions,
      userId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
    
    this.events.push(event)
    this.sendToBackend(event)
    
    console.warn('權限拒絕事件:', event)
  }

  // 記錄權限通過事件
  logPermissionGranted(path, userPermissions, userId = null) {
    const event = {
      type: 'PERMISSION_GRANTED',
      path,
      userPermissions,
      userId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
    
    this.events.push(event)
    this.sendToBackend(event)
    
    console.log('權限通過事件:', event)
  }

  // 記錄角色切換事件
  logRoleSwitch(oldRole, newRole, userId = null) {
    const event = {
      type: 'ROLE_SWITCH',
      oldRole,
      newRole,
      userId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
    
    this.events.push(event)
    this.sendToBackend(event)
    
    console.log('角色切換事件:', event)
  }

  // 發送到後端
  async sendToBackend(event) {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE || '/api';
      const response = await fetch(`${API_BASE_URL}/audit/log`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ 審計事件已發送到後端:', event.type)
        return result
      } else {
        console.error('❌ 審計事件發送失敗:', response.status)
      }
    } catch (error) {
      console.error('❌ 審計事件發送錯誤:', error)
      // 如果後端不可用，保留本地記錄
      console.log('📝 審計事件保留在本地:', event.type)
    }
  }

  // 獲取本地審計記錄
  getLocalEvents() {
    return this.events
  }

  // 清除本地審計記錄
  clearLocalEvents() {
    this.events = []
  }
}

export default new AuditService() 