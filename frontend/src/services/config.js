// API 配置
const config = {
  // 開發環境
  development: {
    baseURL: 'http://127.0.0.1:3000/api',
  },
  // 生產環境
  production: {
    // Render 靜態站建議用 VITE_ 前綴注入
    baseURL: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
      || process.env.VITE_API_URL
      || 'https://your-backend-url.onrender.com/api',
  }
};

// 根據環境選擇配置
const env = process.env.NODE_ENV || 'development';
export const apiConfig = config[env];

export default apiConfig;
