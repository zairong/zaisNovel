// API 配置
const config = {
  // 開發環境 - 使用 Vite 代理
  development: {
    baseURL: '/api',
  },
  // 生產環境
  production: {
    baseURL: 'https://zaisnovel-backend.onrender.com/api',
  }
};

// 根據環境選擇配置
const env = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE) || 'development';
export const apiConfig = config[env];

export default apiConfig;
  