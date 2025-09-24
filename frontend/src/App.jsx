import React, { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import classes from './App.module.scss'
import Navbar from './components/Navigation/Navbar'
import AppRoutes from './router'
import RouteGuard from './router/RouteGuard'
import AdvancedRouteTransition from './components/UI/AdvancedRouteTransition'
import ProgressBar from './components/UI/ProgressBar'
import CustomCursor from './components/UI/CustomCursor'
import NetworkStatus from './components/UI/NetworkStatus'
import { ToastContainer, useToast } from './components/UI/Toast'
import { useAuth } from './hooks/useAuth'
import networkDiagnostics from './utils/networkDiagnostics'

function App() {
  const {
    user,
    userPermissions,
    currentRole,
    loading,
    handleLogout,
    reinitializeAuth
  } = useAuth()
  
  const { toasts, removeToast } = useToast()
  
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

  // 網路診斷功能
  useEffect(() => {
    // 在生產環境中，如果檢測到網路問題，執行診斷
    const runDiagnosisIfNeeded = async () => {
      if (import.meta.env.PROD) {
        try {
          // 測試基本 API 連接
          const response = await fetch('https://zaisnovel-backend.onrender.com/api/books', {
            method: 'HEAD',
            mode: 'cors'
          });
          
          if (!response.ok) {
            console.warn('⚠️ 檢測到 API 連接問題，執行診斷...');
            const results = await networkDiagnostics.runFullDiagnosis();
            const report = networkDiagnostics.generateReport(results);
            console.log('📊 診斷報告:', report);
          }
        } catch (error) {
          console.warn('⚠️ 網路連接問題，執行診斷...', error);
          const results = await networkDiagnostics.runFullDiagnosis();
          const report = networkDiagnostics.generateReport(results);
          console.log('📊 診斷報告:', report);
        }
      }
    };

    // 延遲執行診斷
    const timer = setTimeout(runDiagnosisIfNeeded, 3000);
    return () => clearTimeout(timer);
  }, [])

  // 添加全域診斷函數到 window 對象，方便手動調用
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.runNetworkDiagnosis = async () => {
        console.log('🔍 手動執行網路診斷...');
        const results = await networkDiagnostics.runFullDiagnosis();
        const report = networkDiagnostics.generateReport(results);
        console.log('📊 診斷報告:', report);
        return report;
      };
    }
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
        <NetworkStatus />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
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
