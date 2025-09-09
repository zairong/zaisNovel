const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 冪等：若表已存在則略過 createTable
    const tableExists = await queryInterface
      .describeTable('book_comments')
      .then(() => true)
      .catch(() => false)

    if (!tableExists) {
      await queryInterface.createTable('book_comments', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER
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
        content: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        rating: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        status: {
          type: DataTypes.ENUM('active', 'hidden', 'deleted'),
          defaultValue: 'active',
          allowNull: false
        },
        created_at: {
          allowNull: false,
          type: DataTypes.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          allowNull: false,
          type: DataTypes.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      })
    }

    // 添加索引（冪等：存在就略過）
    const ensureIndex = async (fields) => {
      try {
        await queryInterface.addIndex('book_comments', fields)
      } catch (e) {
        // 若索引已存在（如 relation already exists），安全忽略
      }
    }
    await ensureIndex(['book_id'])
    await ensureIndex(['user_id'])
    await ensureIndex(['status'])
    await ensureIndex(['created_at'])
  },

  down: async (queryInterface, Sequelize) => {
    // 冪等：存在才刪除
    const tableExists = await queryInterface
      .describeTable('book_comments')
      .then(() => true)
      .catch(() => false)
    if (tableExists) {
      await queryInterface.dropTable('book_comments')
    }
  }
};
