import { routes } from './index.jsx'

// 根據路徑獲取路由資訊
export const getRouteByPath = (path) => {
  // 先嘗試完全匹配
  let route = routes.find(route => route.path === path)
  
  // 如果沒有完全匹配，嘗試動態路由匹配
  if (!route) {
    route = routes.find(route => {
      // 將路由路徑轉換為正則表達式
      const routePath = route.path.replace(/:\w+/g, '[^/]+')
      const regex = new RegExp(`^${routePath}$`)
      return regex.test(path)
    })
  }
  
  return route
}

// 根據路徑獲取路由標題
export const getRouteTitle = (path) => {
  const route = getRouteByPath(path)
  return route ? route.title : '未知頁面'
}

// 根據路徑獲取路由描述
export const getRouteDescription = (path) => {
  const route = getRouteByPath(path)
  return route ? route.description : ''
}

// 根據路徑獲取路由圖示
export const getRouteIcon = (path) => {
  const route = getRouteByPath(path)
  return route?.meta?.icon || '📄'
}

// 檢查路徑是否為有效路由
export const isValidRoute = (path) => {
  return getRouteByPath(path) !== undefined
}

// 獲取所有路由路徑
export const getAllPaths = () => {
  return routes.map(route => route.path)
}

// 獲取導航選單資料
export const getNavigationMenu = (userPermissions = {}) => {
  return routes
    .filter(route => {
      // 過濾掉動態路由（包含參數的路由）
      if (route.path.includes(':')) {
        return false
      }
      
      // 過濾掉「申請成為作者」頁（不顯示於導航）
      if (route.path === '/apply-author') {
        return false
      }

      // 過濾掉登入/註冊頁面
      if (route.path === '/auth') {
        return false
      }
      
      // 檢查權限 
      if (route.meta?.requiresAuth && !userPermissions.isAuthenticated) {
        return false
      }
      
      // 檢查特定權限
      if (route.meta?.permissions?.length > 0) {
        const hasPermission = route.meta.permissions.some(
          permission => userPermissions[permission]
        )
        if (!hasPermission) {
          return false
        }
      }
      
      return true
    })
    .map(route => ({
      path: route.path,
      title: route.title,
      description: route.description,
      icon: route.meta?.icon || 'home'
    }))
}

// 路由守衛函數
export const routeGuard = (path, userPermissions = {}) => {
  const route = getRouteByPath(path)
  
  if (!route) {
    return { allowed: false, redirect: '/' }
  }
  
  // 檢查是否需要認證
  if (route.meta?.requiresAuth && !userPermissions.isAuthenticated) {
    return { allowed: false, redirect: '/auth' }
  }
  
  // 檢查特定權限
  if (route.meta?.permissions?.length > 0) {
    const hasPermission = route.meta.permissions.some(
      permission => userPermissions[permission]
    )
    if (!hasPermission) {
      return { allowed: false, redirect: '/' }
    }
  }
  
  return { allowed: true }
}

// 檢查用戶是否有權限訪問特定路徑
export const canAccessRoute = (path, userPermissions = {}) => {
  const guardResult = routeGuard(path, userPermissions)
  return guardResult.allowed
}

// 獲取用戶可訪問的所有路由
export const getAccessibleRoutes = (userPermissions = {}) => {
  return routes.filter(route => {
    const guardResult = routeGuard(route.path, userPermissions)
    return guardResult.allowed
  })
} 