'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 審計日誌與用戶的關聯
      AuditLog.belongsTo(models.User, { 
        foreignKey: 'user_id', 
        as: 'user' 
      });
    }
  }
  // 審計日誌模型
  AuditLog.init({
    // 用戶ID
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // 操作類型
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    // 資源類型
    resource_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    // 資源ID
    resource_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // 詳細資訊
    details: {
      type: DataTypes.JSON,
      allowNull: true
    },  
    // IP地址
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    // 用戶代理
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // 狀態
    status: {
      type: DataTypes.ENUM('success', 'failure', 'error'),
      defaultValue: 'success',
      allowNull: false
    }
  }, {
    // 資料庫連接
    sequelize,
    // 模型名稱
    modelName: 'AuditLog',
    // 資料表名稱
    tableName: 'audit_logs',
    // 時間戳記
    timestamps: true,
    // 創建時間
    createdAt: 'created_at',
    // 更新時間
    updatedAt: 'updated_at',
    // 索引
    indexes: [
      // 用戶ID索引
      {
        fields: ['user_id']
      },
      // 操作類型索引
      {
        fields: ['action']
      },
      // 資源類型索引
      {
        fields: ['resource_type']
      },
      // 創建時間索引
      {
        fields: ['created_at']
      }
    ]
  });
  // 導出模型
  return AuditLog;
};
