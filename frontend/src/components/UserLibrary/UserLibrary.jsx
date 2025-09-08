import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionButton } from '../Permission/PermissionGuard';
import userBookService from '../../services/userBookService';
import bookService from '../../services/bookService';
import CommentModal from '../Ebook/CommentModal';
import classes from './UserLibrary.module.scss';

const UserLibrary = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [filter, setFilter] = useState('all'); // all, favorites, completed, in-progress
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedBookForComment, setSelectedBookForComment] = useState(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    loadUserLibrary();
    loadStats();
  }, [currentPage, searchTerm, filter]);

  // 監聽滾動事件，控制回到頂部按鈕的顯示
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 回到頂部功能
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const loadUserLibrary = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm
      };

      // 只有當選擇「珍藏」篩選時才添加 favorite 參數
      if (filter === 'favorites') {
        params.favorite = 'true';
      }

      const result = await userBookService.getMyLibrary(params);

      if (result.success) {
        setUserBooks(result.data.userBooks);
        setTotalPages(result.data.pagination.pages);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('載入書庫失敗');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await userBookService.getReadingStats();
      if (result.success) {
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error('載入統計失敗:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUserLibrary();
  };

  // 開始閱讀或繼續閱讀
  const handleStartReading = (userBook) => {
    // 檢查是否是電子書
    if (userBook.book.ebook_filename) {
      // 導航到電子書閱讀頁面
      navigate(`/ebooks/${userBook.book_id}/read`);
    } else {
      // 導航到一般書籍閱讀頁面
      navigate(`/books/${userBook.book_id}/read`);
    }
  };

  // 獲取閱讀按鈕文字
  const getReadingButtonText = (userBook) => {
    if (userBook.reading_progress > 0) {
      return `📖 繼續閱讀 (${userBook.reading_progress}%)`;
    } else {
      return '📖 開始閱讀';
    }
  };

  // 獲取閱讀按鈕樣式類別
  const getReadingButtonClass = (userBook) => {
    if (userBook.reading_progress > 0) {
      return `${classes.readingButton} ${classes.continueReading}`;
    } else {
      return `${classes.readingButton} ${classes.startReading}`;
    }
  };

  const handleRemoveFromLibrary = async (bookId) => {
    if (!window.confirm('確定要從書庫移除這本書嗎？')) {
      return;
    }

    try {
      const result = await userBookService.removeFromLibrary(bookId);

      if (result.success) {
        setUserBooks(userBooks.filter(ub => ub.book_id !== bookId));
        loadStats(); // 重新載入統計
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('移除書籍失敗');
    }
  };

  const handleUpdateBookStatus = async (bookId, statusData) => {
    try {
      const result = await userBookService.updateBookStatus(bookId, statusData);

      if (result.success) {
        setUserBooks(userBooks.map(ub =>
          ub.book_id === bookId
            ? { ...ub, ...statusData }
            : ub
        ));
        loadStats(); // 重新載入統計
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('更新書籍狀態失敗');
    }
  };

  const handleToggleFavorite = (bookId, currentFavorite) => {
    handleUpdateBookStatus(bookId, { is_favorite: !currentFavorite });
  };

  const handleUpdateProgress = (bookId, progress) => {
    handleUpdateBookStatus(bookId, { reading_progress: progress });
  };

  const handleUpdateRating = (bookId, rating) => {
    handleUpdateBookStatus(bookId, { rating });
  };

  const handleSelectBook = (bookId) => {
    setSelectedBooks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBooks.length === userBooks.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(userBooks.map(ub => ub.book_id));
    }
  };

  const handleBatchRemove = async () => {
    if (!window.confirm(`確定要從書庫移除選中的 ${selectedBooks.length} 本書嗎？`)) {
      return;
    }

    try {
      const promises = selectedBooks.map(bookId =>
        userBookService.removeFromLibrary(bookId)
      );
      await Promise.all(promises);

      setUserBooks(userBooks.filter(ub => !selectedBooks.includes(ub.book_id)));
      setSelectedBooks([]);
      loadStats();
    } catch (error) {
      setError('批量移除失敗');
    }
  };

  // 下載電子書
  const handleDownloadEbook = async (bookId) => {
    try {
      const result = await bookService.downloadEbook(bookId);
      // 樂觀更新下載次數
      setUserBooks(prev => prev.map(ub => {
        if (ub.book_id === bookId && ub.book) {
          const current = typeof ub.book.download_count === 'number' ? ub.book.download_count : 0;
          return {
            ...ub,
            book: { ...ub.book, download_count: current + 1 }
          };
        }
        return ub;
      }));
    } catch (error) {
      setError('下載失敗：' + error.message);
    }
  };

  // 處理開啟評論Modal
  const handleOpenCommentModal = (book) => {
    setSelectedBookForComment(book);
    setCommentModalOpen(true);
  };

  // 處理關閉評論Modal
  const handleCloseCommentModal = () => {
    setCommentModalOpen(false);
    setSelectedBookForComment(null);
  };

  // 處理開啟圖片預覽
  const handleOpenImagePreview = (imageUrl, bookTitle) => {
    setPreviewImage({ url: imageUrl, title: bookTitle });
    setImagePreviewOpen(true);
  };

  // 處理關閉圖片預覽
  const handleCloseImagePreview = () => {
    setImagePreviewOpen(false);
    setPreviewImage(null);
  };

  // 格式化檔案大小
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  const getFilteredBooks = () => {
    if (filter === 'all') return userBooks;
    if (filter === 'favorites') return userBooks.filter(ub => ub.is_favorite);
    if (filter === 'completed') return userBooks.filter(ub => ub.reading_progress === 100);
    if (filter === 'in-progress') return userBooks.filter(ub => ub.reading_progress > 0 && ub.reading_progress < 100);
    return userBooks;
  };

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <div className={classes.loadingSpinner}>載入中...</div>
      </div>
    );
  }

  return (
    <div className={classes.libraryContainer}>
      <div className={classes.libraryHeader}>
        <h2>我的書庫</h2>

        {stats && (
          <div className={classes.statsContainer}>
            <div className={classes.statItem}>
              <span className={classes.statNumber}>{stats.totalBooks}</span>
              <span className={classes.statLabel}>總書籍</span>
            </div>
            <div className={classes.statItem}>
              <span className={classes.statNumber}>{stats.favoriteBooks}</span>
              <span className={classes.statLabel}>珍藏</span>
            </div>
            <div className={classes.statItem}>
              <span className={classes.statNumber}>{stats.completedBooks}</span>
              <span className={classes.statLabel}>已完成</span>
            </div>
            <div className={classes.statItem}>
              <span className={classes.statNumber}>{stats.inProgressBooks}</span>
              <span className={classes.statLabel}>閱讀中</span>
            </div>
            {stats.averageRating > 0 && (
              <div className={classes.statItem}>
                <span className={classes.statNumber}>{stats.averageRating}</span>
                <span className={classes.statLabel}>平均評分</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={classes.libraryControls}>
        <div className={classes.filterControls}>
          <button
            onClick={() => setFilter('all')}
            className={`${classes.filterButton} ${filter === 'all' ? classes.active : ''}`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`${classes.filterButton} ${filter === 'favorites' ? classes.active : ''}`}
          >
            珍藏
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`${classes.filterButton} ${filter === 'in-progress' ? classes.active : ''}`}
          >
            閱讀中
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`${classes.filterButton} ${filter === 'completed' ? classes.active : ''}`}
          >
            已完成
          </button>
        </div>

        <div className={classes.searchControls}>
          <form onSubmit={handleSearch} className={classes.searchForm}>
            <input
              type="text"
              placeholder="搜尋書籍..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={classes.searchInput}
            />
            <button type="submit" className={classes.searchButton}>
              搜尋
            </button>
          </form>

          {selectedBooks.length > 0 && (
            <button
              onClick={handleBatchRemove}
              className={classes.batchRemoveButton}
            >
              移除選中 ({selectedBooks.length})
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className={classes.errorMessage}>
          {error}
        </div>
      )}

      <div className={classes.booksGrid}>
        {getFilteredBooks().map(userBook => (
          <div key={userBook.book_id} className={classes.bookCard}>
            <div className={classes.bookHeader}>
              <input
                type="checkbox"
                checked={selectedBooks.includes(userBook.book_id)}
                onChange={() => handleSelectBook(userBook.book_id)}
                className={classes.bookCheckbox}
              />
              <button
                onClick={() => handleToggleFavorite(userBook.book_id, userBook.is_favorite)}
                className={`${classes.favoriteButton} ${userBook.is_favorite ? classes.favorited : ''}`}
              >
                {userBook.is_favorite ? '❤️' : '🤍'}
              </button>
            </div>

            <div className={classes.bookInfo}>
              {/* 書籍標題 */}
              <h3 className={classes.bookTitle}>{userBook.book.title}</h3>

              {/* 書籍封面和資訊的容器 */}
              <div className={classes.bookContentContainer}>
                {/* 書籍封面 - 左側 */}
                {userBook.book.has_cover && userBook.book.cover_image ? (
                  <div className={classes.bookCover}>
                    <img
                      src={userBook.book.cover_image}
                      alt={userBook.book.title}
                      className={classes.coverImage}
                      onClick={() => handleOpenImagePreview(userBook.book.cover_image, userBook.book.title)}
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
                
                {/* 書籍資訊 - 右側 */}
                <div className={classes.bookInfoRight}>
                  <p className={classes.bookAuthor}>{userBook.book.author}</p>

                  {userBook.book.description && (
                    <p className={classes.bookDescription}>
                      詳情: {userBook.book.description.substring(0, 30)}...
                    </p>
                  )}

                  {/* 顯示書籍類型 */}
                  {userBook.book.ebook_filename && (
                    <p className={classes.bookType}>📖 電子書</p>
                  )}
                </div>
              </div>

              {/* 電子書檔案資訊 */}
              {userBook.book.ebook_filename && (
                <div className={classes.ebookFileInfo}>
                  <p className={classes.ebookFilename}>📄 檔案：{userBook.book.ebook_filename}</p>
                  <p className={classes.ebookSize}>📏 大小：{formatFileSize(userBook.book.ebook_size)}</p>
                </div>
              )}
            </div>

            <div className={classes.bookProgress}>
              <label>閱讀進度:</label>
              <input
                type="range"
                min="0"
                max="100"
                value={userBook.reading_progress}
                onChange={(e) => handleUpdateProgress(userBook.book_id, parseInt(e.target.value))}
                className={classes.progressSlider}
              />
              <span>{userBook.reading_progress}%</span>
            </div>

            <div className={classes.bookRating}>
              <label>評分:</label>
              <div className={classes.ratingStars}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => handleUpdateRating(userBook.book_id, star)}
                    className={`${classes.starButton} ${userBook.rating >= star ? classes.starred : ''}`}
                  >
                    <svg
                      style={{
                        width: '18px',
                        height: '18px',
                        fill: userBook.rating >= star ? '#ffd700' : '#ccc',
                        transition: 'all 0.2s ease'
                      }}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l2.4 7.4H22l-6 4.6 2.4 7.4L12 18.6 5.6 26l2.4-7.4L2 14.4h7.6z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className={classes.bookFooter}>
              <span className={classes.bookDate}>
                建立於 {formatDate(userBook.book.created_at)}
              </span>

              {/* 電子書操作按鈕 */}
              <div className={classes.ebookActions}>
                {/* 閱讀按鈕 */}
                <button
                  onClick={() => handleStartReading(userBook)}
                  className={getReadingButtonClass(userBook)}
                  title={userBook.reading_progress > 0 ? '繼續閱讀' : '開始閱讀'}
                >
                  {getReadingButtonText(userBook)}
                </button>

                {/* 下載按鈕 - 只有電子書才顯示 */}
                {userBook.book.ebook_filename && (
                  <button
                    onClick={() => handleDownloadEbook(userBook.book_id)}
                    className={classes.btnDownloadEbook}
                    title="下載電子書"
                  >
                    📥 下載
                  </button>
                )}

                {/* 編輯按鈕 - 只有電子書且有權限才顯示 */}
                {userBook.book.ebook_filename && permissions.canUseFeature('editEbook') && (
                  <button
                    onClick={() => navigate(`/ebooks/${userBook.book_id}/edit`)}
                    className={classes.btnEditEbook}
                    title="編輯電子書"
                  >
                    ✏️ 編輯
                  </button>
                )}

                {/* 評論按鈕 */}
                <button
                  onClick={() => handleOpenCommentModal(userBook.book)}
                  className={classes.btnComment}
                  title="查看評論"
                >
                  💬 評論
                </button>

                {/* 移除按鈕 */}
                <button
                  onClick={() => handleRemoveFromLibrary(userBook.book_id)}
                  className={classes.removeButton}
                >
                  ❌ 從書庫移除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {getFilteredBooks().length === 0 && (
        <div className={classes.emptyState}>
          <p>您的書庫中還沒有書籍</p>
          <p>去書籍列表添加您喜歡的書籍吧！</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className={classes.pagination}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={classes.pageButton}
          >
            上一頁
          </button>

          <span className={classes.pageInfo}>
            第 {currentPage} 頁，共 {totalPages} 頁
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={classes.pageButton}
          >
            下一頁
          </button>
        </div>
      )}

      {/* 回到頂部按鈕 */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className={classes.scrollToTopButton}
          title="回到頂部"
        >
          ⬆️
        </button>
      )}

      {/* 評論Modal */}
      {commentModalOpen && selectedBookForComment && (
        <CommentModal
          isOpen={commentModalOpen}
          onClose={handleCloseCommentModal}
          bookId={selectedBookForComment.id}
          bookTitle={selectedBookForComment.title}
        />
      )}

      {/* 圖片預覽Modal */}
      {imagePreviewOpen && previewImage && (
        <div className={classes.imagePreviewModal} onClick={handleCloseImagePreview}>
          <div className={classes.imagePreviewContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={classes.closeButton}
              onClick={handleCloseImagePreview}
              title="關閉"
            >
              ✕
            </button>
            <h3 className={classes.previewTitle}>{previewImage.title}</h3>
            <img 
              src={previewImage.url} 
              alt={previewImage.title}
              className={classes.previewImage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLibrary;