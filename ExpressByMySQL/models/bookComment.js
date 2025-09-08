'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BookComment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 評論與用戶的關聯
      BookComment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // 評論與書籍的關聯
      BookComment.belongsTo(models.Book, {
        foreignKey: 'book_id',
        as: 'book'
      });
    }
  }

  BookComment.init({
    // 用戶ID
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // 書籍ID
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      }
    },
    // 評論內容
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 1000] // 評論長度限制1-1000字
      }
    },
    // 評分（可選）
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    // 評論狀態
    status: {
      type: DataTypes.ENUM('active', 'hidden', 'deleted'),
      defaultValue: 'active',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'BookComment',
    tableName: 'book_comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      // 書籍ID索引
      {
        fields: ['book_id']
      },
      // 用戶ID索引
      {
        fields: ['user_id']
      },
      // 狀態索引
      {
        fields: ['status']
      },
      // 創建時間索引
      {
        fields: ['created_at']
      }
    ]
  });

  return BookComment;
};
