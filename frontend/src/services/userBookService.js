// 生產環境使用絕對 URL，開發環境使用 Vite 代理
const API_BASE_URL = import.meta.env.VITE_API_BASE || 
  (import.meta.env.PROD ? 'https://zaisnovel-backend.onrender.com/api' : '/api');
import authService from './authService';

class UserBookService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  // 獲取認證頭
  getAuthHeaders() {
    // 讀取最新 token，避免初始化後 token 變動造成授權失效
    const token = localStorage.getItem('token') || authService.token;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // 獲取用戶的個人書庫
  async getMyLibrary(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/user-books/my-library?${queryString}`, {
        headers: this.getAuthHeaders()
      });

      return await response.json();
    } catch (error) {
      console.error('獲取個人書庫錯誤:', error);
      return {
        success: false,
        message: '獲取個人書庫失敗'
      };
    }
  }

  // 添加書籍到個人書庫
  async addToLibrary(bookId) {
    try {
      const response = await fetch(`${API_BASE_URL}/user-books/add-to-library`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ book_id: bookId })
      });

      return await response.json();
    } catch (error) {
      console.error('添加書籍到書庫錯誤:', error);
      return {
        success: false,
        message: '添加書籍失敗'
      };
    }
  }

  // 從書庫移除書籍
  async removeFromLibrary(bookId) {
    try {
      const response = await fetch(`${API_BASE_URL}/user-books/remove-from-library/${bookId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      return await response.json();
    } catch (error) {
      console.error('從書庫移除書籍錯誤:', error);
      return {
        success: false,
        message: '移除書籍失敗'
      };
    }
  }

  // 更新書籍狀態（珍藏、閱讀進度、評分、筆記）
  async updateBookStatus(bookId, statusData) {
    try {
      const response = await fetch(`${API_BASE_URL}/user-books/update-book/${bookId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(statusData)
      });

      return await response.json();
    } catch (error) {
      console.error('更新書籍狀態錯誤:', error);
      return {
        success: false,
        message: '更新書籍狀態失敗'
      };
    }
  }

  // 獲取用戶的珍藏書籍
  async getFavorites(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/user-books/favorites?${queryString}`, {
        headers: this.getAuthHeaders()
      });

      return await response.json();
    } catch (error) {
      console.error('獲取珍藏書籍錯誤:', error);
      return {
        success: false,
        message: '獲取珍藏書籍失敗'
      };
    }
  }

  // 獲取用戶的閱讀統計
  async getReadingStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/user-books/reading-stats`, {
        headers: this.getAuthHeaders()
      });

      return await response.json();
    } catch (error) {
      console.error('獲取閱讀統計錯誤:', error);
      return {
        success: false,
        message: '獲取閱讀統計失敗'
      };
    }
  }

  // 管理員：獲取所有用戶的書庫統計
  async getAdminStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/user-books/admin/stats`, {
        headers: this.getAuthHeaders()
      });

      return await response.json();
    } catch (error) {
      console.error('獲取管理員統計錯誤:', error);
      return {
        success: false,
        message: '獲取統計失敗'
      };
    }
  }

  // 檢查書籍是否在用戶書庫中
  async checkBookInLibrary(bookId) {
    try {
      const response = await fetch(`${API_BASE_URL}/user-books/my-library?book_id=${bookId}`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success && data.data.userBooks.length > 0) {
        return {
          inLibrary: true,
          userBook: data.data.userBooks[0]
        };
      }
      
      return {
        inLibrary: false,
        userBook: null
      };
    } catch (error) {
      console.error('檢查書籍狀態錯誤:', error);
      return {
        inLibrary: false,
        userBook: null
      };
    }
  }

  // 批量操作
  async batchAddToLibrary(bookIds) {
    try {
      const promises = bookIds.map(bookId => this.addToLibrary(bookId));
      const results = await Promise.allSettled(promises);
      
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;
      
      return {
        success: true,
        message: `成功添加 ${successCount}/${bookIds.length} 本書籍到書庫`,
        data: {
          total: bookIds.length,
          success: successCount,
          failed: bookIds.length - successCount
        }
      };
    } catch (error) {
      console.error('批量添加書籍錯誤:', error);
      return {
        success: false,
        message: '批量添加書籍失敗'
      };
    }
  }

  // 批量移除書籍
  async batchRemoveFromLibrary(bookIds) {
    try {
      const promises = bookIds.map(bookId => this.removeFromLibrary(bookId));
      const results = await Promise.allSettled(promises);
      
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;
      
      return {
        success: true,
        message: `成功從書庫移除 ${successCount}/${bookIds.length} 本書籍`,
        data: {
          total: bookIds.length,
          success: successCount,
          failed: bookIds.length - successCount
        }
      };
    } catch (error) {
      console.error('批量移除書籍錯誤:', error);
      return {
        success: false,
        message: '批量移除書籍失敗'
      };
    }
  }
}

const userBookService = new UserBookService();
export default userBookService;
