import React, { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { routeGuard } from './routerUtils'
import auditService from '../services/auditService'

// 路由守衛 - 前端權限保護
function RouteGuard({ children, userPermissions = {} }) {
  const location = useLocation()
  const [isChecking, setIsChecking] = useState(true)
  const [guardResult, setGuardResult] = useState(null)
  
  useEffect(() => {
    // 檢查當前路徑的權限
    const checkPermission = () => {
      console.log('RouteGuard 檢查權限:', { pathname: location.pathname, userPermissions })
      const result = routeGuard(location.pathname, userPermissions)
      console.log('RouteGuard 權限檢查結果:', result)
      setGuardResult(result)
      setIsChecking(false)
      
      // 記錄權限檢查結果
      if (result.allowed) {
        auditService.logPermissionGranted(location.pathname, userPermissions)
      } else {
        auditService.logPermissionDenied(location.pathname, userPermissions)
      }
    }
    
    // 立即檢查權限，不延遲
    checkPermission()
  }, [location.pathname, userPermissions])
  
  // 載入狀態
  if (isChecking) {
    return (
      <div className="permission-checking">
        <div className="checking-spinner">檢查權限中...</div>
      </div>
    )
  }
  
  // 權限檢查結果
  if (!guardResult.allowed) {
    console.log('權限檢查失敗，重定向到:', guardResult.redirect)
    // 如果需要重定向到登入頁面，保存當前路徑
    if (guardResult.redirect === '/auth') {
      return <Navigate to="/auth" state={{ from: location }} replace />
    }
    return <Navigate to={guardResult.redirect} replace />
  }
  
  // 權限通過，渲染子元件
  return children
}

export default RouteGuard 