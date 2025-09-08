import React, { useState } from 'react';
import classes from './Auth.module.scss';

const Register = ({ onRegister, onSwitchToLogin, loading }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age_range: ''
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

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.age_range) {
      setError('請填寫所有欄位');
      return false;
    }

    if (formData.username.length < 3) {
      setError('用戶名至少需要3個字符');
      return false;
    }

    if (formData.password.length < 6) {
      setError('密碼至少需要6個字符');
      return false;
    }

    // 檢查用戶名格式
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError('用戶名只能包含字母、數字和下劃線');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('密碼確認不匹配');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('請輸入有效的電子郵件地址');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await onRegister(registerData);
      if (!result.success) {
        setError(result.message || '註冊失敗');
      }
    } catch (error) {
      setError('註冊過程發生錯誤');
    }
  };

  return (
    <div className={classes.authContainer}>
      <div className={classes.authCard}>
        <h2 className={classes.authTitle}>註冊</h2>
        
        {error && (
          <div className={classes.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={classes.authForm}>
          <div className={classes.formGroup}>
            <label htmlFor="username" className={classes.formLabel}>
              用戶名
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={classes.formInput}
              placeholder="請輸入用戶名（至少3個字符，只能包含字母、數字和下劃線）"
              disabled={loading}
            />
          </div>

          <div className={classes.formGroup}>
            <label htmlFor="email" className={classes.formLabel}>
              電子郵件
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={classes.formInput}
              placeholder="請輸入電子郵件地址"
              disabled={loading}
            />
          </div>

          <div className={classes.formGroup}>
            <label htmlFor="age_range" className={classes.formLabel}>
              年齡範圍
            </label>
            <select
              id="age_range"
              name="age_range"
              value={formData.age_range}
              onChange={handleChange}
              className={classes.formInput}
              disabled={loading}
            >
              <option value="">請選擇年齡範圍</option>
              <option value="10~20">10~20歲</option>
              <option value="20~30">20~30歲</option>
              <option value="30~40">30~40歲</option>
              <option value="40~50">40~50歲</option>
              <option value="50~60">50~60歲</option>
              <option value="60以上">60歲以上</option>
            </select>
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
              placeholder="請輸入密碼（至少6個字符）"
              disabled={loading}
            />
          </div>

          <div className={classes.formGroup}>
            <label htmlFor="confirmPassword" className={classes.formLabel}>
              確認密碼
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={classes.formInput}
              placeholder="請再次輸入密碼"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={classes.authButton}
            disabled={loading}
          >
            {loading ? '註冊中...' : '註冊'}
          </button>
        </form>

        <div className={classes.authFooter}>
          <p>已有帳戶？</p>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className={classes.authLink}
            disabled={loading}
          >
            立即登入
          </button>
        </div>

        <div className={classes.termsInfo}>
          <p>註冊即表示您同意我們的服務條款和隱私政策</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
