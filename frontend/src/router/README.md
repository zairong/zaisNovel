# RouteGuard 使用說明

## 概述

RouteGuard 是一個 React 路由守衛元件，用於保護路由並確保只有具有適當權限的用戶才能訪問特定頁面。

## 功能特點

1. **權限檢查**：檢查用戶是否具有訪問特定路由的權限
2. **自動重定向**：無權限時自動重定向到指定頁面
3. **動態導航**：根據用戶權限動態顯示導航選單
4. **靈活配置**：支援多種權限配置方式

## 使用步驟

### 1. 定義路由權限配置

在 `router/index.jsx` 中為每個路由定義權限要求：

```javascript
const routes = [
  {
    path: '/',
    element: <Home />,
    title: '首頁',
    meta: {
      requiresAuth: false,        // 是否需要認證
      permissions: [],            // 需要的特定權限
      icon: '🏠'
    }
  },
  {
    path: '/books',
    element: <Books />,
    title: '書籍管理',
    meta: {
      requiresAuth: true,         // 需要認證
      permissions: ['canManageBooks'], // 需要書籍管理權限
      icon: '📚'
    }
  }
]
```

### 2. 創建用戶權限狀態

在 App 元件中管理用戶權限狀態：

```javascript
const [userPermissions, setUserPermissions] = useState({
  isAuthenticated: false,    // 認證狀態
  canManageBooks: false      // 書籍管理權限
})
```

### 3. 使用 RouteGuard 包裝路由

```javascript
<RouteGuard userPermissions={userPermissions}>
  <AppRoutes />
</RouteGuard>
```

### 4. 實現登入/登出邏輯

```javascript
const handleLogin = () => {
  setUserPermissions({
    isAuthenticated: true,
    canManageBooks: true
  })
}

const handleLogout = () => {
  setUserPermissions({
    isAuthenticated: false,
    canManageBooks: false
  })
}
```

## 權限檢查邏輯

RouteGuard 使用以下邏輯檢查權限：

1. **路徑有效性**：檢查路徑是否存在於路由配置中
2. **認證要求**：如果路由需要認證但用戶未登入，則拒絕訪問
3. **特定權限**：檢查用戶是否具有路由要求的特定權限

## 工具函數

### routeGuard(path, userPermissions)
檢查特定路徑的權限，返回：
- `{ allowed: true }` - 有權限
- `{ allowed: false, redirect: '/' }` - 無權限，重定向到首頁

### canAccessRoute(path, userPermissions)
檢查用戶是否可以訪問特定路徑，返回布林值。

### getNavigationMenu(userPermissions)
根據用戶權限獲取可顯示的導航選單。

## 實際使用範例

### 基本使用
```javascript
// App.jsx
function App() {
  const [userPermissions, setUserPermissions] = useState({
    isAuthenticated: false,
    canManageBooks: false
  })

  return (
    <Router>
      <RouteGuard userPermissions={userPermissions}>
        <AppRoutes />
      </RouteGuard>
    </Router>
  )
}
```

### 進階權限配置
```javascript
// 支援多種權限類型
const userPermissions = {
  isAuthenticated: true,
  canManageBooks: true,
  canDeleteBooks: false,
  canViewReports: true,
  isAdmin: false
}

// 路由配置
{
  path: '/admin',
  meta: {
    requiresAuth: true,
    permissions: ['isAdmin']
  }
}
```

## 注意事項

1. **權限狀態管理**：確保用戶權限狀態在整個應用中保持一致
2. **重定向處理**：無權限時的重定向路徑應該是可以訪問的
3. **效能考量**：權限檢查應該快速執行，避免影響用戶體驗
4. **錯誤處理**：處理權限檢查過程中可能出現的錯誤

## 擴展功能

可以根據需求擴展 RouteGuard 功能：

1. **角色基礎權限**：支援角色系統
2. **時間基礎權限**：支援權限過期
3. **條件權限**：支援複雜的權限邏輯
4. **權限快取**：提高權限檢查效能 