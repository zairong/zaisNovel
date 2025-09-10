import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import authService from '../../services/authService';
import { PermissionButton, FeaturePermissionGuard } from '../Permission/PermissionGuard';
import bookService from '../../services/bookService';
import classes from '../UI/Pages.module.scss';

function Books({ userPermissions = {} }) {
  const permissions = usePermissions(userPermissions);
  const navigate = useNavigate();

  // 狀態管理
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [categories, setCategories] = useState([]);
  const [uploadingEbook, setUploadingEbook] = useState(false);

  // 新增書籍表單狀態
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    price: '',
    description: '',
    category: ''
  });

  // 載入書籍資料
  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookService.getAllBooks();

      if (response && response.success) {
        setBooks(response.data);

        // 提取所有分類
        const uniqueCategories = [...new Set(response.data.map(book => book.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } else {
        setError('載入書籍失敗：' + (response?.message || '未知錯誤'));
      }
    } catch (err) {
      setError('載入書籍失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentUser = authService.getCurrentUser();
  const isAdmin = authService.getUserRole() === 'admin';
  const isAuthor = authService.getUserRole() === 'author';
  const isOwner = (book) => isAuthor && currentUser && book.author_id === currentUser.id;

  // 搜尋書籍
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      await loadBooks();
      return;
    }

    try {
      setLoading(true);
      const response = await bookService.searchBooks(searchKeyword);

      if (response && response.success) {
        setBooks(response.data);
      } else {
        setError('搜尋失敗：' + (response?.message || '未知錯誤'));
      }
    } catch (err) {
      setError('搜尋失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 依分類篩選
  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category);

    if (category === 'all') {
      await loadBooks();
      return;
    }

    try {
      setLoading(true);
      const response = await bookService.getBooksByCategory(category);

      if (response && response.success) {
        setBooks(response.data);
      } else {
        setError('篩選失敗：' + (response?.message || '未知錯誤'));
      }
    } catch (err) {
      setError('篩選失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 新增書籍
  const handleAddBook = async (e) => {
    e.preventDefault();

    try {
      const bookData = {
        ...newBook,
        price: newBook.price ? parseFloat(newBook.price) : null
      };

      await bookService.createBook(bookData);
      setShowAddModal(false);
      setNewBook({ title: '', author: '', isbn: '', price: '', description: '', category: '' });
      await loadBooks();
    } catch (err) {
      setError('新增書籍失敗：' + err.message);
    }
  };

  // 編輯書籍
  const handleEditBook = async (e) => {
    e.preventDefault();

    try {
      // 僅提交必要欄位，避免附帶大型欄位（如 cover_image）
      const bookData = {
        title: editingBook.title,
        author: editingBook.author,
        isbn: editingBook.isbn || undefined,
        price: editingBook.price ? parseFloat(editingBook.price) : null,
        description: editingBook.description || undefined,
        category: editingBook.category || undefined
      };

      await bookService.updateBook(editingBook.id, bookData);
      setShowEditModal(false);
      setEditingBook(null);
      await loadBooks();
    } catch (err) {
      setError('更新書籍失敗：' + err.message);
    }
  };

  // 刪除書籍
  const handleDeleteBook = async (id) => {
    if (!window.confirm('確定要刪除這本書嗎？')) return;

    try {
      await bookService.deleteBook(id);
      await loadBooks();
    } catch (err) {
      setError('刪除書籍失敗：' + err.message);
    }
  };

  // 上傳電子書
  const handleUploadEbook = async (bookId, file) => {
    if (!file) {
      setError('請選擇要上傳的檔案');
      return;
    }

    // 檢查檔案類型
    if (!file.name.toLowerCase().endsWith('.md')) {
      setError('只允許上傳 .md 檔案');
      return;
    }

    // 檢查檔案大小（50MB）
    if (file.size > 50 * 1024 * 1024) {
      setError('檔案大小不能超過 50MB');
      return;
    }

    try {
      setUploadingEbook(true);
      setError(null);
      await bookService.uploadEbook(bookId, file);
      await loadBooks();
      alert('電子書上傳成功！');
    } catch (err) {
      setError('上傳電子書失敗：' + err.message);
    } finally {
      setUploadingEbook(false);
    }
  };

  // 刪除電子書
  const handleDeleteEbook = async (bookId) => {
    if (!window.confirm('確定要刪除這本書的電子書檔案嗎？')) return;

    try {
      await bookService.deleteEbook(bookId);
      await loadBooks();
      alert('電子書檔案刪除成功！');
    } catch (err) {
      setError('刪除電子書失敗：' + err.message);
    }
  };

  // 上傳封面
  const handleUploadCover = async (bookId, file) => {
    if (!file) {
      setError('請選擇要上傳的封面圖片');
      return;
    }

    // 檢查檔案類型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('只允許上傳 JPG、PNG、GIF、WebP 格式的圖片');
      return;
    }

    // 檢查檔案大小 (最大 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('封面圖片大小不能超過 5MB');
      return;
    }

    try {
      await bookService.uploadCover(bookId, file);
      await loadBooks();
      // 更新編輯中的書籍資料 - 等待 loadBooks 完成後再查找
      setTimeout(() => {
        const updatedBook = books.find(book => book.id === bookId);
        if (updatedBook) {
          setEditingBook(updatedBook);
        }
      }, 100);
      alert('封面上傳成功！');
    } catch (err) {
      setError('上傳封面失敗：' + err.message);
    }
  };

  // 刪除封面
  const handleDeleteCover = async (bookId) => {
    if (!window.confirm('確定要刪除這本書的封面圖片嗎？')) return;

    try {
      await bookService.deleteCover(bookId);
      await loadBooks();
      // 更新編輯中的書籍資料 - 等待 loadBooks 完成後再查找
      setTimeout(() => {
        const updatedBook = books.find(book => book.id === bookId);
        if (updatedBook) {
          setEditingBook(updatedBook);
        }
      }, 100);
      alert('封面刪除成功！');
    } catch (err) {
      setError('刪除封面失敗：' + err.message);
    }
  };

  // 格式化價格
  const formatPrice = (price) => {
    if (!price) return '未設定';
    return `NT$ ${parseFloat(price).toLocaleString()}`;
  };

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  // 格式化檔案大小
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 截斷文字函數
  const truncateText = (text, maxLength = 16) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // 初始化載入
  useEffect(() => {
    loadBooks();
  }, []);

  return (
    <div className={classes.pageContainer}>
      {/* 頁面標題和操作區 */}
      <div className={classes.pageHeader}>
        <div className={classes.headerStats}>
          <span className={classes.statItem}>
            <span className={classes.statNumber}>{books.length}</span>
            <span className={classes.statLabel}>總書籍數</span>
          </span>
        </div>
        <div className={classes.headerStats}>
          <span className={classes.statItem}>
            <span className={classes.statNumber}>{categories.length}</span>
            <span className={classes.statLabel}>分類數</span>
          </span>
        </div>

        <div className={classes.headerStats}>
          <span className={classes.statItem}>
            <span className={classes.statNumber}>{books.length}</span>
            <span className={classes.statLabel}>總書籍數</span>
          </span>
        </div>
        {/* 搜尋和篩選區 */}
        <div className={classes.searchFilterSection}>
          <div className={classes.searchBox}>
            <input
              type="text"
              placeholder="搜尋書籍標題、作者或描述..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className={classes.searchBtn}>
              🔍 搜尋
            </button>
          </div>

          <div className={classes.filterSection}>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className={classes.categoryFilter}
            >
              <option value="all">所有分類</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        {/* 新增書籍按鈕 */}
        <div className={classes.pageActions}>
          <PermissionButton
            featureName="createBook"
            userPermissions={userPermissions}
            className={classes.btnPrimary}
            onClick={() => setShowAddModal(true)}
          >
            ✨ 新增書籍
          </PermissionButton>
        </div>

      </div>



      {/* 錯誤訊息 */}
      {error && (
        <div className={classes.errorMessage}>
          <span>❌ {error}</span>
          <button onClick={() => setError(null)} className={classes.closeError}>✕</button>
        </div>
      )}

      {/* 書籍列表 */}
      <div className={classes.booksContent}>
        {loading ? (
          <div className={classes.loadingContainer}>
            <div className={classes.loadingSpinner}>載入中...</div>
          </div>
        ) : (Array.isArray(books) && books.length === 0) ? (
          <div className={classes.emptyState}>
            <div className={classes.emptyIcon}>📖</div>
            <h3>目前沒有書籍</h3>
            <p>開始新增您的第一本書吧！</p>
            {permissions.canUseFeature('createBook') && (
              <button
                onClick={() => setShowAddModal(true)}
                className={classes.btnPrimary}
              >
                ✨ 新增書籍
              </button>
            )}
          </div>
        ) : (
          <div className={classes.booksGrid}>
            {Array.isArray(books) && books.map(book => (
              <div key={book.id} className={classes.bookCard}>
                <div className={classes.bookHeader}>
                  <h3 className={classes.bookTitle} data-title={book.title}>{book.title}</h3>
                  {/* 書籍封面 */}
                  {book.has_cover && book.cover_image ? (
                    <div className={classes.bookCover}>
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className={classes.coverImage}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className={classes.coverPlaceholder} style={{ display: 'none' }}>
                        📖
                      </div>
                    </div>
                  ) : (
                    <div className={classes.bookCover}>
                      <div className={classes.coverPlaceholder}>
                        📖
                      </div>
                    </div>
                  )}


                </div>

                <div className={classes.bookInfo}>
                  {/*  */}
                  <div className={classes.bookInfoTop}>
                    <div className={classes.bookActions}>
                      {permissions.canUseFeature('editBook') && (isAdmin || isOwner(book)) && (
                        <button
                          onClick={() => {
                            setEditingBook(book);
                            setShowEditModal(true);
                          }}
                          className={classes.btnEdit}
                          title="編輯書籍"
                        >
                          ⚔️
                        </button>
                      )}
                      {((isAdmin && permissions.canUseFeature('deleteBook')) ||
                        (isOwner(book) && permissions.canUseFeature('editBook'))) && (
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className={classes.btnDelete}
                            title="刪除書籍"
                          >
                            💀
                          </button>
                        )}
                    </div>
                    <div >👤作者: {book.author}</div>
                    {book.category && <div >🏷️ {book.category}</div>}
                  </div>
                  {/* 電子書狀態 */}
                  <p className="ebook-status-debug">📖 電子書狀態: {book.has_ebook ? '有' : '無'}</p>
                  {book.has_ebook && (
                    <div className={classes.ebookInfo}>
                      <p className="ebook-status">📄 電子書：{book.ebook_filename}</p>
                      <p className="ebook-size">📏 大小：{formatFileSize(book.ebook_size)}</p>
                    </div>
                  )}
                </div>
                {/* 書籍底部 */}
                <div className={classes.bookFooter}>
                  {/* 建立日期 */}
                  <div className={classes.bookDate}>
                    建立於 {formatDate(book.created_at)}
                  </div>

                  {/* 電子書操作按鈕 */}
                  <div className={classes.ebookActions}>
                    <button
                      onClick={() => navigate(`/ebooks/${book.id}/read`)}
                      className={classes.btnReadEbook}
                      title="閱讀電子書"
                    >
                      📖 閱讀
                    </button>

                    {book.has_ebook && permissions.canUseFeature('editEbook') && (
                      <button
                        onClick={() => navigate(`/ebooks/${book.id}/edit`)}
                        className={classes.btnEditEbook}
                        title="編輯電子書"
                      >
                        ✏️ 編輯
                      </button>
                    )}

                    {book.has_ebook ? (
                      <>
                        {((isAdmin && permissions.canUseFeature('deleteEbook')) ||
                          (isOwner(book) && permissions.canUseFeature('editEbook'))) && (
                            <button
                              onClick={() => handleDeleteEbook(book.id)}
                              className={classes.btnDeleteEbook}
                              title="刪除電子書"
                            >
                              🗑️ 刪除
                            </button>
                          )}
                      </>
                    ) : (
                      permissions.canUseFeature('uploadEbook') && (isAdmin || isOwner(book)) && (
                        <div className={classes.uploadEbookSection}>
                          <input
                            type="file"
                            accept=".md"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleUploadEbook(book.id, file);
                              }
                            }}
                            style={{ display: 'none' }}
                            id={`upload-ebook-${book.id}`}
                          />
                          <label
                            htmlFor={`upload-ebook-${book.id}`}
                            className={classes.btnUploadEbook}
                            title="上傳電子書"
                          >
                            {uploadingEbook ? '⏳ 上傳中...' : '📤 上傳電子書'}
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新增書籍模態框 */}
      {showAddModal && createPortal(
        (
          <div className={classes.modalOverlay}>
            <div className={classes.modalContent}>
              <div className={classes.modalHeader}>
                <h3>✨ 新增書籍</h3>
                <button onClick={() => setShowAddModal(false)} className={classes.modalClose}>✕</button>
              </div>

              <form onSubmit={handleAddBook} className={classes.bookForm}>
                <div className={classes.formGroup}>
                  <label>標題 *</label>
                  <input
                    type="text"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    required
                  />
                </div>

                <div className={classes.formGroup}>
                  <label>作者 *</label>
                  <input
                    type="text"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    required
                  />
                </div>

                <div className={classes.formRow}>
                  <div className={classes.formGroup}>
                    <label>ISBN</label>
                    <input
                      type="text"
                      value={newBook.isbn}
                      onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    />
                  </div>

                  <div className={classes.formGroup}>
                    <label>價格</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newBook.price}
                      onChange={(e) => setNewBook({ ...newBook, price: e.target.value })}
                    />
                  </div>
                </div>

                <div className={classes.formGroup}>
                  <label>分類</label>
                  <input
                    type="text"
                    value={newBook.category}
                    onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                  />
                </div>

                <div className={classes.formGroup}>
                  <label>描述</label>
                  <textarea
                    value={newBook.description}
                    onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                    rows="3"
                  />
                </div>

                <div className={classes.formActions}>
                  <button type="button" onClick={() => setShowAddModal(false)} className={classes.btnSecondary}>
                    取消
                  </button>
                  <button type="submit" className={classes.btnPrimary}>
                    新增書籍
                  </button>
                </div>
              </form>
            </div>
          </div>
        ),
        document.body
      )}

      {/* 編輯書籍模態框 */}
      {showEditModal && editingBook && createPortal(
        (
          <div className={classes.modalOverlay}>
            <div className={classes.modalContent}>
              <div className={classes.modalHeader}>
                <h3>⚔️ 編輯書籍</h3>
                <button onClick={() => setShowEditModal(false)} className={classes.modalClose}>✕</button>
              </div>

              <form onSubmit={handleEditBook} className={classes.bookForm}>
                <div className={classes.formGroup}>
                  <label>標題 *</label>
                  <input
                    type="text"
                    value={editingBook.title}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                    required
                  />
                </div>

                <div className={classes.formGroup}>
                  <label>作者 *</label>
                  <input
                    type="text"
                    value={editingBook.author}
                    onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                    required
                  />
                </div>

                <div className={classes.formRow}>
                  <div className={classes.formGroup}>
                    <label>ISBN</label>
                    <input
                      type="text"
                      value={editingBook.isbn || ''}
                      onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value })}
                    />
                  </div>

                  <div className={classes.formGroup}>
                    <label>價格</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingBook.price || ''}
                      onChange={(e) => setEditingBook({ ...editingBook, price: e.target.value })}
                    />
                  </div>
                </div>

                <div className={classes.formGroup}>
                  <label>分類</label>
                  <input
                    type="text"
                    value={editingBook.category || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                  />
                </div>

                <div className={classes.formGroup}>
                  <label>描述</label>
                  <textarea
                    value={editingBook.description || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                    rows="3"
                  />
                </div>

                {/* 封面編輯區域 */}
                <div className={classes.formGroup}>
                  <label>封面圖片</label>
                  <div className={classes.coverEditSection}>
                    {editingBook.has_cover && editingBook.cover_image ? (
                      <div className={classes.coverInfoDisplay}>
                        <div className={classes.coverPreview}>
                          <img
                            src={editingBook.cover_image}
                            alt={editingBook.title}
                            className={classes.coverPreviewImage}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div className={classes.coverPreviewPlaceholder} style={{ display: 'none' }}>
                            📖
                          </div>
                        </div>
                        <div className={classes.coverActions}>
                          <p>🖼️ 檔案：{editingBook.cover_filename}</p>
                          <div className={classes.coverActionButtons}>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleUploadCover(editingBook.id, file);
                                }
                              }}
                              style={{ display: 'none' }}
                              id="cover-upload-edit"
                            />
                            <label htmlFor="cover-upload-edit" className={classes.btnUploadCover}>
                              📤 更換封面
                            </label>
                            <button
                              type="button"
                              onClick={() => handleDeleteCover(editingBook.id)}
                              className={classes.btnDeleteCover}
                            >
                              🗑️ 刪除封面
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={classes.coverUploadSection}>
                        <div className={classes.coverUploadArea}>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleUploadCover(editingBook.id, file);
                              }
                            }}
                            style={{ display: 'none' }}
                            id="cover-upload-new"
                          />
                          <label htmlFor="cover-upload-new" className={classes.coverUploadButton}>
                            <span className={classes.uploadIcon}>🖼️</span>
                            <span className={classes.uploadText}>上傳封面圖片</span>
                          </label>
                          <p className={classes.uploadHint}>支援 JPG、PNG、GIF、WebP 格式，最大 5MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 電子書上傳區域 */}
                <div className={classes.formGroup}>
                  <label>電子書檔案</label>
                  <div className={classes.ebookUploadSection}>
                    {editingBook.has_ebook ? (
                      <div className={classes.ebookInfoDisplay}>
                        <p>📄 檔案：{editingBook.ebook_filename}</p>
                        <p>📏 大小：{formatFileSize(editingBook.ebook_size)}</p>
                        {permissions.canUseFeature('deleteEbook') && (
                          <button
                            type="button"
                            onClick={() => handleDeleteEbook(editingBook.id)}
                            className={classes.btnDeleteEbook}
                          >
                            🗑️ 刪除電子書
                          </button>
                        )}
                      </div>
                    ) : (
                      permissions.canUseFeature('uploadEbook') && (
                        <div className={classes.uploadSection}>
                          <input
                            type="file"
                            accept=".md"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleUploadEbook(editingBook.id, file);
                              }
                            }}
                            className={classes.fileInput}
                          />
                          <p className={classes.uploadHint}>支援 .md 檔案，最大 50MB</p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className={classes.formActions}>
                  <button type="button" onClick={() => setShowEditModal(false)} className={classes.btnSecondary}>
                    取消
                  </button>
                  <button type="submit" className={classes.btnPrimary}>
                    更新書籍
                  </button>
                </div>
              </form>
            </div>
          </div>
        ),
        document.body
      )}
    </div>
  );
}

export default Books; 