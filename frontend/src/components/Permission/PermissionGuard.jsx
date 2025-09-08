import React from 'react'
import { hasPagePermission, hasFeaturePermission } from '../../router/permissionMap'

// 頁面權限組件
export const PagePermissionGuard = ({ pageName, userPermissions, children, fallback = null }) => {
  const hasPermission = hasPagePermission(pageName, userPermissions)
  
  if (!hasPermission) {
    return fallback
  }
  
  return children
}

// 功能權限組件
export const FeaturePermissionGuard = ({ featureName, userPermissions, children, fallback = null }) => {
  const hasPermission = hasFeaturePermission(featureName, userPermissions)
  
  if (!hasPermission) {
    return fallback
  }
  
  return children
}

// 權限按鈕組件
export const PermissionButton = ({ 
  featureName, 
  userPermissions, 
  children, 
  onClick, 
  className = '',
  disabled = false 
}) => {
  const hasPermission = hasFeaturePermission(featureName, userPermissions)
  
  if (!hasPermission) {
    return null // 沒有權限就不顯示按鈕
  }
  
  return (
    <button 
      onClick={onClick} 
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// 權限連結組件
export const PermissionLink = ({ 
  pageName, 
  userPermissions, 
  children, 
  to, 
  className = ''
}) => {
  const hasPermission = hasPagePermission(pageName, userPermissions)
  
  if (!hasPermission) {
    return null // 沒有權限就不顯示連結
  }
  
  return (
    <a href={to} className={className}>
      {children}
    </a>
  )
} 