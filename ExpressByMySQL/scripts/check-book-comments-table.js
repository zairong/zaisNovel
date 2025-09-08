'use strict';

require('dotenv').config();
const { sequelize } = require('../models');

async function checkAndCreateBookCommentsTable() {
  try {
    console.log('🔍 檢查 book_comments 表是否存在...');
    
    // 檢查表是否存在
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'book_comments'
    `);
    
    if (results[0].count === 0) {
      console.log('📝 book_comments 表不存在，正在創建...');
      
      // 創建 book_comments 表
      await sequelize.query(`
        CREATE TABLE book_comments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          book_id INT NOT NULL,
          content TEXT NOT NULL,
          rating INT,
          status ENUM('active', 'hidden', 'deleted') DEFAULT 'active' NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_book_id (book_id),
          INDEX idx_user_id (user_id),
          INDEX idx_status (status),
          INDEX idx_created_at (created_at),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('✅ book_comments 表創建成功！');
    } else {
      console.log('✅ book_comments 表已存在');
    }
    
  } catch (error) {
    console.error('❌ 檢查/創建表失敗:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkAndCreateBookCommentsTable();
