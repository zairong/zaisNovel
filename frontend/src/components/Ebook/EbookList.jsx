import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionButton } from '../Permission/PermissionGuard';
import bookService from '../../services/bookService';
import userBookService from '../../services/userBookService';
import BookRating from '../UI/BookRating';
import CommentModal from './CommentModal';
import classes from '../UI/Pages.module.scss';

function EbookList({ userPermissions = {} }) {
  const permissions = usePermissions(userPermissions);
  const navigate = useNavigate();

  // 使用 useRef 來追蹤是否已經載入過，避免重複呼叫
  const hasLoadedRef = useRef(false);
  const currentRequestRef = useRef(null);

  // 狀態管理
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEbooks, setTotalEbooks] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [libraryStatus, setLibraryStatus] = useState({});
  const [showOnlyMyLibrary, setShowOnlyMyLibrary] = useState(false);
  const [bookRatings, setBookRatings] = useState({});
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedBookForComment, setSelectedBookForComment] = useState(null);

  const pageSize = 20;

  // 載入電子書資料
  const loadEbooks = useCallback(async (page = 1, search = '', category = 'all') => {
    // 防止重複呼叫
    if (currentRequestRef.current) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 設置當前請求標記
      currentRequestRef.current = { page, search, category, showOnlyMyLibrary };

      if (showOnlyMyLibrary && userPermissions.isAuthenticated) {
        // 載入我的書庫
        const result = await userBookService.getMyLibrary({ page, pageSize, search, category });
        console.log('📚 我的書庫載入結果:', result);

        if (result.success) {
          // 處理我的書庫數據格式
          const userBooks = result.data.userBooks || [];
          const processedBooks = userBooks.map(userBook => {
            if (userBook.book) {
              return {
                ...userBook.book,
                rating: userBook.rating || 0,
                is_favorite: userBook.is_favorite || false,
                reading_progress: userBook.reading_progress || 0,
                notes: userBook.notes || null
              };
            } else {
              return userBook;
            }
          });

          setEbooks(processedBooks);
          setTotalPages(result.data.pagination?.pages || 1);
          setTotalEbooks(result.data.pagination?.total || processedBooks.length);

          // 設置書庫狀態
          const statusMap = {};
          for (const book of processedBooks) {
            statusMap[book.id] = true;
          }
          setLibraryStatus(statusMap);

          // 載入平均評分數據
          await loadAverageRatings(processedBooks);
        } else {
          setError(result.message || '載入我的書庫失敗');
        }
      } else {
        // 載入所有電子書
        const result = await bookService.getEbooks(page, pageSize, search, category);
        console.log('📚 電子書載入結果:', result);

        if (result.success) {
          const booksData = result.data.data || [];
          setEbooks(booksData);
          setTotalPages(result.data.totalPages || 1);
          setTotalEbooks(result.data.total || booksData.length);

          // 設置類別列表
          const uniqueCategories = [...new Set(booksData.map(b => b.category).filter(Boolean))];
          setCategories(uniqueCategories);

          // 如果用戶已登入，批量檢查書庫狀態
          if (userPermissions.isAuthenticated) {
            try {
              await checkLibraryStatusBatch(booksData);
            } catch (batchError) {
              // 批量處理失敗，但不影響主要資料載入
            }
          }

          // 載入平均評分數據
          await loadAverageRatings(booksData);
        } else {
          setError(result.message || '載入電子書失敗');
        }
      }
    } catch (error) {
      console.error('❌ 載入電子書錯誤:', error);
      setError('載入電子書時發生錯誤');
    } finally {
      setLoading(false);
      currentRequestRef.current = null;
    }
  }, [showOnlyMyLibrary, userPermissions.isAuthenticated]);

  // 載入平均評分數據
  const loadAverageRatings = useCallback(async (books) => {
    try {
      const ratingPromises = books.map(async (book) => {
        try {
          const ratingData = await bookService.getBookRating(book.id);
          return { bookId: book.id, ratingData };
        } catch (error) {
          console.error(`❌ 載入書籍 ${book.id} 評分失敗:`, error);
          return { bookId: book.id, ratingData: null };
        }
      });

      const ratingResults = await Promise.all(ratingPromises);
      const newRatings = {};

      ratingResults.forEach(({ bookId, ratingData }) => {
        if (ratingData && ratingData.success) {
          newRatings[bookId] = ratingData.data;
        }
      });

      setBookRatings(prev => ({ ...prev, ...newRatings }));
    } catch (error) {
      console.error('❌ 載入平均評分錯誤:', error);
    }
  }, []);

  // 批量檢查書庫狀態，減少 API 呼叫
  const checkLibraryStatusBatch = useCallback(async (books) => {
    try {
      const statusMap = {};

      // 批量檢查，減少 API 呼叫
      const statusPromises = books.map(async (book) => {
        try {
          const result = await userBookService.checkBookInLibrary(book.id);
          return { bookId: book.id, inLibrary: result.inLibrary || false, userBook: result.userBook };
        } catch (error) {
          return { bookId: book.id, inLibrary: false, userBook: null };
        }
      });

      const statusResults = await Promise.all(statusPromises);

      statusResults.forEach(({ bookId, inLibrary, userBook }) => {
        statusMap[bookId] = inLibrary;
      });

      setLibraryStatus(statusMap);

      // 更新 ebooks 狀態，包含用戶評分（即使沒有加入書庫）
      setEbooks(prevEbooks => {
        const updatedEbooks = [...prevEbooks];
        statusResults.forEach(({ bookId, inLibrary, userBook }) => {
          const bookIndex = updatedEbooks.findIndex(b => b.id === bookId);
          if (bookIndex !== -1) {
            // 如果有用戶書籍記錄且有評分，則更新評分
            if (userBook && userBook.rating) {
              updatedEbooks[bookIndex] = { ...updatedEbooks[bookIndex], rating: userBook.rating };
            }
            // 更新書庫狀態
            updatedEbooks[bookIndex] = { ...updatedEbooks[bookIndex], inLibrary: inLibrary };
          }
        });
        return updatedEbooks;
      });
    } catch (error) {
      console.error('❌ 批量檢查書庫狀態錯誤:', error);
    }
  }, []);

  // 批量載入書籍評分，減少 API 呼叫
  const loadBookRatingsBatch = useCallback(async (books) => {
    try {
      // 只為有評分的書籍載入評分統計
      const booksWithRatings = books.filter(book => book.rating > 0);
      if (booksWithRatings.length === 0) return;

      const ratingPromises = booksWithRatings.map(async (book) => {
        try {
          const ratingData = await bookService.getBookRating(book.id);
          return { bookId: book.id, rating: ratingData.data };
        } catch (error) {
          return { bookId: book.id, rating: { averageRating: 0, totalRatings: 0, hasRating: false } };
        }
      });

      const ratings = await Promise.all(ratingPromises);
      const ratingsMap = {};
      ratings.forEach(({ bookId, rating }) => {
        ratingsMap[bookId] = rating;
      });
      setBookRatings(ratingsMap);
    } catch (error) {
      // 批量載入書籍評分失敗
    }
  }, []);

  // 加入書庫
  const handleAddToLibrary = async (bookId) => {
    try {
      const result = await userBookService.addToLibrary(bookId);
      if (result.success) {
        setLibraryStatus(prev => ({
          ...prev,
          [bookId]: true
        }));
        setError(null);
      } else {
        setError('加入書庫失敗：' + result.message);
      }
    } catch (error) {
      setError('加入書庫失敗：' + error.message);
    }
  };

  // 從書庫移除
  const handleRemoveFromLibrary = async (bookId) => {
    try {
      const result = await userBookService.removeFromLibrary(bookId);
      if (result.success) {
        setLibraryStatus(prev => ({
          ...prev,
          [bookId]: false
        }));
        setError(null);
      } else {
        setError('從書庫移除失敗：' + result.message);
      }
    } catch (error) {
      setError('從書庫移除失敗：' + error.message);
    }
  };

  // 下載電子書
  const handleDownloadEbook = async (bookId) => {
    try {
      const result = await bookService.downloadEbook(bookId);
      // 樂觀更新下載次數
      setEbooks(prev => prev.map(b => {
        if (b.id === bookId) {
          const current = typeof b.download_count === 'number' ? b.download_count : 0;
          return { ...b, download_count: current + 1 };
        }
        return b;
      }));
    } catch (error) {
      setError('下載失敗：' + error.message);
    }
  };

  // 搜尋電子書
  const handleSearch = useCallback(async () => {
    setCurrentPage(1);
    await loadEbooks(1, searchKeyword, selectedCategory);
  }, [searchKeyword, selectedCategory, loadEbooks]);

  // 依分類篩選
  const handleCategoryFilter = useCallback(async (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    await loadEbooks(1, searchKeyword, category);
  }, [searchKeyword, loadEbooks]);

  // 分頁處理
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    loadEbooks(page, searchKeyword, selectedCategory);
  }, [searchKeyword, selectedCategory, loadEbooks]);

  // 格式化函數
  const formatPrice = (price) => {
    if (!price) return '未設定';
    return `NT$ ${parseFloat(price).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 使用 useMemo 優化計算屬性
  const hasEbooks = useMemo(() => ebooks.length > 0, [ebooks]);
  const showPagination = useMemo(() => totalPages > 1, [totalPages]);

  // 初始載入 - 只在組件掛載時執行一次
  useEffect(() => {
    loadEbooks(1, '', 'all');
    hasLoadedRef.current = true;
  }, []); // 空依賴數組，只在組件掛載時執行一次

  // 處理狀態變化 - 只在初始化後執行，避免重複呼叫
  useEffect(() => {
    if (hasLoadedRef.current) {
      loadEbooks(1, searchKeyword, selectedCategory);
    }
  }, [showOnlyMyLibrary, searchKeyword, selectedCategory]);

  // 處理分頁變化 - 只在初始化後執行
  useEffect(() => {
    if (hasLoadedRef.current && currentPage > 1) {
      loadEbooks(currentPage, searchKeyword, selectedCategory);
    }
  }, [currentPage]);



  // 處理評分更新
  const handleRatingChange = useCallback(async (bookId, newRating) => {
    // 更新本地書籍數據（無論是否在書庫中）
    setEbooks(prev => prev.map(b =>
      b.id === bookId ? { ...b, rating: newRating } : b
    ));

    // 重新載入該書籍的平均評分統計
    try {
      const ratingData = await bookService.getBookRating(bookId);
      if (ratingData.success) {
        setBookRatings(prev => ({
          ...prev,
          [bookId]: ratingData.data
        }));
        console.log(`✅ 更新書籍 ${bookId} 平均評分:`, ratingData.data);
      }
    } catch (error) {
      console.error(`❌ 更新書籍 ${bookId} 平均評分失敗:`, error);
    }
  }, []);

  // 處理開啟評論Modal
  const handleOpenCommentModal = useCallback((book) => {
    setSelectedBookForComment(book);
    setCommentModalOpen(true);
  }, []);

  // 處理關閉評論Modal
  const handleCloseCommentModal = useCallback(() => {
    setCommentModalOpen(false);
    setSelectedBookForComment(null);
  }, []);

  console.log('ebooks', ebooks);

  return (
    <div className={classes.pageContainer}>
      {/* 頁面標題和操作區 */}
      <div className={classes.pageHeader}>
        <div className={classes.headerContent}>
          <div className={classes.headerStats}>
            <span className={classes.statItem}>
              <span className={classes.statNumber}>{totalEbooks}</span>
              <span className={classes.statLabel}>總電子書數</span>
            </span>
            <span className={classes.statItem}>
              <span className={classes.statNumber}>{categories.length}</span>
              <span className={classes.statLabel}>分類數</span>
            </span>
            <span className={classes.statItem}>
              <span className={classes.statNumber}>{currentPage}</span>
              <span className={classes.statLabel}>當前頁面</span>
            </span>
          </div>
        </div>
        {/* 頁面標題 */}
        <div className={classes.pageTitle}>
          📖 {showOnlyMyLibrary ? '我的書庫' : '書庫列表'}
        </div>
        <div className={classes.pageActions}>
          <PermissionButton
            featureName="uploadEbook"
            userPermissions={userPermissions}
            className={classes.btnPrimary}
            onClick={() => navigate('/ebooks/upload')}
          >
            📤 上傳電子書
          </PermissionButton>
        </div>
      </div>

      {/* 搜尋和篩選區 */}
      <div className={classes.searchFilterSection}>
        <div className={classes.searchBox}>
          <input
            type="text"
            placeholder="搜尋電子書標題、作者..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className={classes.searchBtn}>
            🔍 搜尋
          </button>
        </div>

        <div className={classes.filterSection}>
          {/* 切換是否只顯示我的書庫 */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>
            <input
              type="checkbox"
              checked={showOnlyMyLibrary}
              onChange={(e) => setShowOnlyMyLibrary(e.target.checked)}
            />
            只顯示我的書庫
          </label>

          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="category-filter"
          >
            <option value="all">所有分類</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className={classes.errorMessage}>
          <span>❌ {error}</span>
          <button onClick={() => setError(null)} className={classes.closeError}>✕</button>
        </div>
      )}



      {/* 電子書列表 */}
      <div className="ebooks-content">
        {loading ? (
          <div className={classes.loadingContainer}>
            <div className={classes.loadingSpinner}>載入中...</div>
          </div>
        ) : !hasEbooks ? (
          <div className={classes.emptyState}>
            <div className={classes.emptyIcon}>📖</div>
            <h3>目前沒有電子書</h3>
            <p>開始上傳您的第一本電子書吧！</p>
            <p>調試信息: ebooks.length = {ebooks.length}, totalEbooks = {totalEbooks}</p>
            {permissions.canUseFeature('uploadEbook') && (
              <button
                onClick={() => navigate('/ebooks/upload')}
                className={classes.btnPrimary}
              >
                📤 上傳電子書
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={classes.ebooksGrid}>
              {ebooks.map(book => (
                <div key={book.id} className={classes.ebookCard}>
                  {/* 書籍封面 */}
                  <div className={classes.ebookHeader}>
                    {book.has_cover && book.cover_image ? (
                      <div className={classes.ebookCover}>
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
                      <div className={classes.ebookCover}>
                        <div className={classes.coverPlaceholder}>
                          📖
                        </div>
                      </div>
                    )}
                    <h3 className={classes.ebookTitle} data-title={book.title}>{book.title}</h3>
                  </div>
                  {/* 書籍資訊 */}
                  <div className={classes.ebookInfo}>
                    {/* 平均評分 - 所有用戶都可看到 */}
                    <div className={classes.ebookAverageRating}>
                      <p className={classes.ebookAverageRatingText}>
                        ⭐ 平均評分：
                        {bookRatings[book.id] ? (
                          <>
                            <span className={classes.averageRatingValue}>
                              {bookRatings[book.id].averageRating.toFixed(1)}
                            </span>
                            <span className={classes.totalRatingsCount}>
                              （{bookRatings[book.id].totalRatings} 人評分）
                            </span>
                          </>
                        ) : (
                          <span className={classes.noRating}>暫無評分</span>
                        )}
                      </p>
                    </div>
                    <div className={classes.ebookInfoTop}>
                      {/* 書籍作者 */}
                      <p className={classes.ebookAuthor}>👤 {book.author}</p>
                      {/* 書籍分類 */}
                      {book.category && <p className={classes.ebookCategory}>🏷️ {book.category}</p>}

                    </div>
                    <div className={classes.ebookInfoBottom}>
                      {/* 書籍觀看次數 */}
                      <p className={classes.ebookViews}>👀 觀看次數：{book.view_count ?? 0}</p>
                      {/* 書籍下載次數 */}
                      <p className={classes.ebookDownloads}>💾 下載次數：{book.download_count ?? 0}</p>
                    </div>
                    {/* 書籍描述 */}
                    {book.description && (
                      <p className={classes.ebookDescription}>內容簡介：{book.description}</p>
                    )}




                    {/* 用戶評分 - 只有登入用戶才顯示 */}
                    {userPermissions.isAuthenticated && (
                      <div className={classes.ebookRating}>
                        <p className={classes.ebookRatingText}>
                          💫 我的評分：
                        </p>
                        <BookRating
                          bookId={book.id}
                          initialRating={book.rating || 0}
                          onRatingChange={(newRating) => handleRatingChange(book.id, newRating)}
                        />
                      </div>
                    )}

                    {/* 電子書檔案資訊 */}
                    <div className={classes.ebookFileInfo}>
                      <p className={classes.ebookFilename}>📄 檔案：{book.ebook_filename}</p>
                      <p className={classes.ebookSize}>📏 大小：{formatFileSize(book.ebook_size)}</p>
                    </div>
                  </div>
                  {/* 書籍操作按鈕 */}
                  <div className={classes.ebookFooter}>
                    <span className={classes.ebookDate}>
                      建立於 {formatDate(book.created_at)}
                    </span>

                    {/* 電子書操作按鈕 */}
                    <div className={classes.ebookActions}>
                      <button
                        onClick={() => navigate(`/ebooks/${book.id}/read`)}
                        className={classes.btnReadEbook}
                        title="閱讀電子書"
                      >
                        📖 閱讀
                      </button>
                      <button
                        onClick={() => handleDownloadEbook(book.id)}
                        className={classes.btnDownloadEbook}
                        title="下載電子書"
                      >
                        📥 下載
                      </button>
                      <button
                        onClick={() => handleOpenCommentModal(book)}
                        className={classes.btnComment}
                        title="查看評論"
                      >
                        💬 評論
                      </button>

                      {/* 加入書庫按鈕 - 只有登入用戶才顯示 */}
                      {userPermissions.isAuthenticated && (
                        libraryStatus[book.id] ? (
                          <button
                            onClick={() => handleRemoveFromLibrary(book.id)}
                            className={`${classes.btnLibrary} ${classes.btnRemoveFromLibrary}`}
                            title="從書櫃中移除"
                          >
                            ❌ 從書櫃中移除
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddToLibrary(book.id)}
                            className={`${classes.btnLibrary} ${classes.btnAddToLibrary}`}
                            title="加入書庫"
                          >
                            📚 加入書庫
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 分頁控制 */}
            {showPagination && (
              <div className={classes.pagination}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={classes.paginationBtn}
                >
                  ← 上一頁
                </button>

                <div className={classes.paginationInfo}>
                  第 {currentPage} 頁，共 {totalPages} 頁
                  （共 {totalEbooks} 本電子書）
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={classes.paginationBtn}
                >
                  下一頁 →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 評論Modal */}
      {commentModalOpen && selectedBookForComment && (
        <CommentModal
          isOpen={commentModalOpen}
          onClose={handleCloseCommentModal}
          bookId={selectedBookForComment.id}
          bookTitle={selectedBookForComment.title}
        />
      )}
    </div>
  );
}

export default EbookList; 