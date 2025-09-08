// API 配置
const config = {
  // 開發環境
  development: {
    baseURL: 'http://127.0.0.1:3000/api',
  },
  // 生產環境
  production: {
    baseURL: process.env.REACT_APP_API_URL || 'https://your-backend-url.herokuapp.com/api',
  }
};

// 根據環境選擇配置
const env = process.env.NODE_ENV || 'development';
export const apiConfig = config[env];

export default apiConfig;
