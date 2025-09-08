const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '操作類型'
      },
      resource_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '資源類型'
      },
      resource_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '資源ID'
      },
      details: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '詳細資訊'
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IP地址'
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '用戶代理'
      },
      status: {
        type: DataTypes.ENUM('success', 'failure', 'error'),
        defaultValue: 'success',
        allowNull: false,
        comment: '操作狀態'
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

    // 建立索引
    await queryInterface.addIndex('audit_logs', ['user_id']);
    await queryInterface.addIndex('audit_logs', ['action']);
    await queryInterface.addIndex('audit_logs', ['resource_type']);
    await queryInterface.addIndex('audit_logs', ['created_at']);
    await queryInterface.addIndex('audit_logs', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('audit_logs');
  }
};
