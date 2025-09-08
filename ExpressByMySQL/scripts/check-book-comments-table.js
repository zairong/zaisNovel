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
      WHERE table_schema = 'public'
      AND table_name = 'book_comments'
    `);
    
    if (results[0].count === 0) {
      console.log('📝 book_comments 表不存在，正在創建...');
      
      // 創建 book_comments 表
      await sequelize.query(`
        CREATE TABLE book_comments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          book_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          rating INTEGER,
          status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'hidden', 'deleted')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // 創建索引
      await sequelize.query(`CREATE INDEX idx_book_id ON book_comments (book_id)`);
      await sequelize.query(`CREATE INDEX idx_user_id ON book_comments (user_id)`);
      await sequelize.query(`CREATE INDEX idx_status ON book_comments (status)`);
      await sequelize.query(`CREATE INDEX idx_created_at ON book_comments (created_at)`);
      
      // 添加外鍵約束
      await sequelize.query(`
        ALTER TABLE book_comments 
        ADD CONSTRAINT fk_book_comments_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      `);
      await sequelize.query(`
        ALTER TABLE book_comments 
        ADD CONSTRAINT fk_book_comments_book_id 
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE ON UPDATE CASCADE
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
