// 權限映射表 - 簡化權限管理
export const PERMISSION_MAP = {
  // 頁面權限映射（包含認證要求）
  pages: {
    home: {
      requiresAuth: false,
      permissions: []
    },
    auth: {
      requiresAuth: false,
      permissions: []
    },
    books: {
      requiresAuth: true,
      permissions: ['canManageBooks'] // 僅有管理書籍權限者可進入管理頁
    },
    userLibrary: {
      requiresAuth: true,
      permissions: []
    },
    userManagement: {
      requiresAuth: true,
      permissions: ['canManageUsers']
    },
    userInfo: {
      requiresAuth: true,
      permissions: []
    },
    ebooks: {
      requiresAuth: false,
      permissions: []
    },
    ebookReader: {
      requiresAuth: false,
      permissions: []
    },
    ebookUpload: {
      requiresAuth: true,
      permissions: ['canManageBooks']
    },
    ebookEditor: {
      requiresAuth: true,
      permissions: ['canManageBooks']
    },
    reports: {
      requiresAuth: true,
      permissions: ['canViewReports']
    },
    admin: {
      requiresAuth: true,
      permissions: ['isAdmin']
    },
    users: {
      requiresAuth: true,
      permissions: ['canManageUsers']
    },
    settings: {
      requiresAuth: true,
      permissions: ['isAdmin']
    },
    about: {
      requiresAuth: false,
      permissions: []
    }
  },

  // 功能權限映射
  features: {
    createBook: {
      requiresAuth: true,
      permissions: ['canManageBooks']
    },
    editBook: {
      requiresAuth: true,
      permissions: ['canManageBooks']
    },
    deleteBook: {
      requiresAuth: true,
      permissions: ['canDeleteBooks']
    },
    uploadEbook: {
      requiresAuth: true,
      permissions: ['canManageBooks']
    },
    editEbook: {
      requiresAuth: true,
      permissions: ['canManageBooks']
    },
    readEbook: {
      requiresAuth: false,
      permissions: []
    },
    downloadEbook: {
      requiresAuth: false,
      permissions: []
    },
    deleteEbook: {
      requiresAuth: true,
      permissions: ['canDeleteBooks']
    },
    viewReports: {
      requiresAuth: true,
      permissions: ['canViewReports']
    },
    manageUsers: {
      requiresAuth: true,
      permissions: ['canManageUsers']
    },
    systemSettings: {
      requiresAuth: true,
      permissions: ['isAdmin']
    }
  },

  // 角色權限映射
  roles: {
    guest: {
      isAuthenticated: false,
      canManageBooks: false,
      canDeleteBooks: false,
      canViewReports: false,
      canManageUsers: false,
      isAdmin: false,
      canViewBooks: false,
      canReadEbooks: true,
      canAccessLibrary: false
    },
    user: {
      isAuthenticated: true,
      canManageBooks: false, // 一般用戶不能管理書籍
      canUploadBooks: false, // 一般用戶不能上傳書籍
      canDeleteBooks: false,
      canViewReports: false,
      canManageUsers: false,
      isAdmin: false,
      isAuthor: false,
      canViewBooks: true, // 可以查看書籍
      canReadEbooks: true, // 可以閱讀電子書
      canAccessLibrary: true // 可以訪問個人書庫
    },
    author: {
      isAuthenticated: true,
      canManageBooks: true, // 作者可以管理書籍
      canUploadBooks: true, // 作者可以上傳書籍
      canDeleteBooks: false,
      canViewReports: false,
      canManageUsers: false,
      isAdmin: false,
      isAuthor: true,
      canViewBooks: true,
      canReadEbooks: true,
      canAccessLibrary: true
    },
    admin: {
      isAuthenticated: true,
      canManageBooks: true,
      canUploadBooks: true,
      canDeleteBooks: true,
      canViewReports: true,
      canManageUsers: true,
      isAdmin: true,
      isAuthor: false,
      canViewBooks: true,
      canReadEbooks: true,
      canAccessLibrary: true
    }
  }
}

// 獲取頁面權限配置
export const getPageConfig = (pageName) => {
  return PERMISSION_MAP.pages[pageName] || {
    requiresAuth: false,
    permissions: []
  }
}

// 獲取功能權限配置
export const getFeatureConfig = (featureName) => {
  return PERMISSION_MAP.features[featureName] || {
    requiresAuth: false,
    permissions: []
  }
}

// 獲取角色權限
export const getRolePermissions = (roleName) => {
  return PERMISSION_MAP.roles[roleName] || PERMISSION_MAP.roles.guest
}

// 檢查用戶是否有頁面權限（包含認證檢查）
export const hasPagePermission = (pageName, userPermissions) => {
  const config = getPageConfig(pageName)
  
  // 檢查認證要求
  if (config.requiresAuth && !userPermissions.isAuthenticated) {
    return false
  }
  
  // 檢查特定權限
  if (config.permissions.length > 0) {
    return config.permissions.some(permission => userPermissions[permission])
  }
  
  return true
}

// 檢查用戶是否有功能權限（包含認證檢查）
export const hasFeaturePermission = (featureName, userPermissions) => {
  const config = getFeatureConfig(featureName)
  
  // 檢查認證要求
  if (config.requiresAuth && !userPermissions.isAuthenticated) {
    return false
  }
  
  // 檢查特定權限
  if (config.permissions.length > 0) {
    return config.permissions.some(permission => userPermissions[permission])
  }
  
  return true
}

// 獲取頁面認證要求
export const getPageAuthRequirement = (pageName) => {
  const config = getPageConfig(pageName)
  return config.requiresAuth
}

// 獲取功能認證要求
export const getFeatureAuthRequirement = (featureName) => {
  const config = getFeatureConfig(featureName)
  return config.requiresAuth
}

// 獲取頁面權限列表
export const getPagePermissions = (pageName) => {
  const config = getPageConfig(pageName)
  return config.permissions
}

// 獲取功能權限列表
export const getFeaturePermissions = (featureName) => {
  const config = getFeatureConfig(featureName)
  return config.permissions
} 