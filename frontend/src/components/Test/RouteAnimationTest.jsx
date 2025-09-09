import React from 'react'
import { Link } from 'react-router-dom'
import classes from './RouteAnimationTest.module.scss'

const RouteAnimationTest = () => {
  return (
    <div className={classes.container}>
      <h1>路由動畫測試</h1>
      <p>點擊以下連結來測試不同的路由動畫效果：</p>
      
      <div className={classes.testLinks}>
        <div className={classes.linkGroup}>
          <h3>第一層路由</h3>
          <Link to="/" className={classes.link}>首頁</Link>
          <Link to="/auth" className={classes.link}>登入/註冊</Link>
          <Link to="/about" className={classes.link}>關於</Link>
        </div>
        
        <div className={classes.linkGroup}>
          <h3>第二層路由</h3>
          <Link to="/books" className={classes.link}>書籍管理</Link>
          <Link to="/ebooks" className={classes.link}>電子書庫</Link>
          <Link to="/my-library" className={classes.link}>我的書庫</Link>
          <Link to="/user-info" className={classes.link}>個人資訊</Link>
        </div>
        
        <div className={classes.linkGroup}>
          <h3>第三層路由</h3>
          <Link to="/admin/users" className={classes.link}>用戶管理</Link>
          <Link to="/ebooks/upload" className={classes.link}>上傳電子書</Link>
        </div>
      </div>
      
      <div className={classes.instructions}>
        <h3>動畫說明：</h3>
        <ul>
          <li>進入更深層頁面：從右側滑入</li>
          <li>返回上層頁面：從左側滑入</li>
          <li>同層級切換：根據路徑長度判斷方向</li>
        </ul>
      </div>
    </div>
  )
}

export default RouteAnimationTest
