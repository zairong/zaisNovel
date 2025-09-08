import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import commentService from '../../services/commentService';
import BookRating from '../UI/BookRating';
import classes from './CommentModal.module.scss';

const CommentModal = ({ isOpen, onClose, bookId, bookTitle }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);

  // 載入評論
  const loadComments = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await commentService.getBookComments(bookId, page, 10);
      setComments(response.data.comments);
      setTotalPages(response.data.pagination.total_pages);
      setTotalComments(response.data.pagination.total_count);
      setCurrentPage(response.data.pagination.current_page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 提交新評論
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('請輸入評論內容');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await commentService.createComment(bookId, {
        content: newComment.trim(),
        rating: newRating > 0 ? newRating : null
      });
      
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      setNewRating(0);
      setTotalComments(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 開始編輯評論
  const handleStartEdit = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
    setEditRating(comment.rating || 0);
  };

  // 取消編輯
  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
    setEditRating(0);
  };

  // 提交編輯
  const handleSubmitEdit = async (commentId) => {
    if (!editContent.trim()) {
      setError('請輸入評論內容');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await commentService.updateComment(commentId, {
        content: editContent.trim(),
        rating: editRating > 0 ? editRating : null
      });
      
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId ? response.data : comment
        )
      );
      handleCancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 刪除評論
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('確定要刪除這條評論嗎？')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await commentService.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setTotalComments(prev => prev - 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-TW');
  };

  // 當Modal打開時載入評論
  useEffect(() => {
    if (isOpen && bookId) {
      loadComments();
    }
  }, [isOpen, bookId]);

  if (!isOpen) return null;

  return (
    <div className={classes.modalOverlay} onClick={onClose}>
      <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={classes.modalHeader}>
          <h2>📝 {bookTitle} - 評論區</h2>
          <button className={classes.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={classes.modalBody}>
          {/* 錯誤訊息 */}
          {error && (
            <div className={classes.errorMessage}>
              ❌ {error}
            </div>
          )}

          {/* 新增評論表單 */}
          {user && (
            <div className={classes.addCommentForm}>
              <h3>💬 發表評論</h3>
              <form onSubmit={handleSubmitComment}>
                <div className={classes.ratingSection}>
                  <label>評分（可選）：</label>
                  <BookRating
                    initialRating={newRating}
                    onRatingChange={setNewRating}
                    size="small"
                  />
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="分享您對這本書的看法..."
                  className={classes.commentTextarea}
                  rows="4"
                  maxLength="1000"
                />
                <div className={classes.charCount}>
                  {newComment.length}/1000
                </div>
                <button 
                  type="submit" 
                  className={classes.submitButton}
                  disabled={loading || !newComment.trim()}
                >
                  {loading ? '發表中...' : '發表評論'}
                </button>
              </form>
            </div>
          )}

          {/* 評論列表 */}
          <div className={classes.commentsSection}>
            <h3>💭 評論列表 ({totalComments})</h3>
            
            {loading && comments.length === 0 ? (
              <div className={classes.loadingMessage}>
                🔄 載入評論中...
              </div>
            ) : comments.length === 0 ? (
              <div className={classes.emptyMessage}>
                📭 還沒有評論，來發表第一篇評論吧！
              </div>
            ) : (
              <div className={classes.commentsList}>
                {comments.map(comment => (
                  <div key={comment.id} className={classes.commentItem}>
                    <div className={classes.commentHeader}>
                      <div className={classes.userInfo}>
                        <span className={classes.username}>
                          👤 {comment.user?.username || '匿名用戶'}
                        </span>
                        <span className={classes.commentDate}>
                          📅 {formatDate(comment.created_at)}
                        </span>
                      </div>
                      
                      {/* 評分顯示 */}
                      {comment.rating && (
                        <div className={classes.commentRating}>
                          <span>⭐ {comment.rating}/5</span>
                        </div>
                      )}
                    </div>

                    <div className={classes.commentContent}>
                      {editingComment === comment.id ? (
                        <div className={classes.editForm}>
                          <div className={classes.ratingSection}>
                            <label>評分：</label>
                            <BookRating
                              initialRating={editRating}
                              onRatingChange={setEditRating}
                              size="small"
                            />
                          </div>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className={classes.editTextarea}
                            rows="3"
                            maxLength="1000"
                          />
                          <div className={classes.editActions}>
                            <button 
                              onClick={() => handleSubmitEdit(comment.id)}
                              className={classes.saveButton}
                              disabled={loading}
                            >
                              💾 儲存
                            </button>
                            <button 
                              onClick={handleCancelEdit}
                              className={classes.cancelButton}
                              disabled={loading}
                            >
                              ❌ 取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p>{comment.content}</p>
                      )}
                    </div>

                    {/* 操作按鈕 */}
                    {user && (user.id === comment.user?.id || user.role === 'admin') && (
                      <div className={classes.commentActions}>
                        {editingComment !== comment.id && (
                          <>
                            <button 
                              onClick={() => handleStartEdit(comment)}
                              className={classes.editButton}
                              disabled={loading}
                            >
                              ✏️ 編輯
                            </button>
                            <button 
                              onClick={() => handleDeleteComment(comment.id)}
                              className={classes.deleteButton}
                              disabled={loading}
                            >
                              🗑️ 刪除
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 分頁 */}
            {totalPages > 1 && (
              <div className={classes.pagination}>
                <button 
                  onClick={() => loadComments(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className={classes.pageButton}
                >
                  ← 上一頁
                </button>
                <span className={classes.pageInfo}>
                  第 {currentPage} 頁，共 {totalPages} 頁
                </span>
                <button 
                  onClick={() => loadComments(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className={classes.pageButton}
                >
                  下一頁 →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
