import { http } from '../utils/http';

class CommentService {
  // 獲取書籍的所有評論
  async getBookComments(bookId, page = 1, limit = 10) {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      const response = await http.get(`/comments/books/${bookId}/comments?${params}`);
      return response;
    } catch (error) {
      throw new Error(error.message || '獲取評論失敗');
    }
  }

  // 創建新評論
  async createComment(bookId, commentData) {
    try {
      const response = await http.post(`/comments/books/${bookId}/comments`, commentData);
      return response;
    } catch (error) {
      throw new Error(error.message || '創建評論失敗');
    }
  }

  // 更新評論
  async updateComment(commentId, commentData) {
    try {
      const response = await http.put(`/comments/comments/${commentId}`, commentData);
      return response;
    } catch (error) {
      throw new Error(error.message || '更新評論失敗');
    }
  }

  // 刪除評論
  async deleteComment(commentId) {
    try {
      const response = await http.delete(`/comments/comments/${commentId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || '刪除評論失敗');
    }
  }

  // 獲取用戶的評論
  async getUserComments(page = 1, limit = 10) {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      const response = await http.get(`/comments/user/comments?${params}`);
      return response;
    } catch (error) {
      throw new Error(error.message || '獲取用戶評論失敗');
    }
  }
}

export default new CommentService();
