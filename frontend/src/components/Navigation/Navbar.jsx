import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getNavigationMenu } from '../../router/routerUtils'
import classes from './Navbar.module.scss'
import ThemeSwitcher from '../UI/ThemeSwitcher'
import { Icon } from '../icons'

function Navbar({ user, userPermissions = {}, currentRole = 'guest', onLogout }) {
  const location = useLocation()
  const navigationMenu = getNavigationMenu(userPermissions)
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  // 監聽認證狀態變化
  useEffect(() => {
    console.log('Navbar 認證狀態變化:', { user, userPermissions, currentRole })
  }, [user, userPermissions, currentRole])
  

  const roleOptions = [
    { value: 'guest', label: '訪客', description: '無權限' },
    { value: 'viewer', label: '查看者', description: '只能查看' },
    { value: 'editor', label: '編輯者', description: '可編輯書籍' },
    { value: 'admin', label: '管理員', description: '完整權限' }
  ]

  const handleRoleSwitch = (role) => {
    onRoleSwitch(role)
    setShowRoleMenu(false)
  }

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu)
    setShowRoleMenu(false) // 關閉角色選單
  }

  const closeMobileMenu = () => {
    setShowMobileMenu(false)
    setShowRoleMenu(false)
  }

  return (
    <>
      {/* 手機版選單遮罩 */}
      <div 
        className={`${classes.mobileMenuOverlay} ${showMobileMenu ? classes.active : ''}`}
        onClick={closeMobileMenu}
      ></div>
      
      <nav className={classes.navbar}>
        <div className={classes.navBrand}>
        黑魔禁書館
        </div>
        
        {/* 漢堡選單按鈕 */}
        <button 
          className={classes.mobileMenuToggle}
          onClick={toggleMobileMenu}
          aria-label="切換選單"
        >
          <span className={`${classes.hamburger} ${showMobileMenu ? classes.active : ''}`}></span>
        </button>
      
      {/* 桌面版導航連結 */}
      <div className={`${classes.navLinks} ${classes.desktopNav}`}>
        {navigationMenu.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={location.pathname === item.path ? classes.active : ''}
            title={item.description}
            onClick={closeMobileMenu}
          >
            <span className={classes.navIcon}>
              <Icon name={item.icon} size={20} />
            </span>
            <span className={classes.navText}>{item.title}</span>
          </Link>
        ))}
      </div>
      
      {/* 手機版選單 */}
      <div className={`${classes.mobileMenu} ${showMobileMenu ? classes.active : ''}`}>
        <div className={classes.mobileMenuHeader}>
          <span className={classes.mobileMenuTitle}>🔮 選單</span>
          <button 
            className={classes.mobileMenuClose}
            onClick={closeMobileMenu}
            aria-label="關閉選單"
          >
            ✕
          </button>
        </div>
        
        <div className={classes.mobileNavLinks}>
          {navigationMenu.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`${classes.mobileNavLink} ${location.pathname === item.path ? classes.active : ''}`}
              onClick={closeMobileMenu}
            >
              <span className={classes.navIcon}>
                <Icon name={item.icon} size={20} />
              </span>
              <span className={classes.navText}>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* 桌面版認證區域 */}
      <div className={`${classes.navAuth} ${classes.desktopAuth}`}>
        {/* 主題切換器 */}
        <div className={classes.themeSection}>
          <ThemeSwitcher />
        </div>
        
        {userPermissions.isAuthenticated ? (
          <div className={classes.authContainer}>
            {/* 用戶狀態和角色資訊 */}
              <div className={classes.userSection}>
              <Link to="/user-info" className={classes.userStatus} title="查看個人資訊">
                <span className={classes.statusIcon}>👤</span>
                <span className={classes.statusText}>{user?.username || '已登入'}</span>
              </Link>
            </div>
            
            {/* 操作按鈕區域 */}
            <div className={classes.actionSection}>
              <button onClick={onLogout} className={`${classes.authBtn} ${classes.logout}`}>
                <span className={classes.btnIcon}>🚪</span>
                <span className={classes.btnText}>登出</span>
              </button>
            </div>
          </div>
        ) : (
          <div className={classes.authContainer}>
            <div className={classes.userSection}>
              <div className={classes.userStatus}>
                <span className={classes.statusIcon}>👤</span>
                <span className={classes.statusText}>未登入</span>
              </div>
            </div>
            <div className={classes.actionSection}>
              <Link to="/auth" className={`${classes.authBtn} ${classes.login}`}>
                <span className={classes.btnIcon}>🔑</span>
                <span className={classes.btnText}>登入</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  )
}

export default Navbar 