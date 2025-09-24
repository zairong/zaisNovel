'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // 為 has_ebook 欄位添加索引，優化 WHERE has_ebook = true 查詢
      await queryInterface.addIndex('books', ['has_ebook'], {
        name: 'idx_books_has_ebook',
        comment: '優化 has_ebook 欄位查詢效能'
      });
      console.log('✅ 已添加 has_ebook 索引');
    } catch (error) {
      console.log('⚠️  has_ebook 索引可能已存在:', error.message);
    }

    try {
      // 為 created_at 欄位添加索引，優化 ORDER BY created_at DESC 查詢
      await queryInterface.addIndex('books', ['created_at'], {
        name: 'idx_books_created_at',
        comment: '優化 created_at 排序查詢效能'
      });
      console.log('✅ 已添加 created_at 索引');
    } catch (error) {
      console.log('⚠️  created_at 索引可能已存在:', error.message);
    }

    try {
      // 複合索引：has_ebook + created_at，優化常見的組合查詢
      await queryInterface.addIndex('books', ['has_ebook', 'created_at'], {
        name: 'idx_books_has_ebook_created_at',
        comment: '優化 has_ebook=true 且按 created_at 排序的查詢效能'
      });
      console.log('✅ 已添加 has_ebook + created_at 複合索引');
    } catch (error) {
      console.log('⚠️  has_ebook + created_at 複合索引可能已存在:', error.message);
    }

    try {
      // 為 author_id 添加索引，優化作者相關查詢
      await queryInterface.addIndex('books', ['author_id'], {
        name: 'idx_books_author_id',
        comment: '優化作者相關查詢效能'
      });
      console.log('✅ 已添加 author_id 索引');
    } catch (error) {
      console.log('⚠️  author_id 索引可能已存在:', error.message);
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.removeIndex('books', 'idx_books_has_ebook');
      console.log('✅ 已移除 has_ebook 索引');
    } catch (error) {
      console.log('⚠️  移除 has_ebook 索引時發生錯誤:', error.message);
    }

    try {
      await queryInterface.removeIndex('books', 'idx_books_created_at');
      console.log('✅ 已移除 created_at 索引');
    } catch (error) {
      console.log('⚠️  移除 created_at 索引時發生錯誤:', error.message);
    }

    try {
      await queryInterface.removeIndex('books', 'idx_books_has_ebook_created_at');
      console.log('✅ 已移除 has_ebook + created_at 複合索引');
    } catch (error) {
      console.log('⚠️  移除 has_ebook + created_at 複合索引時發生錯誤:', error.message);
    }

    try {
      await queryInterface.removeIndex('books', 'idx_books_author_id');
      console.log('✅ 已移除 author_id 索引');
    } catch (error) {
      console.log('⚠️  移除 author_id 索引時發生錯誤:', error.message);
    }
  }
};
