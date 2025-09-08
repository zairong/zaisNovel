'use strict';
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class BookDownload extends Model {
    static associate(models) {
      BookDownload.belongsTo(models.Book, {
        foreignKey: 'book_id',
        as: 'book'
      })
      
      // 添加與 User 的關聯
      BookDownload.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      })
    }
  }

  BookDownload.init({
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    viewer_key: {
      type: DataTypes.STRING(191),
      allowNull: false,
      comment: '去重辨識鍵：登入用戶使用 usr:{userId}，未登入使用 ipua:{hash}'
    },
    view_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '以日期為粒度做唯一去重'
    },
    cnt: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'BookDownload',
    tableName: 'book_downloads',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['book_id'] },
      { fields: ['view_date'] },
      { unique: true, fields: ['book_id', 'viewer_key', 'view_date'] }
    ]
  })

  return BookDownload
}


