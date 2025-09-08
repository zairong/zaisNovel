import { useMemo } from 'react'
import { hasPagePermission, hasFeaturePermission } from '../router/permissionMap'

// 權限 Hook
export const usePermissions = (userPermissions = {}) => {
  const permissions = useMemo(() => ({
    // 檢查頁面權限
    canAccessPage: (pageName) => hasPagePermission(pageName, userPermissions),
    
    // 檢查功能權限
    canUseFeature: (featureName) => hasFeaturePermission(featureName, userPermissions),
    
    // 檢查多個權限（任一）
    canAccessAny: (permissionList) => permissionList.some(permission => userPermissions[permission]),
    
    // 檢查多個權限（全部）
    canAccessAll: (permissionList) => permissionList.every(permission => userPermissions[permission]),
    
    // 獲取用戶角色
    getUserRole: () => {
      if (userPermissions.isAdmin) return 'admin'
      if (userPermissions.canManageBooks) return 'editor'
      if (userPermissions.isAuthenticated) return 'viewer'
      return 'guest'
    },
    
    // 檢查是否為管理員
    isAdmin: () => userPermissions.isAdmin === true,
    
    // 檢查是否已登入
    isAuthenticated: () => userPermissions.isAuthenticated === true,
    
    // 獲取所有權限
    getAllPermissions: () => userPermissions
  }), [userPermissions])

  return permissions
}

// 簡化的權限檢查 Hook
export const usePermission = (userPermissions = {}) => {
  return {
    // 頁面權限檢查
    page: (pageName) => hasPagePermission(pageName, userPermissions),
    
    // 功能權限檢查
    feature: (featureName) => hasFeaturePermission(featureName, userPermissions),
    
    // 直接權限檢查
    has: (permissionName) => userPermissions[permissionName] === true
  }
} 