import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classes from './Home.module.scss';
import { Icon } from '../icons';
import { useToast } from '../UI/Toast';
import Modal from '../UI/Modal';

const Home = ({ userPermissions = {} }) => {
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const navigate = useNavigate();
  const {  showInfo } = useToast();

  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: '前往',
    cancelText: '取消',
    onConfirm: null,
    hideCancel: false
  });

  const closeModal = () => setModal(prev => ({ ...prev, open: false }));

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

  // 按鈕點擊處理函數
  const handleButtonClick = (buttonType) => {
    switch (buttonType) {
      case 'darkPower': // 暗黑力量 - 書籍管理
        if (!userPermissions.isAuthenticated) {
          setModal({
            open: true,
            title: '需要登入',
            message: '此功能需要登入後才能使用，請先登入或註冊。',
            confirmText: '前往登入/註冊',
            cancelText: '稍後',
            onConfirm: () => { closeModal(); navigate('/auth'); },
            hideCancel: false
          });
          return;
        }
        if (!userPermissions.canManageBooks) {
          setModal({
            open: true,
            title: '權限不足',
            message: '您沒有管理書籍的權限。若需要使用，請聯繫管理員開通權限。',
            confirmText: '我知道了',
            cancelText: '',
            onConfirm: () => { closeModal(); },
            hideCancel: true
          });
          return;
        }
        navigate('/books');
        break;
        
      case 'evilRule': // 邪惡統治 - 用戶管理
        if (!userPermissions.isAuthenticated) {
          setModal({
            open: true,
            title: '需要登入',
            message: '此功能需要登入後才能使用，請先登入或註冊。',
            confirmText: '前往登入/註冊',
            cancelText: '稍後',
            onConfirm: () => { closeModal(); navigate('/auth'); },
            hideCancel: false
          });
          return;
        }
        if (!userPermissions.canManageUsers) {
          setModal({
            open: true,
            title: '權限不足',
            message: '您沒有管理用戶的權限（需要管理者權限）。',
            confirmText: '我知道了',
            cancelText: '',
            onConfirm: () => { closeModal(); },
            hideCancel: true
          });
          return;
        }
        navigate('/admin/users');
        break;
        
      case 'deathKnowledge': // 死亡知識 - 電子書庫
        navigate('/ebooks');
        break;
        
      default:
        showInfo('功能開發中...', 2000);
    }
  };

  // 功能卡片點擊處理
  const handleFeatureClick = (title) => {
    switch (title) {
      case '黑暗圖書館': // 規則1：登入→我的書庫，未登入→提示並導向登入
        if (!userPermissions.isAuthenticated) {
          setModal({
            open: true,
            title: '需要登入',
            message: '前往「我的書庫」需要先登入，是否現在登入/註冊？',
            confirmText: '前往登入/註冊',
            cancelText: '稍後',
            onConfirm: () => { closeModal(); navigate('/auth'); },
            hideCancel: false
          });
          return;
        }
        navigate('/my-library');
        break;

      case '邪惡書庫': // 規則2：直接進入電子書庫
        navigate('/ebooks');
        break;

      case '獻祭儀式': // 規則3：上傳電子書（需作者）。未登入→直接登入；登入但非作者→提示是否成為作者
        if (!userPermissions.isAuthenticated) {
          navigate('/auth');
          return;
        }
        if (!userPermissions.isAuthor) {
          setModal({
            open: true,
            title: '需要作者資格',
            message: '進行獻祭儀式（上傳電子書）需要作者資格。是否前往成為作者？',
            confirmText: '前往成為作者',
            cancelText: '稍後',
            onConfirm: () => { closeModal(); navigate('/user-info'); },
            hideCancel: false
          });
          return;
        }
        navigate('/ebooks/upload');
        break;

      default:
        break;
    }
  };

  const features = [
    {
      icon: 'books',
      title: '黑暗圖書館',
      description: '管理您的禁忌知識珍藏，封印與釋放古老的智慧',
      color: '#8b0000'
    },
    {
      icon: 'ebooks',
      title: '邪惡書庫',
      description: '探索被詛咒的電子書資源，解鎖禁忌的知識',
      color: '#4a0a4a'
    },
    {
      icon: 'upload',
      title: '獻祭儀式',
      description: '將新的邪惡知識獻祭到您的黑暗圖書館',
      color: '#006400'
    },

  ];

  return (
    <div className={classes.home}>


      {/* 下雨動畫背景 */}
      <div className={classes.rainContainer}>
        {[...Array(30)].map((_, i) => (
          <div key={i} className={classes.raindrop} />
        ))}
      </div>

      {/* 閃電效果 */}
      <div className={classes.lightning} />

      {/* 額外閃電效果 */}
      <div className={classes.lightningExtra} />

      {/* 雷聲震動效果 */}
      <div className={classes.thunderEffect} />

      {/* 英雄區域 */}
      <section className={classes.hero}>
        <div className={classes.heroContent}>
          <div className={classes.heroIcon}>
            <Icon name="arcane" size={80} color="#ffd700" />
          </div>
          <h1 className={classes.heroTitle}>
            黑魔禁書館
          </h1>
          <p className={classes.heroSubtitle}>
            探索禁忌的知識世界，駕馭黑暗的力量，統治您的邪惡圖書館
          </p>
          <div className={classes.heroStats}>
            <button 
              className={classes.statButton}
              onClick={() => handleButtonClick('darkPower')}
              title="管理書籍 - 需要登入和書籍管理權限"
            >
              <span className={classes.statNumber}>⚡</span>
              <span className={classes.statLabel}>黑暗力量</span>
            </button>
            <button 
              className={classes.statButton}
              onClick={() => handleButtonClick('evilRule')}
              title="管理用戶 - 需要登入和管理員權限"
            >
              <span className={classes.statNumber}>🖤</span>
              <span className={classes.statLabel}>邪惡統治</span>
            </button>
            <button 
              className={classes.statButton}
              onClick={() => handleButtonClick('deathKnowledge')}
              title="瀏覽電子書庫"
            >
              <span className={classes.statNumber}>💀</span>
              <span className={classes.statLabel}>死亡知識</span>
            </button>
          </div>
        </div>

        {/* 黑魔法粒子效果 */}
        <div className={classes.magicParticles}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={classes.particle}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </section>

      {/* 功能特色 */}
      <section className={classes.features}>
        <h2 className={classes.sectionTitle}>黑暗系統特色</h2>
        <div className={classes.featuresGrid}>
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={classes.featureCard}
              role="button"
              tabIndex={0}
              onClick={() => handleFeatureClick(feature.title)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleFeatureClick(feature.title) }}
            >
              <div className={classes.featureIcon} style={{ color: feature.color }}>
                <Icon name={feature.icon} size={40} />
              </div>
              <h3 className={classes.featureTitle}>{feature.title}</h3>
              <p className={classes.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

  

      {/* 系統狀態 */}
      <section className={classes.systemStatus}>
        <h2 className={classes.sectionTitle}>黑暗狀態</h2>
        <div className={classes.statusGrid}>
          <div className={classes.statusCard}>
            <div className={classes.statusIcon}>
              <Icon name="user" size={24} />
            </div>
            <div className={classes.statusInfo}>
              <span className={classes.statusLabel}>靈魂狀態</span>
              <span className={classes.statusValue}>
                {userPermissions.isAuthenticated ? '已被詛咒' : '尚未獻祭'}
              </span>
            </div>
          </div>

          <div className={classes.statusCard}>
            <div className={classes.statusIcon}>
              <Icon name="books" size={24} />
            </div>
            <div className={classes.statusInfo}>
              <span className={classes.statusLabel}>黑暗權限</span>
              <span className={classes.statusValue}>
                {userPermissions.canManageBooks ? '可統治' : '僅窺視'}
              </span>
            </div>
          </div>

          <div className={classes.statusCard}>
            <div className={classes.statusIcon}>
              <Icon name="settings" size={24} />
            </div>
            <div className={classes.statusInfo}>
              <span className={classes.statusLabel}>邪惡等級</span>
              <span className={classes.statusValue}>
                {userPermissions.isAdmin ? '黑暗領主' : '邪惡僕從'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 回到頂部按鈕 */}
      {showScrollToTop && (
        <div className={classes.scrollToTopContainer}>
          <div
            onClick={scrollToTop}
            className={classes.scrollToTopButton}
            title="回到頂部"
          >
            <Icon name="arrow-up" size={24} />
          </div>
        </div>
      )}

      <Modal 
        open={modal.open}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
        hideCancel={modal.hideCancel}
      />

    </div>
  );
};

export default Home; 