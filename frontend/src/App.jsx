import React, { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import classes from './App.module.scss'
import Navbar from './components/Navigation/Navbar'
import AppRoutes from './router'
import RouteGuard from './router/RouteGuard'
import AdvancedRouteTransition from './components/UI/AdvancedRouteTransition'
import ProgressBar from './components/UI/ProgressBar'
import CustomCursor from './components/UI/CustomCursor'
import { useAuth } from './hooks/useAuth'

function App() {
  const {
    user,
    userPermissions,
    currentRole,
    loading,
    handleLogout,
    reinitializeAuth
  } = useAuth()
  
  console.log('App 組件狀態:', { user, userPermissions, currentRole, loading })
  
  // 監聽認證狀態變化
  useEffect(() => {
    console.log('App 認證狀態變化:', { user, userPermissions, currentRole })
  }, [user, userPermissions, currentRole])

  // 監聽 localStorage 變化
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log('localStorage 變化:', e.key, e.newValue)
        // 可以考慮在這裡觸發認證狀態重新檢查
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <div className={classes.loadingSpinner}>載入中...</div>
      </div>
    )
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className={classes.app}>
        <CustomCursor />
        <ProgressBar />
        <Navbar 
          user={user}
          userPermissions={userPermissions} 
          currentRole={currentRole}
          onLogout={handleLogout}
        />
        <main className={classes.mainContent}>
          <RouteGuard user={user} userPermissions={userPermissions}>
            <AdvancedRouteTransition>
              <AppRoutes userPermissions={userPermissions} />
            </AdvancedRouteTransition>
          </RouteGuard>
        </main>
      </div>
    </Router>
  )
}

export default App
