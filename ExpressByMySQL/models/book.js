'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 書籍與作者的關聯
      Book.belongsTo(models.User, { 
        foreignKey: 'author_id', 
        as: 'author' 
      });
      
      // 書籍與評論的關聯
      Book.hasMany(models.BookComment, {
        foreignKey: 'book_id',
        as: 'comments'
      });
    }
  }
  Book.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    author_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // 新增電子書相關欄位
    ebook_file: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '電子書檔案路徑'
    },
    ebook_filename: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '電子書檔案名稱'
    },
    ebook_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '電子書檔案大小（bytes）'
    },
    has_ebook: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否有電子書'
    },
    // 方案B：資料庫儲存電子書
    ebook_content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '電子書內容（Markdown）'
    },
    ebook_mime: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'text/markdown',
      comment: '電子書內容 MIME 類型'
    },
    // 封面相關欄位
    cover_image: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: '封面圖片 Base64 數據'
    },
    cover_filename: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '封面圖片檔案名稱'
    },
    has_cover: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否有封面圖片'
    }
    ,
    // 觀看次數
    view_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: '電子書被點擊閱讀的次數'
    }
    ,
    // 下載次數
    download_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: '電子書被下載的次數'
    }
  }, {
    sequelize,
    modelName: 'Book',
    tableName: 'books',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Book;
}; 