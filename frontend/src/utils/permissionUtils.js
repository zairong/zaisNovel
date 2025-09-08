// 權限管理工具 - 統一權限管理
import { 
  getPageConfig, 
  getFeatureConfig, 
  hasPagePermission, 
  hasFeaturePermission 
} from '../router/permissionMap'

// 權限檢查工具類
export class PermissionUtils {
  constructor(userPermissions = {}) {
    this.userPermissions = userPermissions
  }

  // 檢查頁面權限
  canAccessPage(pageName) {
    return hasPagePermission(pageName, this.userPermissions)
  }

  // 檢查功能權限
  canUseFeature(featureName) {
    return hasFeaturePermission(featureName, this.userPermissions)
  }

  // 獲取頁面配置
  getPageConfig(pageName) {
    return getPageConfig(pageName)
  }

  // 獲取功能配置
  getFeatureConfig(featureName) {
    return getFeatureConfig(featureName)
  }

  // 檢查是否需要認證
  requiresAuth(pageName) {
    const config = this.getPageConfig(pageName)
    return config.requiresAuth
  }

  // 檢查功能是否需要認證
  featureRequiresAuth(featureName) {
    const config = this.getFeatureConfig(featureName)
    return config.requiresAuth
  }

  // 獲取用戶角色
  getUserRole() {
    const { userPermissions } = this
    
    if (userPermissions.isAdmin) return 'admin'
    if (userPermissions.canManageBooks) return 'editor'
    if (userPermissions.isAuthenticated) return 'viewer'
    return 'guest'
  }

  // 檢查是否為管理員
  isAdmin() {
    return this.userPermissions.isAdmin === true
  }

  // 檢查是否已登入
  isAuthenticated() {
    return this.userPermissions.isAuthenticated === true
  }

  // 批量檢查多個頁面權限
  canAccessPages(pageNames) {
    return pageNames.every(pageName => this.canAccessPage(pageName))
  }

  // 批量檢查多個功能權限
  canUseFeatures(featureNames) {
    return featureNames.every(featureName => this.canUseFeature(featureName))
  }

  // 獲取可訪問的頁面列表
  getAccessiblePages() {
    const allPages = ['home', 'books', 'reports', 'admin', 'users', 'settings', 'about']
    return allPages.filter(pageName => this.canAccessPage(pageName))
  }

  // 獲取可使用的功能列表
  getAccessibleFeatures() {
    const allFeatures = ['createBook', 'editBook', 'deleteBook', 'viewReports', 'manageUsers', 'systemSettings']
    return allFeatures.filter(featureName => this.canUseFeature(featureName))
  }

  // 生成權限報告
  generatePermissionReport() {
    return {
      userRole: this.getUserRole(),
      isAuthenticated: this.isAuthenticated(),
      isAdmin: this.isAdmin(),
      accessiblePages: this.getAccessiblePages(),
      accessibleFeatures: this.getAccessibleFeatures(),
      allPermissions: this.userPermissions
    }
  }
}

// 權限配置驗證工具
export class PermissionValidator {
  // 驗證頁面配置
  static validatePageConfig(pageName, config) {
    const errors = []
    
    if (typeof config.requiresAuth !== 'boolean') {
      errors.push(`${pageName}: requiresAuth 必須是布林值`)
    }
    
    if (!Array.isArray(config.permissions)) {
      errors.push(`${pageName}: permissions 必須是陣列`)
    }
    
    return errors
  }

  // 驗證功能配置
  static validateFeatureConfig(featureName, config) {
    const errors = []
    
    if (typeof config.requiresAuth !== 'boolean') {
      errors.push(`${featureName}: requiresAuth 必須是布林值`)
    }
    
    if (!Array.isArray(config.permissions)) {
      errors.push(`${featureName}: permissions 必須是陣列`)
    }
    
    return errors
  }

  // 驗證整個權限映射表
  static validatePermissionMap(permissionMap) {
    const errors = []
    
    // 驗證頁面配置
    Object.entries(permissionMap.pages).forEach(([pageName, config]) => {
      errors.push(...this.validatePageConfig(pageName, config))
    })
    
    // 驗證功能配置
    Object.entries(permissionMap.features).forEach(([featureName, config]) => {
      errors.push(...this.validateFeatureConfig(featureName, config))
    })
    
    return errors
  }
}

// 權限配置生成器
export class PermissionConfigGenerator {
  // 生成頁面配置
  static generatePageConfig(requiresAuth = false, permissions = []) {
    return {
      requiresAuth,
      permissions
    }
  }

  // 生成功能配置
  static generateFeatureConfig(requiresAuth = false, permissions = []) {
    return {
      requiresAuth,
      permissions
    }
  }

  // 生成公開頁面配置
  static generatePublicPageConfig() {
    return this.generatePageConfig(false, [])
  }

  // 生成需要認證的頁面配置
  static generateAuthPageConfig(permissions = []) {
    return this.generatePageConfig(true, permissions)
  }

  // 生成管理員頁面配置
  static generateAdminPageConfig() {
    return this.generatePageConfig(true, ['isAdmin'])
  }
} 