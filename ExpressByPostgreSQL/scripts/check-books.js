'use strict';

require('dotenv').config();
const { sequelize } = require('../models');

async function checkBooks() {
  try {
    console.log('🔍 檢查資料庫中的書籍...');
    
    // 查詢所有書籍
    const [books] = await sequelize.query(`
      SELECT id, title, author_name, created_at 
      FROM books 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log(`📚 找到 ${books.length} 本書籍:`);
    books.forEach((book, index) => {
      console.log(`${index + 1}. ID: ${book.id}, 標題: ${book.title}, 作者: ${book.author_name}`);
    });
    
    // 檢查評論
    const [comments] = await sequelize.query(`
      SELECT bc.id, bc.user_id, bc.book_id, bc.content, bc.rating, bc.status,
             u.username, b.title as book_title
      FROM book_comments bc
      LEFT JOIN users u ON bc.user_id = u.id
      LEFT JOIN books b ON bc.book_id = b.id
      ORDER BY bc.created_at DESC
      LIMIT 5
    `);
    
    console.log(`\n💬 最近的 ${comments.length} 條評論:`);
    comments.forEach((comment, index) => {
      console.log(`${index + 1}. 用戶: ${comment.username}, 書籍: ${comment.book_title}, 評分: ${comment.rating || '無'}, 狀態: ${comment.status}`);
    });
    
  } catch (error) {
    console.error('❌ 檢查失敗:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkBooks();
