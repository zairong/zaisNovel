import React, { useEffect, useMemo, useRef, useState } from 'react';
import analyticsService from '../../services/analyticsService';
import { useAuth } from '../../hooks/useAuth';
import classes from './UserInfo.module.scss';

// 動態載入 ECharts（CDN），避免打包依賴
async function ensureEcharts() {
  if (window.echarts) return window.echarts;
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('ECharts 載入失敗'));
    document.head.appendChild(script);
  });
  return window.echarts;
}



// 個人資訊 Tab 組件
function PersonalInfoTab() {
  const { user, userPermissions, handleApplyForAuthor, updateAuthState } = useAuth();
  const [showAuthorForm, setShowAuthorForm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forceUpdate, setForceUpdate] = useState(0);

  // 監聽認證狀態變化
  useEffect(() => {
    console.log('🔍 PersonalInfoTab 認證狀態變化:', {
      user: user ? { id: user.id, role: user.role } : null,
      userPermissions,
      forceUpdate
    });
  }, [user, userPermissions, forceUpdate]);

  const handleAuthorApplication = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!termsAccepted) {
      setError('請先勾選同意條款');
      return;
    }

    setSubmitting(true);
    const result = await handleApplyForAuthor({ termsAccepted });
    setSubmitting(false);

    if (result?.success) {
      setSuccess('申請提交成功！您的權限將在審核通過後更新。');
      setShowAuthorForm(false);
      setTermsAccepted(false);
      
      // 強制重新渲染組件
      setForceUpdate(prev => prev + 1);
      
      // 立即更新認證狀態
      updateAuthState();
      
      // 延遲再次更新，確保狀態同步
      setTimeout(() => {
        updateAuthState();
        setForceUpdate(prev => prev + 1);
        // 觸發全域認證變化事件，確保所有組件都能收到更新
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth-changed'));
        }
      }, 100);
      
      // 再次延遲更新，確保狀態完全同步
      setTimeout(() => {
        updateAuthState();
        setForceUpdate(prev => prev + 1);
      }, 500);
    } else {
      setError(result?.message || '申請失敗，請稍後再試');
    }
  };

  return (
    <div className={classes.personalInfoTab}>
      <div className={classes.infoCard}>
        <h3>基本資訊</h3>
        <div className={classes.infoGrid}>
          <div className={classes.infoItem}>
            <label>用戶名稱：</label>
            <span>{user?.username || '未設定'}</span>
          </div>
          <div className={classes.infoItem}>
            <label>電子郵件：</label>
            <span>{user?.email || '未設定'}</span>
          </div>
          <div className={classes.infoItem}>
            <label>註冊時間：</label>
            <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-TW') : '未知'}</span>
          </div>
          <div className={classes.infoItem}>
            <label>用戶角色：</label>
            <span className={classes.roleBadge}>
              {userPermissions.isAdmin ? '管理員' : userPermissions.isAuthor ? '作者' : '一般用戶'}
            </span>
          </div>
        </div>
      </div>
      
      <div className={classes.infoCard}>
        <h3>權限資訊</h3>
        <div className={classes.permissionsGrid}>
          <div className={classes.permissionItem}>
            <span className={classes.permissionIcon}>📚</span>
            <span>管理書籍：{userPermissions.canManageBooks ? '是' : '否'}</span>
          </div>
          <div className={classes.permissionItem}>
            <span className={classes.permissionIcon}>📤</span>
            <span>上傳書籍：{userPermissions.canUploadBooks ? '是' : '否'}</span>
          </div>
          <div className={classes.permissionItem}>
            <span className={classes.permissionIcon}>👥</span>
            <span>管理用戶：{userPermissions.canManageUsers ? '是' : '否'}</span>
          </div>
          <div className={classes.permissionItem}>
            <span className={classes.permissionIcon}>📊</span>
            <span>查看報表：{userPermissions.canViewReports ? '是' : '否'}</span>
          </div>
        </div>
      </div>

      {/* 申請成為作者區域 */}
      {!userPermissions.isAuthor && !userPermissions.isAdmin && (
        <div className={classes.infoCard}>
          <h3>升級權限</h3>
          <div className={classes.upgradeSection}>
            <div className={classes.upgradeInfo}>
              <p>成為作者後，您可以：</p>
              <ul>
                <li>📚 上傳和管理自己的電子書</li>
                <li>📊 查看書籍的統計數據</li>
                <li>✏️ 編輯和更新書籍內容</li>
                <li>🎯 獲得更多創作機會</li>
              </ul>
            </div>
            
            {!showAuthorForm ? (
              <button
                className={classes.upgradeBtn}
                onClick={() => setShowAuthorForm(true)}
              >
                ✍️ 申請成為作者
              </button>
            ) : (
              <div className={classes.authorForm}>
                {error && (
                  <div className={classes.errorMessage}>
                    <span>❌ {error}</span>
                    <button 
                      onClick={() => setError('')} 
                      className={classes.closeError}
                    >
                      ✕
                    </button>
                  </div>
                )}
                
                {success && (
                  <div className={classes.successMessage}>
                    <span>✅ {success}</span>
                    <button 
                      onClick={() => setSuccess('')} 
                      className={classes.closeSuccess}
                    >
                      ✕
                    </button>
                  </div>
                )}

                <form onSubmit={handleAuthorApplication}>
                  <div className={classes.formGroup}>
                    <label className={classes.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className={classes.checkbox}
                      />
                      <span className={classes.checkboxText}>
                        我已閱讀並同意作者使用條款，了解升級後可上傳與管理自己的電子書。
                      </span>
                    </label>
                  </div>

                  <div className={classes.formActions}>
                    <button 
                      type="submit" 
                      className={classes.submitBtn} 
                      disabled={!termsAccepted || submitting}
                    >
                      {submitting ? '⏳ 提交中...' : '立即升級為作者'}
                    </button>
                    <button 
                      type="button" 
                      className={classes.cancelBtn}
                      onClick={() => {
                        setShowAuthorForm(false);
                        setTermsAccepted(false);
                        setError('');
                        setSuccess('');
                      }}
                    >
                      取消
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 已經是作者或管理員的提示 */}
      {(userPermissions.isAuthor || userPermissions.isAdmin) && (
        <div className={classes.infoCard}>
          <h3>權限狀態</h3>
          <div className={classes.statusSection}>
            <div className={classes.statusMessage}>
              <span className={classes.statusIcon}>🎉</span>
              <span>
                {userPermissions.isAdmin 
                  ? '您已經是管理員，擁有所有權限！' 
                  : '您已經是作者，可以上傳和管理書籍！'
                }
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// 書籍歷史數據 Tab 組件
function BookHistoryTab({
  granularity,
  setGranularity,
  selectedYear,
  setSelectedYear,
  bookId,
  setBookId,
  myBooks,
  availableYears,
  isLoading,
  viewsRef,
  downloadsRef,
  favoritesRef,
  ageChartDomRef,
  setApplyTick,

}) {
  // 如果沒有上傳的書籍，顯示提示訊息
  if (myBooks.length === 0) {
    return (
      <div className={classes.bookHistoryTab}>
        <div className={classes.noBooksMessage}>
          <h3>📚 尚未上傳書籍</h3>
          <p>您目前還沒有上傳任何書籍，因此無法顯示書籍歷史數據。</p>
          <p>請先上傳書籍後，再來查看相關的統計資訊。</p>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.bookHistoryTab}>
      <div className={classes.toolbar}>
        <div className={classes.field}>
          <label title="選擇要查看的年份數據">年份：</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            title="選擇年份"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className={classes.field}>
          <label title="選擇特定書籍或查看全部書籍的數據">我的上傳書籍：</label>
          <select
            value={bookId}
            onChange={e => setBookId(e.target.value)}
            title="選擇書籍"
          >
            <option value="">全部書籍</option>
            {myBooks.map(b => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </div>
        <div className={classes.btnRow}>
          <button
            className={`${classes.btn} ${classes.primary}`}
            onClick={() => setApplyTick(t => t + 1)}
            title="套用所選的篩選條件"
          >
            套用篩選
          </button>
          <button
            className={classes.btn}
            onClick={() => { setSelectedYear(new Date().getFullYear()); setBookId(''); }}
            title="清除所有篩選條件"
          >
            清除
          </button>
        </div>
        <div className={classes.tabs}>
          {['day', 'month', 'year'].map(g => (
            <button key={g} className={`${classes.tabBtn} ${granularity === g ? classes.active : ''}`} onClick={() => setGranularity(g)}>
              {g === 'day' ? '日(24h)' : g === 'month' ? '月(28~31天)' : '年(1~12月)'}
            </button>
          ))}
        </div>
      </div>

      <div className={classes.cards}>
        <section className={classes.card} title="顯示觀看次數的歷史趨勢數據">
          <h3>1. 觀看次數歷史（柱狀圖）</h3>
          <p className={classes.chartDescription}>展示不同時間段的觀看次數統計</p>
          <div ref={viewsRef} className={`${classes.chartBox} ${isLoading ? classes.loading : ''}`} />
        </section>

        <section className={classes.card} title="顯示下載次數的歷史趨勢數據">
          <h3>2. 下載次數歷史（線面積圖）</h3>
          <p className={classes.chartDescription}>展示不同時間段的下載次數統計</p>
          <div ref={downloadsRef} className={`${classes.chartBox} ${isLoading ? classes.loading : ''}`} />
        </section>

        <section className={classes.card} title="顯示收藏數量的歷史趨勢數據">
          <h3>3. 收藏歷史（面積圖）</h3>
          <p className={classes.chartDescription}>展示不同時間段的收藏新增統計</p>
          <div ref={favoritesRef} className={`${classes.chartBox} ${isLoading ? classes.loading : ''}`} />
        </section>

        <section className={classes.card} title="顯示觀看者的年齡分布情況">
          <h3>4. 觀看者年齡分布（圓餅圖）</h3>
          <p className={classes.chartDescription}>展示觀看者的年齡群體分布</p>
          <div ref={ageChartDomRef} className={`${classes.chartBox} ${isLoading ? classes.loading : ''}`} />
        </section>
      </div>
    </div>
  );
}

export default function UserInfo() {
  const {  userPermissions } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [granularity, setGranularity] = useState('day');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [bookId, setBookId] = useState('');
  const [myBooks, setMyBooks] = useState([]);
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const viewsRef = useRef(null);
  const downloadsRef = useRef(null);
  const favoritesRef = useRef(null);
  const ageChartRef = useRef(null);
  const ageChartDomRef = useRef(null);
  const viewsChart = useRef(null);
  const downloadsChart = useRef(null);
  const favoritesChart = useRef(null);
  const [applyTick, setApplyTick] = useState(0);

  // 檢查用戶是否有權限查看書籍歷史數據
  const canViewBookHistory = useMemo(() => {
    // 只有管理員和作者可以查看書籍歷史數據
    return userPermissions.isAdmin || userPermissions.isAuthor;
  }, [userPermissions]);

  // 檢查用戶是否真的有上傳的書籍（用於決定是否載入分析數據）
  const hasUploadedBooks = useMemo(() => {
    return myBooks.length > 0;
  }, [myBooks]);

  // 獲取可用的年份（改用 service 基底 URL，避免 404）
  const fetchAvailableYears = async () => {
    try {
      const data = await analyticsService.getAvailableYears();
      if (data.success && data.data.length > 0) {
        setAvailableYears(data.data);
        // 如果當前選中的年份不在可用年份中，則選擇第一個可用年份
        if (!data.data.includes(selectedYear)) {
          setSelectedYear(data.data[0]);
        }
      } else {
        // 如果沒有數據，使用當前年份
        setAvailableYears([new Date().getFullYear()]);
        setSelectedYear(new Date().getFullYear());
      }
    } catch (error) {
      console.error('獲取可用年份失敗:', error);
      // 如果獲取失敗，使用當前年份
      setAvailableYears([new Date().getFullYear()]);
      setSelectedYear(new Date().getFullYear());
    }
  };

  const fetchAll = async (g) => {
    const [views, downloads, favorites] = await Promise.all([
      analyticsService.getViewsHistory({ granularity: g, year: selectedYear, bookId: bookId || undefined }),
      analyticsService.getDownloadsHistory({ granularity: g, year: selectedYear, bookId: bookId || undefined }),
      analyticsService.getFavoritesHistory({ granularity: g, year: selectedYear, bookId: bookId || undefined })
    ]);
    return { views, downloads, favorites };
  };

  const fetchAgeDistribution = async () => {
    try {
      const data = await analyticsService.getAgeDistribution();
      if (data.success) {
        setAgeDistribution(data.data);
      }
    } catch (error) {
      console.error('獲取年齡分布失敗:', error);
    }
  };

  const renderCharts = async (g) => {
    const E = await ensureEcharts();
    const { views, downloads, favorites } = await fetchAll(g);
    const labelsV = views?.data?.labels || [];
    const seriesV = views?.data?.series || [];
    const labelsD = downloads?.data?.labels || [];
    const seriesD = downloads?.data?.series || [];
    const labelsF = favorites?.data?.labels || [];
    const seriesF = favorites?.data?.series || [];

    // 檢查 DOM 元素是否存在
    if (viewsRef.current && !viewsChart.current) {
      viewsChart.current = E.init(viewsRef.current);
    }
    if (downloadsRef.current && !downloadsChart.current) {
      downloadsChart.current = E.init(downloadsRef.current);
    }
    if (favoritesRef.current && !favoritesChart.current) {
      favoritesChart.current = E.init(favoritesRef.current);
    }
    if (ageChartDomRef.current && !ageChartRef.current) {
      ageChartRef.current = E.init(ageChartDomRef.current);
    }

    // 只有在圖表實例存在時才設置選項
    if (viewsChart.current && viewsRef.current) {
      viewsChart.current.clear();
      viewsChart.current.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: labelsV },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: seriesV, name: '觀看次數' }]
      }, true);
    }

    if (downloadsChart.current && downloadsRef.current) {
      downloadsChart.current.clear();
      downloadsChart.current.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: labelsD },
        yAxis: { type: 'value' },
        series: [{ type: 'line', areaStyle: {}, data: seriesD, name: '下載次數' }]
      }, true);
    }

    if (favoritesChart.current && favoritesRef.current) {
      favoritesChart.current.clear();
      favoritesChart.current.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: labelsF },
        yAxis: { type: 'value' },
        series: [{ type: 'line', areaStyle: {}, data: seriesF, name: '收藏新增次數' }]
      }, true);
    }

    // 渲染年齡分布圓餅圖
    if (ageChartRef.current && ageChartDomRef.current && ageDistribution.length > 0) {
      ageChartRef.current.clear();
      ageChartRef.current.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle'
        },
        series: [
          {
            name: '觀看者年齡分布',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}: {c} ({d}%)'
            },
            labelLine: {
              show: true
            },
            data: ageDistribution.map(item => ({
              value: item.count,
              name: item.age_range === '未知' ? '未知年齡' : item.age_range
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }, true);
    }
  };

  useEffect(() => {
    ; (async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 只有有權限的用戶才載入書籍相關數據
        if (canViewBookHistory) {
          const resp = await analyticsService.getMyBooks();
          if (resp?.success && Array.isArray(resp.data)) {
            setMyBooks(resp.data);
            
            // 只有真正有上傳書籍的用戶才載入分析數據
            if (resp.data.length > 0) {
              await fetchAgeDistribution();
              await fetchAvailableYears();
              await renderCharts(granularity);
            }
          }
        }
      } catch (err) {
        console.error('載入數據失敗:', err);
        setError('載入數據時發生錯誤，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    })();
    
    const onResize = () => {
      viewsChart.current && viewsChart.current.resize();
      downloadsChart.current && downloadsChart.current.resize();
      favoritesChart.current && favoritesChart.current.resize();
      ageChartRef.current && ageChartRef.current.resize();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [canViewBookHistory]);

  useEffect(() => {
    if (canViewBookHistory && hasUploadedBooks && ageDistribution.length > 0 && activeTab === 'history') {
      renderCharts(granularity);
    }
  }, [granularity, selectedYear, bookId, applyTick, ageDistribution, canViewBookHistory, hasUploadedBooks, activeTab]);

  // 處理 tab 切換時的圖表清理
  useEffect(() => {
    if (activeTab !== 'history') {
      // 清理圖表實例
      if (viewsChart.current) {
        viewsChart.current.dispose();
        viewsChart.current = null;
      }
      if (downloadsChart.current) {
        downloadsChart.current.dispose();
        downloadsChart.current = null;
      }
      if (favoritesChart.current) {
        favoritesChart.current.dispose();
        favoritesChart.current = null;
      }
      if (ageChartRef.current) {
        ageChartRef.current.dispose();
        ageChartRef.current = null;
      }
    }
  }, [activeTab]);

  if (error) {
    return (
      <div className={classes.container}>
        <div className={classes.errorContainer}>
          <div className={classes.errorIcon}>⚠️</div>
          <h3 className={classes.errorTitle}>載入失敗</h3>
          <p className={classes.errorMessage}>{error}</p>
          <button
            className={`${classes.btn} ${classes.primary}`}
            onClick={() => window.location.reload()}
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <h2 className={classes.title}>用戶資訊</h2>
      
      {/* 主要 Tab 導航 */}
      <div className={classes.mainTabs}>
        <button
          className={`${classes.mainTabBtn} ${activeTab === 'personal' ? classes.mainTabActive : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          個人資訊
        </button>
        {canViewBookHistory && (
          <button
            className={`${classes.mainTabBtn} ${activeTab === 'history' ? classes.mainTabActive : ''}`}
            onClick={() => setActiveTab('history')}
          >
            書籍歷史數據
          </button>
        )}
      </div>

      {/* Tab 內容 */}
      {activeTab === 'personal' && (
        <PersonalInfoTab />
      )}
      
      {activeTab === 'history' && canViewBookHistory && (
        <BookHistoryTab
          granularity={granularity}
          setGranularity={setGranularity}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          bookId={bookId}
          setBookId={setBookId}
          myBooks={myBooks}
          setMyBooks={setMyBooks}
          ageDistribution={ageDistribution}
          setAgeDistribution={setAgeDistribution}
          availableYears={availableYears}
          setAvailableYears={setAvailableYears}
          isLoading={isLoading}
          setError={setError}
          viewsRef={viewsRef}
          downloadsRef={downloadsRef}
          favoritesRef={favoritesRef}
          ageChartDomRef={ageChartDomRef}
          viewsChart={viewsChart}
          downloadsChart={downloadsChart}
          favoritesChart={favoritesChart}
          ageChartRef={ageChartRef}
          applyTick={applyTick}
          setApplyTick={setApplyTick}
          fetchAvailableYears={fetchAvailableYears}
          fetchAgeDistribution={fetchAgeDistribution}
          fetchAll={fetchAll}
          renderCharts={renderCharts}
        />
      )}
    </div>
  );
}


