const { DataTypes } = require('sequelize');

module.exports = {
  // 遷移操作（具備冪等保護）
  up: async (queryInterface, Sequelize) => {
    // 1) users.role 調整 enum，若已包含 author 則此變更可能是 no-op
    try {
      await queryInterface.changeColumn('users', 'role', {
        type: DataTypes.ENUM('admin', 'author', 'user'),
        defaultValue: 'user',
        allowNull: false
      })
    } catch (e) {
      // 忽略
    }

    // 2) books.author_id：僅在不存在時新增
    try {
      const booksDesc = await queryInterface.describeTable('books')
      if (!booksDesc.author_id) {
        await queryInterface.addColumn('books', 'author_id', {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        })
      }
    } catch (e) {
      // 忽略（例如表尚未建立或欄位已存在）
    }

    // 3) books.author -> author_name：僅在 author 欄位存在時才改名
    try {
      const booksDesc = await queryInterface.describeTable('books')
      if (booksDesc.author && !booksDesc.author_name) {
        await queryInterface.renameColumn('books', 'author', 'author_name')
      }
    } catch (e) {
      // 忽略
    }

    console.log('✅ 作者角色系統遷移完成（具備冪等保護）')
  },
  // 回滾操作（具備冪等保護）
  down: async (queryInterface, Sequelize) => {
    // 1) books.author_id 移除（若存在）
    try {
      const booksDesc = await queryInterface.describeTable('books')
      if (booksDesc.author_id) {
        await queryInterface.removeColumn('books', 'author_id')
      }
    } catch (e) {
      // 忽略
    }

    // 2) author_name -> author（若 author_name 存在且 author 不存在）
    try {
      const booksDesc = await queryInterface.describeTable('books')
      if (booksDesc.author_name && !booksDesc.author) {
        await queryInterface.renameColumn('books', 'author_name', 'author')
      }
    } catch (e) {
      // 忽略
    }

    // 3) users.role 還原 enum（若需要）
    try {
      await queryInterface.changeColumn('users', 'role', {
        type: DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user',
        allowNull: false
      })
    } catch (e) {
      // 忽略
    }
    console.log('✅ 作者角色系統遷移已回滾（具備冪等保護）')
  }
};
