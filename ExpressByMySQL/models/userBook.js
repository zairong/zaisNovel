'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserBook extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 用戶書庫與用戶的關聯
      UserBook.belongsTo(models.User, { 
        // 外鍵
        foreignKey: 'user_id', 
        // 關聯名稱
        as: 'user' 
      });
      
      // 用戶書庫與書籍的關聯
      UserBook.belongsTo(models.Book, { 
        // 外鍵
        foreignKey: 'book_id', 
        // 關聯名稱
        as: 'book' 
      });
    }
  }

  UserBook.init({
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
    // 是否最愛
    is_favorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    // 閱讀進度
    reading_progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    // 筆記
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // 評分
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    // 添加時間
    added_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'UserBook',
    tableName: 'user_books',
    timestamps: true,
    // 創建時間
    createdAt: 'created_at',
    // 更新時間
    updatedAt: 'updated_at',
    // 索引
    indexes: [
      // 唯一索引
        {
        unique: true,
        fields: ['user_id', 'book_id']
      }
    ]
  });

  return UserBook;
};
