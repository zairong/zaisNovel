import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classes from './Home.module.scss';
import { Icon } from '../icons';

const Home = ({ userPermissions = {} }) => {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

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
    {
      icon: 'read',
      title: '靈魂閱讀',
      description: '體驗被詛咒的閱讀界面和邪惡的翻頁動畫',
      color: '#8b4513'
    }
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
            <div className={classes.stat}>
              <span className={classes.statNumber}>⚡</span>
              <span className={classes.statLabel}>黑暗力量</span>
            </div>
            <div className={classes.stat}>
              <span className={classes.statNumber}>🖤</span>
              <span className={classes.statLabel}>邪惡統治</span>
            </div>
            <div className={classes.stat}>
              <span className={classes.statNumber}>💀</span>
              <span className={classes.statLabel}>死亡知識</span>
            </div>
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
            <div key={index} className={classes.featureCard}>
              <div className={classes.featureIcon} style={{ color: feature.color }}>
                <Icon name={feature.icon} size={40} />
              </div>
              <h3 className={classes.featureTitle}>{feature.title}</h3>
              <p className={classes.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 快速操作 */}
      <section className={classes.quickActions}>
        <h2 className={classes.sectionTitle}>邪惡操作</h2>
        <div className={classes.actionsGrid}>
          <button className={classes.actionButton}>
            <Icon name="books" size={24} />
            <span>統治書籍</span>
          </button>
          <button className={classes.actionButton}>
            <Icon name="ebooks" size={24} />
            <span>詛咒電子書</span>
          </button>
          <button className={classes.actionButton}>
            <Icon name="upload" size={24} />
            <span>獻祭文件</span>
          </button>
          <button className={classes.actionButton}>
            <Icon name="settings" size={24} />
            <span>邪惡設置</span>
          </button>
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

    </div>
  );
};

export default Home; 