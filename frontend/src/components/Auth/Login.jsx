import React, { useState } from 'react';
import classes from './Auth.module.scss';

const Login = ({ onLogin, onSwitchToRegister, loading }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // 清除錯誤訊息
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('請填寫所有欄位');
      return;
    }

    try {
      const result = await onLogin(formData);
      if (!result.success) {
        setError(result.message || '登入失敗');
      }
    } catch (error) {
      setError('登入過程發生錯誤');
    }
  };

  return (
    <div className={classes.authContainer}>
      <div className={classes.authCard}>
        <h2 className={classes.authTitle}>登入</h2>
        
        {error && (
          <div className={classes.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={classes.authForm}>
          <div className={classes.formGroup}>
            <label htmlFor="username" className={classes.formLabel}>
              用戶名或電子郵件
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={classes.formInput}
              placeholder="請輸入用戶名或電子郵件"
              disabled={loading}
            />
          </div>

          <div className={classes.formGroup}>
            <label htmlFor="password" className={classes.formLabel}>
              密碼
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={classes.formInput}
              placeholder="請輸入密碼"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={classes.authButton}
            disabled={loading}
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>

        <div className={classes.authFooter}>
          <p>還沒有帳戶？</p>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className={classes.authLink}
            disabled={loading}
          >
            立即註冊
          </button>
        </div>

        <div className={classes.demoInfo}>
          <h4>測試帳戶：</h4>
          <p><strong>管理員：</strong> admin / Admin123 </p>
          <p><strong>一般用戶：</strong> 請先註冊</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
