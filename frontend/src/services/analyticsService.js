const API_BASE_URL = import.meta.env.VITE_API_BASE || '/api'

import authService from './authService'

class AnalyticsService {
  getAuthHeaders() {
    return authService.getAuthHeaders()
  }

  async getViewsHistory({ granularity = 'day', year, bookId } = {}) {
    const params = new URLSearchParams()
    if (granularity) params.set('granularity', granularity)
    if (year) params.set('year', String(year))
    if (bookId) params.set('book_id', String(bookId))
    const res = await fetch(`${API_BASE_URL}/analytics/views?${params.toString()}`, { headers: this.getAuthHeaders() })
    return res.json()
  }

  async getDownloadsHistory({ granularity = 'day', year, bookId } = {}) {
    const params = new URLSearchParams()
    if (granularity) params.set('granularity', granularity)
    if (year) params.set('year', String(year))
    if (bookId) params.set('book_id', String(bookId))
    const res = await fetch(`${API_BASE_URL}/analytics/downloads?${params.toString()}`, { headers: this.getAuthHeaders() })
    return res.json()
  }

  async getFavoritesHistory({ granularity = 'day', year, bookId } = {}) {
    const params = new URLSearchParams()
    if (granularity) params.set('granularity', granularity)
    if (year) params.set('year', String(year))
    if (bookId) params.set('book_id', String(bookId))
    const res = await fetch(`${API_BASE_URL}/analytics/favorites?${params.toString()}`, { headers: this.getAuthHeaders() })
    return res.json()
  }

  async getMyBooks() {
    const res = await fetch(`${API_BASE_URL}/analytics/my-books`, { headers: this.getAuthHeaders() })
    return res.json()
  }
}

const analyticsService = new AnalyticsService()
export default analyticsService


