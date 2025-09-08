import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import { PermissionButton } from '../Permission/PermissionGuard'
import bookService from '../../services/bookService'
import classes from '../UI/Pages.module.scss'

function EbookUpload({ userPermissions = {} }) {
  const permissions = usePermissions(userPermissions)
  const navigate = useNavigate()
  
  // 狀態管理
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  // 表單狀態
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    price: '',
    description: '',
    category: '',
    ebookFile: null,
    coverFile: null
  })

  // 處理電子書檔案選擇
  const handleEbookFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 檢查檔案類型
      if (!file.name.toLowerCase().endsWith('.md')) {
        setError('只允許上傳 .md 檔案')
        return
      }
      
      // 檢查檔案大小（50MB）
      if (file.size > 50 * 1024 * 1024) {
        setError('檔案大小不能超過 50MB')
        return
      }
      
      setFormData({ ...formData, ebookFile: file })
      setError(null)
    }
  }

  // 處理封面檔案選擇
  const handleCoverFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 檢查檔案類型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setError('只允許上傳 JPG、PNG、GIF、WebP 格式的圖片')
        return
      }
      
      // 檢查檔案大小（5MB）
      if (file.size > 5 * 1024 * 1024) {
        setError('封面圖片大小不能超過 5MB')
        return
      }
      
      setFormData({ ...formData, coverFile: file })
      setError(null)
    }
  }

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.ebookFile) {
      setError('請選擇要上傳的電子書檔案')
      return
    }
    
    if (!formData.title || !formData.author) {
      setError('標題和作者為必填欄位')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // 先建立書籍
      const bookData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        price: formData.price ? parseFloat(formData.price) : null,
        description: formData.description,
        category: formData.category
      }
      
      const newBook = await bookService.createBook(bookData)
      
      // 上傳電子書檔案
      await bookService.uploadEbook(newBook.data.id, formData.ebookFile)
      
      // 如果有封面檔案，上傳封面
      if (formData.coverFile) {
        await bookService.uploadCover(newBook.data.id, formData.coverFile)
      }
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/ebooks')
      }, 2000)
      
    } catch (err) {
      setError('上傳失敗：' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // 處理表單變更
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  return (
    <div className={classes.uploadPageContainer}>
      {/* 頁面標題 */}
      <div className={classes.pageHeader}>
        <div className={classes.headerContent}>
          <h2>📤 上傳電子書</h2>
          <p>上傳新的電子書到系統中</p>
        </div>
        
        <div className={classes.pageActions}>
          <button 
            onClick={() => navigate('/ebooks')}
            className={classes.btnSecondary}
          >
            ← 返回電子書庫
          </button>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className={classes.errorMessage}>
          <span>❌ {error}</span>
          <button onClick={() => setError(null)} className={classes.closeError}>✕</button>
        </div>
      )}

      {/* 成功訊息 */}
      {success && (
        <div className={classes.successMessage}>
          <span>✅ 電子書上傳成功！正在跳轉到電子書庫...</span>
        </div>
      )}

      {/* 上傳表單 */}
      <div className={classes.uploadFormContainer}>
        <form onSubmit={handleSubmit} className={classes.uploadForm}>
          <div className={classes.formSection}>
            <h3>📖 書籍資訊</h3>
            
            <div className={classes.formGroup}>
              <label>標題 *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="請輸入書籍標題"
              />
            </div>
            
            <div className={classes.formGroup}>
              <label>作者 *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                placeholder="請輸入作者姓名"
              />
            </div>
            
            <div className={classes.formRow}>
              <div className={classes.formGroup}>
                <label>ISBN</label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  placeholder="請輸入ISBN"
                />
              </div>
              
              <div className={classes.formGroup}>
                <label>價格</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="請輸入價格"
                />
              </div>
            </div>
            
            <div className={classes.formGroup}>
              <label>分類</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="請輸入分類"
              />
            </div>
            
            <div className={classes.formGroup}>
              <label>描述</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="請輸入書籍描述"
              />
            </div>
          </div>

          <div className={classes.formSection}>
            <h3>📁 電子書檔案</h3>
            
            <div className={classes.formGroup}>
              <label>選擇電子書檔案 *</label>
              <input
                type="file"
                accept=".md"
                onChange={handleEbookFileChange}
                className={classes.fileInput}
                required
              />
              <p className={classes.uploadHint}>
                支援 .md 檔案，最大 50MB
                {formData.ebookFile && (
                  <span className={classes.selectedFile}>
                    📎 已選擇：{formData.ebookFile.name} 
                    ({Math.round(formData.ebookFile.size / 1024)} KB)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className={classes.formSection}>
            <h3>🖼️ 封面圖片</h3>
            
            <div className={classes.formGroup}>
              <label>選擇封面圖片（可選）</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleCoverFileChange}
                className={classes.fileInput}
              />
              <p className={classes.uploadHint}>
                支援 JPG、PNG、GIF、WebP 格式，最大 5MB
                {formData.coverFile && (
                  <span className={classes.selectedFile}>
                    🖼️ 已選擇：{formData.coverFile.name} 
                    ({Math.round(formData.coverFile.size / 1024)} KB)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className={classes.formActions}>
            <button 
              type="button" 
              onClick={() => navigate('/ebooks')} 
              className={classes.btnSecondary}
            >
              取消
            </button>
            <button 
              type="submit" 
              className={classes.btnPrimary}
              disabled={loading}
            >
              {loading ? '⏳ 上傳中...' : '📤 上傳電子書'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EbookUpload 