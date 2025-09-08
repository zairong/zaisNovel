// 書籍服務 - 處理與後端 API 的交互
import authService from './authService'
// 生產環境使用絕對 URL，開發環境使用 Vite 代理
const API_BASE_URL = import.meta.env.VITE_API_BASE || 
  (import.meta.env.PROD ? 'https://zaisnovel-backend.onrender.com/api' : '/api')

class BookService {
  // 取得所有書籍
  async getAllBooks() {
    try {
      const response = await fetch(`${API_BASE_URL}/books`, {
        headers: authService.getAuthHeaders()
      })
      const data = await response.json()
      
      if (data.success) {
        return data
      } else {
        throw new Error(data.message || '取得書籍失敗')
      }
    } catch (error) {
      console.error('取得書籍錯誤:', error)
      throw error
    }
  }

  // 取得電子書列表（分頁）
  async getEbooks(page = 1, pageSize = 20, search = '', category = 'all') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search: search,
        category: category
      })
      
      const response = await fetch(`${API_BASE_URL}/books/ebooks?${params}`, {
        headers: authService.getAuthHeaders()
      })
      const data = await response.json()
      
      if (data.success) {
        // 返回完整的回應對象，包含 success 屬性
        return data
      } else {
        throw new Error(data.message || '取得電子書失敗')
      }
    } catch (error) {
      console.error('取得電子書錯誤:', error)
      throw error
    }
  }

  // 取得單一書籍
  async getBook(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}`, { cache: 'no-store' })
      const data = await response.json()
      
      if (data.success) {
        return data
      } else {
        throw new Error(data.message || '取得書籍失敗')
      }
    } catch (error) {
      console.error('取得書籍錯誤:', error)
      throw error
    }
  }

  // 取得書籍評分
  async getBookRating(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}/rating`, { cache: 'no-store' })
      const data = await response.json()
      
      if (data.success) {
        return data
      } else {
        throw new Error(data.message || '取得書籍評分失敗')
      }
    } catch (error) {
      console.error('取得書籍評分錯誤:', error)
      throw error
    }
  }

  // 新增書籍
  async createBook(bookData) {
    try {
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(bookData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        return data
      } else {
        throw new Error(data.message || '新增書籍失敗')
      }
    } catch (error) {
      console.error('新增書籍錯誤:', error)
      throw error
    }
  }

  // 更新書籍
  async updateBook(id, bookData) {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(bookData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        return data
      } else {
        throw new Error(data.message || '更新書籍失敗')
      }
    } catch (error) {
      console.error('更新書籍錯誤:', error)
      throw error
    }
  }

  // 刪除書籍
  async deleteBook(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (data.success) {
        return true
      } else {
        throw new Error(data.message || '刪除書籍失敗')
      }
    } catch (error) {
      console.error('刪除書籍錯誤:', error)
      throw error
    }
  }

  // 搜尋書籍
  async searchBooks(keyword) {
    try {
      const response = await fetch(`${API_BASE_URL}/books/search/${encodeURIComponent(keyword)}`, {
        headers: authService.getAuthHeaders()
      })
      const data = await response.json()
      
      if (data.success) {
        return data
      } else {
        throw new Error(data.message || '搜尋書籍失敗')
      }
    } catch (error) {
      console.error('搜尋書籍錯誤:', error)
      throw error
    }
  }

  // 依分類取得書籍
  async getBooksByCategory(category) {
    try {
      const response = await fetch(`${API_BASE_URL}/books/category/${encodeURIComponent(category)}`, {
        headers: authService.getAuthHeaders()
      })
      const data = await response.json()
      
      if (data.success) {
        return data
      } else {
        throw new Error(data.message || '取得分類書籍失敗')
      }
    } catch (error) {
      console.error('取得分類書籍錯誤:', error)
      throw error
    }
  }

  // 上傳電子書檔案
  async uploadEbook(id, file) {
    try {
      const formData = new FormData()
      formData.append('ebook', file)
      
      const response = await fetch(`${API_BASE_URL}/books/${id}/upload-ebook`, {
        method: 'POST',
        // 注意：不要手動設置 Content-Type，讓瀏覽器自動帶 boundary
        headers: {
          Authorization: `Bearer ${authService.getToken()}`
        },
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        return data
      } else {
        throw new Error(data.message || '上傳電子書失敗')
      }
    } catch (error) {
      console.error('上傳電子書錯誤:', error)
      throw error
    }
  }

  // 上傳封面圖片
  async uploadCover(id, file) {
    try {
      const formData = new FormData()
      formData.append('cover', file)
      
      const response = await fetch(`${API_BASE_URL}/books/${id}/upload-cover`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authService.getToken()}`
        },
        body: formData
      })
      
      // 檢查回應是否成功
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // 檢查回應內容類型
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        throw new Error(`伺服器回應格式錯誤: ${text}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        return data
      } else {
        throw new Error(data.message || '上傳封面失敗')
      }
    } catch (error) {
      console.error('上傳封面錯誤:', error)
      throw error
    }
  }

  // 刪除封面圖片
  async deleteCover(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}/delete-cover`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (data.success) {
        return true
      } else {
        throw new Error(data.message || '刪除封面失敗')
      }
    } catch (error) {
      console.error('刪除封面錯誤:', error)
      throw error
    }
  }

  // 下載電子書檔案
  async downloadEbook(id) {
    try {
      // 不帶認證標頭，未登入也可下載
      const response = await fetch(`${API_BASE_URL}/books/${id}/download-ebook`, { cache: 'no-store' })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '下載電子書失敗')
      }
      
      // 取得檔案名稱（優先解析 filename*，其次 filename）
      const contentDisposition = response.headers.get('content-disposition') || ''
      let filename = 'ebook.md'
      if (contentDisposition) {
        // RFC 5987: filename*=UTF-8''%E4%B8%AD%E6%96%87.md
        const filenameStarMatch = contentDisposition.match(/filename\*=(?:UTF-8'')?([^;\n\r]+)/i)
        if (filenameStarMatch && filenameStarMatch[1]) {
          try {
            const encoded = filenameStarMatch[1].trim().replace(/^"|"$/g, '')
            filename = decodeURIComponent(encoded)
          } catch (_) {}
        } else {
          const filenameMatch = contentDisposition.match(/filename="?([^";\n\r]+)"?/i)
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1]
          }
        }
      }
      // 基本清理：避免路徑注入與奇怪字元
      filename = filename.replace(/[\\/:*?<>|]+/g, '_').trim()
      if (!filename) filename = 'ebook.md'
      
      // 嘗試從回應標頭取得最新的下載/觀看次數
      const downloadCountHeader = response.headers.get('X-Download-Count')
      const viewCountHeader = response.headers.get('X-View-Count')
      const counts = {
        download_count: downloadCountHeader ? parseInt(downloadCountHeader, 10) : undefined,
        view_count: viewCountHeader ? parseInt(viewCountHeader, 10) : undefined
      }

      // 建立下載連結
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      return { success: true, ...counts }
    } catch (error) {
      console.error('下載電子書錯誤:', error)
      throw error
    }
  }

  // 讀取電子書內容
  async readEbook(id) {
    try {
      // 不帶認證標頭，未登入也可閱讀
      const response = await fetch(`${API_BASE_URL}/books/${id}/read-ebook`)
      const data = await response.json()
      
      if (data.success) {
        return data
      } else {
        throw new Error(data.message || '讀取電子書失敗')
      }
    } catch (error) {
      console.error('讀取電子書錯誤:', error)
      throw error
    }
  }

  // 刪除電子書檔案
  async deleteEbook(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}/delete-ebook`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (data.success) {
        return true
      } else {
        throw new Error(data.message || '刪除電子書失敗')
      }
    } catch (error) {
      console.error('刪除電子書錯誤:', error)
      throw error
    }
  }

  // 更新電子書內容
  async updateEbookContent(id, content) {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}/update-content`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ content })
      })
      
      const data = await response.json()
      
      if (data.success) {
        return data
      } else {
        throw new Error(data.message || '更新電子書內容失敗')
      }
    } catch (error) {
      console.error('更新電子書內容錯誤:', error)
      throw error
    }
  }
}

export default new BookService() 