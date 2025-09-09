// HTTP 工具類 - 提供統一的 API 請求方法
import authService from '../services/authService';
import { apiConfig } from '../services/config';

// 優先使用環境變數，否則使用配置檔案的設定
const API_BASE_URL = import.meta.env.VITE_API_BASE || apiConfig.baseURL;

class HttpService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // 獲取請求頭
  getHeaders() {
    try {
      return authService.getAuthHeaders();
    } catch (error) {
      // 如果獲取認證標頭失敗，返回基本標頭
      console.warn('獲取認證標頭失敗，使用基本標頭:', error);
      return {
        'Content-Type': 'application/json'
      };
    }
  }

  // 處理響應
  async handleResponse(response) {
    let data = null;
    
    // 檢查是否有內容需要解析
    const contentLength = response.headers.get('content-length');
    const contentType = response.headers.get('content-type');
    
    if (contentLength !== '0' && contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        console.warn('JSON 解析失敗，響應可能為空或格式錯誤:', jsonError);
        data = null;
      }
    }
    
    if (!response.ok) {
      const error = new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`);
      error.response = { data, status: response.status };
      throw error;
    }
    
    return data;
  }

  // GET 請求
  async get(url, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'GET',
        headers: this.getHeaders(),
        ...options
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('GET 請求錯誤:', error);
      throw error;
    }
  }

  // POST 請求
  async post(url, data = null, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        ...options
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('POST 請求錯誤:', error);
      throw error;
    }
  }

  // PUT 請求
  async put(url, data = null, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        ...options
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('PUT 請求錯誤:', error);
      throw error;
    }
  }

  // DELETE 請求
  async delete(url, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        ...options
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('DELETE 請求錯誤:', error);
      throw error;
    }
  }

  // PATCH 請求
  async patch(url, data = null, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        ...options
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('PATCH 請求錯誤:', error);
      throw error;
    }
  }
}

// 創建並導出單例實例
const http = new HttpService();
export { http };
