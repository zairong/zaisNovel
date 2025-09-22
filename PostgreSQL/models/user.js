'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 用戶與書籍的關聯（用戶的個人書庫）
      User.hasMany(models.UserBook, { 
        foreignKey: 'user_id', 
        as: 'userBooks' 
      });
      
      // 用戶與審計日誌的關聯
      User.hasMany(models.AuditLog, { 
        foreignKey: 'user_id', 
        as: 'auditLogs' 
      });
      
      // 用戶作為作者的書籍關聯
      User.hasMany(models.Book, { 
        foreignKey: 'author_id', 
        as: 'authoredBooks' 
      });
      
      // 用戶的觀看記錄關聯
      User.hasMany(models.BookView, { 
        foreignKey: 'user_id', 
        as: 'bookViews' 
      });
      
      // 用戶的下載記錄關聯
      User.hasMany(models.BookDownload, { 
        foreignKey: 'user_id', 
        as: 'bookDownloads' 
      });
      
      // 用戶的評論關聯
      User.hasMany(models.BookComment, { 
        foreignKey: 'user_id', 
        as: 'comments' 
      });
    }

    // 密碼驗證方法
    async validatePassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    // 密碼加密方法
    async hashPassword() {
      if (this.changed('password')) {
        this.password = await bcrypt.hash(this.password, 12);
      }
    }

    // 返回用戶資訊（不包含密碼）
    toJSON() {
      const values = Object.assign({}, this.get());
      delete values.password;
      return values;
    }
  }

  User.init({
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255]
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'author', 'user'),
      defaultValue: 'user',
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    profile: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    age_range: {
      type: DataTypes.ENUM('10~20', '20~30', '30~40', '40~50', '50~60', '60以上'),
      allowNull: true,
      comment: '年齡範圍'
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user) => {
        await user.hashPassword();
      },
      beforeUpdate: async (user) => {
        await user.hashPassword();
      }
    }
  });

  return User;
};
