import { http } from '../utils/http';

// 移除重複的 API_BASE_URL 設定，直接使用 http 工具類

class AuthService {
  // 註冊
  async register(userData) {
    try {
      const response = await http.post('/auth/register', userData);
      if (response.success) {
        // 儲存 token 到 localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || '註冊失敗');
    }
  }

  // 登入
  async login(username, password) {
    try {
      const response = await http.post('/auth/login', { username, password });
      if (response.success) {
        // 儲存 token 到 localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || '登入失敗');
    }
  }

  // 登出
  async logout() {
    try {
      // 清除本地儲存的認證資訊
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: true, message: '登出成功' };
    } catch (error) {
      throw new Error(error.message || '登出失敗');
    }
  }

  // 獲取當前用戶
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // 獲取 token
  getToken() {
    return localStorage.getItem('token');
  }

  // 檢查是否已登入
  isAuthenticated() {
    return !!this.getToken();
  }

  // 獲取用戶資料
  async getUserProfile() {
    try {
      const response = await http.get('/auth/me');
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || '獲取用戶資料失敗');
    }
  }

  // 更新用戶資料
  async updateUserProfile(profileData) {
    try {
      const response = await http.put('/auth/profile', profileData);
      if (response.success) {
        // 更新本地儲存的用戶資料
        const currentUser = this.getCurrentUser();
        const updatedUser = { ...currentUser, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || '更新資料失敗');
    }
  }

  // 申請成為作者
  async applyAuthor(applicationData) {
    try {
      const response = await http.post('/auth/apply-author', applicationData);
      if (response.success) {
        // 直接使用後端返回的用戶資料更新本地儲存
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // 同時更新 token
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
      }
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || '申請失敗');
    }
  }

  // 獲取認證標頭
  getAuthHeaders() {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    console.log('🔑 認證服務 - Token 狀態:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : '無'
    });
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // 檢查認證狀態
  async checkAuth() {
    try {
      const token = this.getToken();
      if (!token) {
        console.log('🔑 沒有找到認證令牌，用戶未登入');
        return false;
      }
      
      const response = await http.get('/auth/me');
      return response.success;
    } catch (error) {
      // 401 錯誤是預期的，表示用戶未登入或令牌過期
      if (error.response?.status === 401) {
        console.log('🔒 認證令牌無效或過期，清除本地儲存');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
      
      // 其他錯誤才記錄為真正的錯誤
      console.error('❌ 認證檢查發生錯誤:', error.message);
      return false;
    }
  }

  // 獲取用戶權限
  getUserPermissions() {
    const user = this.getCurrentUser();
    console.log('🔍 getUserPermissions 用戶資料:', user ? { id: user.id, role: user.role } : null);
    
    if (!user) {
      return {
        isAuthenticated: false,
        canManageBooks: false,
        canUploadBooks: false,
        canDeleteBooks: false,
        canViewReports: false,
        canManageUsers: false,
        isAdmin: false,
        isAuthor: false,
        canViewBooks: false,
        canReadEbooks: false,
        canAccessLibrary: false
      };
    }

    const permissions = {
      isAuthenticated: true,
      canManageBooks: user.role === 'admin' || user.role === 'author',
      canUploadBooks: user.role === 'admin' || user.role === 'author',
      canDeleteBooks: user.role === 'admin',
      canViewReports: user.role === 'admin',
      canManageUsers: user.role === 'admin',
      isAdmin: user.role === 'admin',
      isAuthor: user.role === 'author',
      canViewBooks: true,
      canReadEbooks: true,
      canAccessLibrary: true
    };
    
    console.log('🔍 getUserPermissions 權限結果:', permissions);
    return permissions;
  }

  // 獲取用戶角色
  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : 'guest';
  }

  // 更新用戶資料（別名方法）
  async updateProfile(profileData) {
    return this.updateUserProfile(profileData);
  }

  // 更改密碼
  async changePassword(passwordData) {
    try {
      const response = await http.put('/auth/change-password', passwordData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || '更改密碼失敗');
    }
  }

  // 申請成為作者（別名方法）
  async applyForAuthor(applicationData) {
    return this.applyAuthor(applicationData);
  }

  // 管理員：審核作者申請
  async reviewAuthorApplication(userId, status, reason) {
    try {
      const response = await http.put(`/auth/author-applications/${userId}`, {
        status,
        reason
      });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || '審核失敗');
    }
  }

  // 管理員：獲取所有用戶列表
  async getAllUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      
      const url = `/auth/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await http.get(url);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || '獲取用戶列表失敗');
    }
  }

  // 管理員：更新用戶狀態
  async updateUserStatus(userId, isActive) {
    try {
      const response = await http.put(`/auth/users/${userId}/status`, {
        is_active: isActive
      });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || '更新用戶狀態失敗');
    }
  }

  // 管理員：更新用戶角色
  async updateUserRole(userId, role) {
    try {
      const response = await http.put(`/auth/users/${userId}/role`, {
        role: role
      });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || '更新用戶角色失敗');
    }
  }

  // 管理員：刪除用戶
  async deleteUser(userId) {
    try {
      const response = await http.delete(`/auth/users/${userId}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || '刪除用戶失敗');
    }
  }
}

export default new AuthService(); 