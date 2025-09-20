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

  // 檢查網路連接狀態
  isOnline() {
    return navigator.onLine;
  }

  // 發送到後端
  async sendToBackend(event) {
    // 檢查網路連接
    if (!this.isOnline()) {
      console.warn('🌐 網路離線，審計事件保留在本地:', event.type);
      return;
    }

    try {
      // 使用統一的 API 配置
      const { apiConfig } = await import('./config');
      const API_BASE_URL = import.meta.env.VITE_API_URL || apiConfig.baseURL;
      
      // 添加超時控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超時
      
      const response = await fetch(`${API_BASE_URL}/audit/log`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        // 檢查響應是否包含 JSON 內容
        const contentType = response.headers.get('content-type');
        let result = null;
        
        if (contentType && contentType.includes('application/json')) {
          try {
            result = await response.json();
          } catch (jsonError) {
            console.warn('審計響應 JSON 解析失敗，但請求成功:', jsonError);
            result = { success: true };
          }
        } else {
          result = { success: true };
        }
        
        console.log('✅ 審計事件已發送到後端:', event.type);
        return result;
      } else {
        console.error('❌ 審計事件發送失敗:', response.status);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('⏰ 審計事件發送超時，保留在本地:', event.type);
      } else if (error.message.includes('Failed to fetch') || error.message.includes('ERR_INTERNET_DISCONNECTED')) {
        console.warn('🌐 網路連接問題，審計事件保留在本地:', event.type);
      } else {
        console.error('❌ 審計事件發送錯誤:', error);
      }
      // 如果後端不可用，保留本地記錄
      console.log('📝 審計事件保留在本地:', event.type);
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