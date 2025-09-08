import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import Login from './Login';
import Register from './Register';
import { useAuth } from '../../hooks/useAuth';

const AuthPage = ({ userPermissions }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { handleLogin, handleRegister, loading, updateAuthState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 由登入來源決定的預設回跳路徑（僅作為參考，實際於登入成功時再決定）
  const pendingFrom = location.state?.from?.pathname;

  const handleSwitchToRegister = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  // 處理登入成功
  const handleLoginSuccess = async (credentials) => {
    console.log('開始登入流程');
    try {
      const result = await handleLogin(credentials);
      console.log('登入結果:', result);

      if (result.success) {
        // 確保認證狀態已更新
        updateAuthState();

        // 等待狀態更新完成
        await new Promise(resolve => setTimeout(resolve, 100));

        // 再次檢查認證狀態確保同步
        updateAuthState();

        // 等待第二次更新完成
        await new Promise(resolve => setTimeout(resolve, 50));

        // 依權限決定預設目的地：可管理書籍 → /books；否則 → /ebooks
        const permissions = authService.getUserPermissions();
        const defaultPath = permissions.canManageBooks ? '/home' : '/home';

        // 如果有從受保護頁面被帶來，優先回去（排除 /auth 自身）
        const target = (pendingFrom && pendingFrom !== '/auth') ? pendingFrom : defaultPath;
        console.log('登入成功，導向目標:', target, '（pendingFrom:', pendingFrom, 'default:', defaultPath, ')');

        navigate(target, { replace: true });
      }
      return result;
    } catch (error) {
      console.error('登入處理錯誤:', error);
      return {
        success: false,
        message: '登入處理失敗'
      };
    }
  };

  // 處理註冊成功
  const handleRegisterSuccess = async (userData) => {
    const result = await handleRegister(userData);
    if (result.success) {
      // 註冊成功後跳轉到登入頁面
      setIsLogin(true);
      // 清除註冊成功後的認證信息，讓用戶需要重新登入
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return result;
  };

  return (
    <div>
      {isLogin ? (
        <Login
          onLogin={handleLoginSuccess}
          onSwitchToRegister={handleSwitchToRegister}
          loading={loading}
        />
      ) : (
        <Register
          onRegister={handleRegisterSuccess}
          onSwitchToLogin={handleSwitchToLogin}
          loading={loading}
        />
      )}
    </div>
  );
};

export default AuthPage;
