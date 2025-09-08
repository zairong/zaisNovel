const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_books', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: DataTypes.ENUM('reading', 'completed', 'wishlist', 'dropped'),
        defaultValue: 'wishlist',
        allowNull: false,
        comment: '閱讀狀態'
      },
      progress: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        allowNull: false,
        comment: '閱讀進度百分比'
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
        },
        comment: '用戶評分 1-5 星'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '個人筆記'
      },
      is_favorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: '是否為收藏'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 建立複合索引和唯一約束
    await queryInterface.addIndex('user_books', ['user_id', 'book_id'], {
      unique: true,
      name: 'user_books_user_book_unique'
    });
    await queryInterface.addIndex('user_books', ['user_id']);
    await queryInterface.addIndex('user_books', ['book_id']);
    await queryInterface.addIndex('user_books', ['status']);
    await queryInterface.addIndex('user_books', ['is_favorite']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_books');
  }
};
