import React, { useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import Navbar from '../components/Navigation/Navbar'
import AppRoutes from '../router'
import RouteGuard from '../router/RouteGuard'
import { getNavigationMenu, canAccessRoute } from '../router/routerUtils'

function RouteExample() {
  // 模擬用戶權限狀態
  const [userPermissions, setUserPermissions] = useState({
    isAuthenticated: true,
    canManageBooks: true,
    isAdmin: false
  })

  // 切換權限的函數
  const togglePermission = (permission) => {
    setUserPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }))
  }

  // 獲取當前可訪問的導航選單
  const navigationMenu = getNavigationMenu(userPermissions)

  return (
    <Router>
      <div className="app">
        {/* 權限控制面板 */}
        <div style={{ 
          background: '#f5f5f5', 
          padding: '1rem', 
          marginBottom: '1rem',
          borderRadius: '8px'
        }}>
          <h3>權限控制面板</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label>
              <input
                type="checkbox"
                checked={userPermissions.isAuthenticated}
                onChange={() => togglePermission('isAuthenticated')}
              />
              已認證
            </label>
            <label>
              <input
                type="checkbox"
                checked={userPermissions.canManageBooks}
                onChange={() => togglePermission('canManageBooks')}
              />
              可管理書籍
            </label>
            <label>
              <input
                type="checkbox"
                checked={userPermissions.isAdmin}
                onChange={() => togglePermission('isAdmin')}
              />
              管理員
            </label>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <h4>當前可訪問的頁面：</h4>
            <ul>
              {navigationMenu.map(item => (
                <li key={item.path}>
                  {item.icon} {item.title} - {item.description}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 導航欄 */}
        <Navbar userPermissions={userPermissions} />
        
        {/* 主要內容 */}
        <main className="main-content">
          <RouteGuard userPermissions={userPermissions}>
            <AppRoutes />
          </RouteGuard>
        </main>
      </div>
    </Router>
  )
}

export default RouteExample 