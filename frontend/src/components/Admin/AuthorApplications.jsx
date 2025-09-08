import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import classes from './Admin.module.scss';

const AuthorApplications = () => {
  const { handleReviewAuthorApplication, loading } = useAuth();
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewReason, setReviewReason] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  // 模擬獲取申請列表（實際應該從 API 獲取）
  useEffect(() => {
    // 這裡應該調用 API 獲取申請列表
    // 目前使用模擬數據
    const mockApplications = [
      {
        id: 1,
        user_id: 2,
        username: 'testuser1',
        email: 'test1@example.com',
        reason: '我是一名專業的技術寫作者，希望能夠分享我的技術知識和經驗。',
        portfolio: 'https://github.com/testuser1',
        experience: '有5年的技術寫作經驗，曾在多家科技公司擔任技術文檔撰寫工作。',
        status: 'pending',
        applied_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        user_id: 3,
        username: 'testuser2',
        email: 'test2@example.com',
        reason: '我熱愛文學創作，希望能夠在平台上分享我的原創小說。',
        portfolio: 'https://blog.testuser2.com',
        experience: '業餘寫作愛好者，有豐富的創作經驗。',
        status: 'pending',
        applied_at: '2024-01-14T15:45:00Z'
      }
    ];
    setApplications(mockApplications);
  }, []);

  const handleReview = async (status) => {
    if (!selectedApplication) return;

    try {
      const result = await handleReviewAuthorApplication(
        selectedApplication.user_id,
        status,
        reviewReason
      );

      if (result.success) {
        // 更新本地狀態
        setApplications(prev => 
          prev.map(app => 
            app.id === selectedApplication.id 
              ? { ...app, status: status === 'approved' ? 'approved' : 'rejected' }
              : app
          )
        );
        
        setShowReviewModal(false);
        setSelectedApplication(null);
        setReviewReason('');
        
        alert(`申請已${status === 'approved' ? '批准' : '拒絕'}`);
      } else {
        alert(result.message || '操作失敗');
      }
    } catch (error) {
      console.error('審核錯誤:', error);
      alert('操作失敗');
    }
  };

  const openReviewModal = (application) => {
    setSelectedApplication(application);
    setShowReviewModal(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: '待審核', class: 'pending' },
      approved: { text: '已批准', class: 'approved' },
      rejected: { text: '已拒絕', class: 'rejected' }
    };
    
    const statusInfo = statusMap[status] || statusMap.pending;
    return <span className={`${classes.statusBadge} ${classes[statusInfo.class]}`}>{statusInfo.text}</span>;
  };

  return (
    <div className={classes.adminContainer}>
      <div className={classes.adminCard}>
        <h2 className={classes.adminTitle}>作者申請管理</h2>
        
        <div className={classes.applicationsList}>
          {applications.length === 0 ? (
            <div className={classes.emptyState}>
              <p>目前沒有待審核的申請</p>
            </div>
          ) : (
            applications.map(application => (
              <div key={application.id} className={classes.applicationCard}>
                <div className={classes.applicationHeader}>
                  <div className={classes.userInfo}>
                    <h3>{application.username}</h3>
                    <p>{application.email}</p>
                  </div>
                  <div className={classes.applicationMeta}>
                    {getStatusBadge(application.status)}
                    <span className={classes.appliedDate}>
                      {new Date(application.applied_at).toLocaleDateString('zh-TW')}
                    </span>
                  </div>
                </div>

                <div className={classes.applicationContent}>
                  <div className={classes.contentSection}>
                    <h4>申請原因</h4>
                    <p>{application.reason}</p>
                  </div>

                  {application.portfolio && (
                    <div className={classes.contentSection}>
                      <h4>作品集</h4>
                      <p>{application.portfolio}</p>
                    </div>
                  )}

                  {application.experience && (
                    <div className={classes.contentSection}>
                      <h4>創作經驗</h4>
                      <p>{application.experience}</p>
                    </div>
                  )}
                </div>

                {application.status === 'pending' && (
                  <div className={classes.applicationActions}>
                    <button
                      onClick={() => openReviewModal(application)}
                      className={classes.reviewButton}
                    >
                      審核申請
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 審核模態框 */}
      {showReviewModal && selectedApplication && (
        <div className={classes.modalOverlay}>
          <div className={classes.modal}>
            <h3>審核作者申請</h3>
            <p>申請者：{selectedApplication.username}</p>
            
            <div className={classes.reviewForm}>
              <label>
                審核意見（可選）：
                <textarea
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  placeholder="請輸入審核意見..."
                  rows="3"
                />
              </label>
            </div>

            <div className={classes.modalActions}>
              <button
                onClick={() => setShowReviewModal(false)}
                className={classes.cancelButton}
                disabled={loading}
              >
                取消
              </button>
              <button
                onClick={() => handleReview('rejected')}
                className={classes.rejectButton}
                disabled={loading}
              >
                拒絕
              </button>
              <button
                onClick={() => handleReview('approved')}
                className={classes.approveButton}
                disabled={loading}
              >
                批准
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorApplications;
