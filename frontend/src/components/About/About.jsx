import React from 'react'
import classes from './About.module.scss'

function About() {
  return (
    <div className={classes.aboutPage}>
      <h2>🔮 黑魔禁書館 🔮</h2>
      <div className={classes.aboutContent}>
        <p>這是一個使用 React 和 Express.js 建立的前後分離書籍管理系統。</p>
        
        <h3>🌟 技術特色</h3>
        <ul>
          <li>前端：React + Vite</li>
          <li>後端：Express.js + MySQL</li>
          <li>API：RESTful API 設計</li>
          <li>資料庫：Sequelize ORM</li>
        </ul>
        
        <h3>🛡️ 功能特色</h3>
        <ul>
          <li>完整的 CRUD 操作</li>
          <li>搜尋和篩選功能</li>
          <li>響應式設計</li>
          <li>錯誤處理</li>
        </ul>
      </div>
    </div>
  )
}

export default About 