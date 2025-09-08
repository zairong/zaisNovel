import { useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [userPermissions, setUserPermissions] = useState({
    isAuthenticated: false,
    canManageBooks: false,
    canUploadBooks: false,
    canDeleteBooks: false,
    canViewReports: false,
    canManageUsers: false,
    isAdmin: false,
    isAuthor: false,
    canViewBooks: false,
    canReadEbooks: false,
    canAccessLibrary: false
  })
  
  const [loading, setLoading] = useState(true)
  const [currentRole, setCurrentRole] = useState('guest')

  // 更新認證狀態的函數
  const updateAuthState = useCallback(() => {
    console.log('更新認證狀態')
    const currentUser = authService.getCurrentUser()
    const permissions = authService.getUserPermissions()
    const role = authService.getUserRole()
    
    console.log('更新認證狀態:', { currentUser, permissions, role })
    
    // 使用同步方式更新狀態
    setUser(currentUser)
    setUserPermissions(permissions)
    setCurrentRole(role)
    
    console.log('認證狀態更新完成')
  }, [])

  // 同步更新認證狀態（不使用 useCallback）
  const syncUpdateAuthState = () => {
    console.log('同步更新認證狀態')
    const currentUser = authService.getCurrentUser()
    const permissions = authService.getUserPermissions()
    const role = authService.getUserRole()
    
    console.log('同步更新認證狀態:', { currentUser, permissions, role })
    
    // 使用同步方式更新狀態
    setUser(currentUser)
    setUserPermissions(permissions)
    setCurrentRole(role)
    
    console.log('同步認證狀態更新完成')
  }

  // 重新初始化認證狀態的函數
  const reinitializeAuth = useCallback(async () => {
    try {
      console.log('開始重新初始化認證狀態')
      const isAuthenticated = await authService.checkAuth()
      console.log('認證檢查結果:', isAuthenticated)
      
      if (isAuthenticated) {
        updateAuthState()
      } else {
        console.log('用戶未認證，清除狀態')
        setUser(null)
        setUserPermissions({
          isAuthenticated: false,
          canManageBooks: false,
          canUploadBooks: false,
          canDeleteBooks: false,
          canViewReports: false,
          canManageUsers: false,
          isAdmin: false,
          isAuthor: false,
          canViewBooks: false,
          canReadEbooks: false,
          canAccessLibrary: false
        })
        setCurrentRole('guest')
        console.log('認證狀態清除完成')
      }
    } catch (error) {
      console.error('重新初始化認證錯誤:', error)
    }
  }, []) // 移除 updateAuthState 依賴

  // 初始化認證狀態
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 開始初始化認證狀態')
        const isAuthenticated = await authService.checkAuth()
        console.log('✅ 初始化認證檢查結果:', isAuthenticated)
        
        if (isAuthenticated) {
          updateAuthState()
        } else {
          console.log('👤 初始化時用戶未認證，設定為訪客模式')
          setUser(null)
          setUserPermissions({
            isAuthenticated: false,
            canManageBooks: false,
            canUploadBooks: false,
            canDeleteBooks: false,
            canViewReports: false,
            canManageUsers: false,
            isAdmin: false,
            isAuthor: false,
            canViewBooks: false,
            canReadEbooks: false,
            canAccessLibrary: false
          })
          setCurrentRole('guest')
        }
      } catch (error) {
        console.error('❌ 認證初始化發生意外錯誤:', error)
        // 即使發生錯誤，也設定為未認證狀態
        setUser(null)
        setUserPermissions({
          isAuthenticated: false,
          canManageBooks: false,
          canUploadBooks: false,
          canDeleteBooks: false,
          canViewReports: false,
          canManageUsers: false,
          isAdmin: false,
          isAuthor: false,
          canViewBooks: false,
          canReadEbooks: false,
          canAccessLibrary: false
        })
        setCurrentRole('guest')
      } finally {
        setLoading(false)
        console.log('✅ 認證初始化完成')
      }
    }

    initializeAuth()
  }, []) // 移除 updateAuthState 依賴，避免無限循環

  // 監聽全域認證事件，保持多處 useAuth 狀態一致
  useEffect(() => {
    const onAuthChanged = () => {
      // 任何認證變化時，立即同步最新狀態
      syncUpdateAuthState()
    }

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('auth-changed', onAuthChanged)
    }

    return () => {
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('auth-changed', onAuthChanged)
      }
    }
  }, [])
  
  // 監聽認證狀態變化
  useEffect(() => {
    console.log('useAuth 狀態變化:', { user, userPermissions, currentRole, loading })
  }, [user, userPermissions, currentRole, loading])

  // 登入功能
  const handleLogin = useCallback(async (credentials) => {
    setLoading(true)
    
    try {
      const result = await authService.login(credentials.username || credentials.email, credentials.password)
      
      if (result.success) {
        console.log('登入成功，立即更新認證狀態')
        
        // 使用同步方法更新認證狀態
        syncUpdateAuthState()
        
        // 強制觸發狀態更新
        setTimeout(() => {
          console.log('強制更新認證狀態')
          syncUpdateAuthState()
        }, 50)
        
        // 觸發全域認證變化事件
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth-changed'))
        }
        
        console.log('登入後認證狀態更新完成')
      }
      
      return result
    } catch (error) {
      console.error('登入錯誤:', error)
      return {
        success: false,
        message: '登入失敗'
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // 註冊功能
  const handleRegister = useCallback(async (userData) => {
    setLoading(true)
    
    try {
      const result = await authService.register(userData)
      
      // 註冊成功後不自動設置認證狀態，讓用戶需要重新登入
      if (result.success) {
        // 清除認證狀態，確保用戶需要重新登入
        setUser(null)
        setUserPermissions({
          isAuthenticated: false,
          canManageBooks: false,
          canUploadBooks: false,
          canDeleteBooks: false,
          canViewReports: false,
          canManageUsers: false,
          isAdmin: false,
          isAuthor: false,
          canViewBooks: false,
          canReadEbooks: false,
          canAccessLibrary: false
        })
        setCurrentRole('guest')
      }
      
      return result
    } catch (error) {
      console.error('註冊錯誤:', error)
      return {
        success: false,
        message: '註冊失敗'
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // 登出功能
  const handleLogout = useCallback(async () => {
    setLoading(true)
    
    try {
      const result = await authService.logout()
      
      if (result.success) {
        // 登出後重新初始化認證狀態
        await reinitializeAuth()
      }
      
      return result
    } catch (error) {
      console.error('登出錯誤:', error)
      return {
        success: false,
        message: '登出失敗'
      }
    } finally {
      setLoading(false)
    }
  }, [reinitializeAuth])

  // 更新用戶資料
  const handleUpdateProfile = useCallback(async (profileData) => {
    try {
      const result = await authService.updateProfile(profileData)
      
      if (result.success) {
        updateAuthState()
      }
      
      return result
    } catch (error) {
      console.error('更新資料錯誤:', error)
      return {
        success: false,
        message: '更新資料失敗'
      }
    }
  }, []) // 移除 updateAuthState 依賴

  // 更改密碼
  const handleChangePassword = useCallback(async (passwordData) => {
    try {
      return await authService.changePassword(passwordData)
    } catch (error) {
      console.error('更改密碼錯誤:', error)
      return {
        success: false,
        message: '更改密碼失敗'
      }
    }
  }, [])

  // 申請成為作者
  const handleApplyForAuthor = useCallback(async (applicationData) => {
    setLoading(true)
    
    try {
      const result = await authService.applyForAuthor(applicationData)
      return result
    } catch (error) {
      console.error('作者申請錯誤:', error)
      return {
        success: false,
        message: '申請提交失敗'
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // 管理員：審核作者申請
  const handleReviewAuthorApplication = useCallback(async (userId, status, reason) => {
    setLoading(true)
    
    try {
      const result = await authService.reviewAuthorApplication(userId, status, reason)
      
      if (result.success) {
        // 如果審核成功，重新獲取用戶權限
        updateAuthState()
      }
      
      return result
    } catch (error) {
      console.error('審核作者申請錯誤:', error)
      return {
        success: false,
        message: '審核失敗'
      }
    } finally {
      setLoading(false)
    }
  }, []) // 移除 updateAuthState 依賴

  return {
    user,
    userPermissions,
    currentRole,
    loading,
    handleLogin,
    handleRegister,
    handleLogout,
    handleUpdateProfile,
    handleChangePassword,
    handleApplyForAuthor,
    handleReviewAuthorApplication,
    reinitializeAuth, // 導出重新初始化函數，以便外部調用
    updateAuthState, // 導出更新狀態函數
    syncUpdateAuthState // 導出同步更新狀態函數
  }
} 