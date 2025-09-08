// 測試登入流程和狀態同步
console.log('🧪 開始測試登入流程...');

// 模擬 localStorage
const mockLocalStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
    console.log(`📝 localStorage.setItem(${key}, ${value})`);
  },
  removeItem(key) {
    delete this.data[key];
    console.log(`🗑️ localStorage.removeItem(${key})`);
  }
};

// 模擬 authService
const mockAuthService = {
  login: async (username, password) => {
    console.log(`🔐 模擬登入: ${username}`);
    
    // 模擬成功登入
    const mockUser = {
      id: 1,
      username: username,
      role: username === 'admin' ? 'admin' : 'user',
      email: `${username}@example.com`
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    // 儲存到 localStorage
    mockLocalStorage.setItem('token', mockToken);
    mockLocalStorage.setItem('user', JSON.stringify(mockUser));
    
    return {
      success: true,
      message: '登入成功',
      data: {
        user: mockUser,
        token: mockToken
      }
    };
  },
  
  getCurrentUser() {
    const userStr = mockLocalStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  getToken() {
    return mockLocalStorage.getItem('token');
  },
  
  getUserPermissions() {
    const user = this.getCurrentUser();
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

    return {
      isAuthenticated: true,
      canManageBooks: user.role === 'admin',
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
  },
  
  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : 'guest';
  }
};

// 測試登入流程
async function testLoginFlow() {
  console.log('\n=== 測試 1: 初始狀態 ===');
  console.log('用戶:', mockAuthService.getCurrentUser());
  console.log('權限:', mockAuthService.getUserPermissions());
  console.log('角色:', mockAuthService.getUserRole());
  
  console.log('\n=== 測試 2: 執行登入 ===');
  const loginResult = await mockAuthService.login('admin', 'admin');
  console.log('登入結果:', loginResult);
  
  console.log('\n=== 測試 3: 登入後狀態 ===');
  console.log('用戶:', mockAuthService.getCurrentUser());
  console.log('權限:', mockAuthService.getUserPermissions());
  console.log('角色:', mockAuthService.getUserRole());
  
  console.log('\n=== 測試 4: 檢查 localStorage ===');
  console.log('token:', mockLocalStorage.getItem('token'));
  console.log('user:', mockLocalStorage.getItem('user'));
  
  console.log('\n=== 測試 5: 模擬狀態更新 ===');
  // 模擬狀態更新函數
  const updateAuthState = () => {
    console.log('🔄 更新認證狀態...');
    const currentUser = mockAuthService.getCurrentUser();
    const permissions = mockAuthService.getUserPermissions();
    const role = mockAuthService.getUserRole();
    
    console.log('更新後的狀態:');
    console.log('- 用戶:', currentUser);
    console.log('- 權限:', permissions);
    console.log('- 角色:', role);
    
    return { currentUser, permissions, role };
  };
  
  const updatedState = updateAuthState();
  console.log('狀態更新完成:', updatedState);
}

// 執行測試
testLoginFlow().then(() => {
  console.log('\n✅ 測試完成！');
}).catch(error => {
  console.error('❌ 測試失敗:', error);
});
