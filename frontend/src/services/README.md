# 權限系統架構說明

## 🏗️ 權限設定的架構模式

### 1. **後端主導模式**（推薦）

```
後端 → 前端
├── 權限資料庫設計
├── 權限驗證邏輯
├── 權限 API 提供
└── 前端接收並顯示
```

**後端負責：**
- 權限資料庫設計和管理
- 權限驗證邏輯實作
- 權限 API 提供
- 安全性控制和防護
- 權限變更通知

**前端負責：**
- 接收權限資料
- 動態顯示頁面
- 用戶體驗優化
- 權限狀態管理

### 2. **前端主導模式**（不推薦）

```
前端 → 後端
├── 前端權限配置
├── 後端簡單驗證
└── 安全性較低
```

## 🔧 實際實作架構

### 後端權限資料庫設計

```sql
-- 用戶表
CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100),
  role_id INT
);

-- 角色表
CREATE TABLE roles (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  description TEXT
);

-- 權限表
CREATE TABLE permissions (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  description TEXT
);

-- 角色權限關聯表
CREATE TABLE role_permissions (
  role_id INT,
  permission_id INT,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);
```

### 後端 API 設計

```javascript
// 登入 API
POST /api/auth/login
{
  "username": "user",
  "password": "password"
}

// 回應
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": 1,
    "username": "user",
    "role": "admin",
    "permissions": {
      "canManageBooks": true,
      "canDeleteBooks": true,
      "canViewReports": true,
      "isAdmin": true
    }
  }
}

// 權限檢查 API
GET /api/auth/permissions
Authorization: Bearer jwt_token

// 回應
{
  "permissions": {
    "canManageBooks": true,
    "canDeleteBooks": true,
    "canViewReports": true,
    "isAdmin": true
  }
}
```

### 前端權限管理

```javascript
// 認證服務
class AuthService {
  async login(credentials) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    
    const data = await response.json()
    if (data.success) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('permissions', JSON.stringify(data.user.permissions))
    }
    
    return data
  }
  
  getPermissions() {
    const permissions = localStorage.getItem('permissions')
    return permissions ? JSON.parse(permissions) : {}
  }
}
```

## 🎯 權限設定流程

### 1. **後端設定權限**

```javascript
// 後端權限配置
const permissions = {
  admin: {
    isAuthenticated: true,
    canManageBooks: true,
    canDeleteBooks: true,
    canViewReports: true,
    canManageUsers: true,
    isAdmin: true
  },
  editor: {
    isAuthenticated: true,
    canManageBooks: true,
    canDeleteBooks: false,
    canViewReports: true,
    canManageUsers: false,
    isAdmin: false
  },
  viewer: {
    isAuthenticated: true,
    canManageBooks: false,
    canDeleteBooks: false,
    canViewReports: false,
    canManageUsers: false,
    isAdmin: false
  }
}
```

### 2. **前端接收權限**

```javascript
// 前端接收後端權限
const handleLogin = async (credentials) => {
  const result = await authService.login(credentials)
  
  if (result.success) {
    setUserPermissions(result.user.permissions)
    setCurrentRole(result.user.role)
  }
}
```

### 3. **動態顯示頁面**

```javascript
// 根據權限動態顯示
const navigationMenu = getNavigationMenu(userPermissions)

// 路由保護
<RouteGuard userPermissions={userPermissions}>
  <AppRoutes />
</RouteGuard>
```

## 🔒 安全性考量

### 1. **後端驗證**
- 所有權限檢查必須在後端進行
- 前端權限僅用於 UI 顯示
- API 端點必須驗證用戶權限

### 2. **Token 管理**
- 使用 JWT 或其他 token 機制
- 設定適當的過期時間
- 實作 token 刷新機制

### 3. **權限快取**
- 前端可以快取權限資料
- 定期與後端同步
- 權限變更時即時更新

## 📊 權限管理最佳實踐

### 1. **角色基礎權限 (RBAC)**
```javascript
const roles = {
  admin: ['read', 'write', 'delete', 'manage'],
  editor: ['read', 'write'],
  viewer: ['read']
}
```

### 2. **權限粒度控制**
```javascript
const permissions = {
  books: {
    read: true,
    write: true,
    delete: false,
    manage: false
  },
  users: {
    read: false,
    write: false,
    delete: false,
    manage: false
  }
}
```

### 3. **條件權限**
```javascript
const conditionalPermissions = {
  canEditOwnBooks: (user, book) => user.id === book.authorId,
  canViewReports: (user) => user.role === 'admin' || user.role === 'manager'
}
```

## 🚀 擴展功能

### 1. **即時權限更新**
```javascript
// WebSocket 或 Server-Sent Events
socket.on('permission-updated', (newPermissions) => {
  setUserPermissions(newPermissions)
})
```

### 2. **權限審計**
```javascript
// 記錄權限使用
const auditPermission = (action, resource, user) => {
  logService.log({
    action,
    resource,
    userId: user.id,
    timestamp: new Date()
  })
}
```

### 3. **多租戶權限**
```javascript
const tenantPermissions = {
  tenant1: { canManageBooks: true },
  tenant2: { canManageBooks: false }
}
```

## 📝 總結

**權限設定應該由後端主導，前端負責顯示和用戶體驗。**

- **後端**：權限資料庫、驗證邏輯、API 提供
- **前端**：接收權限、動態顯示、狀態管理
- **協作**：前後端通過 API 進行權限同步
- **安全**：所有權限檢查必須在後端進行 