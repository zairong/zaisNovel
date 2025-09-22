const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 冪等：若表不存在才建立
    const tableExists = await queryInterface
      .describeTable('book_downloads')
      .then(() => true)
      .catch(() => false)

    if (!tableExists) {
      await queryInterface.createTable('book_downloads', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        book_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'books', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        viewer_key: {
          type: DataTypes.STRING(191),
          allowNull: false
        },
        view_date: {
          type: DataTypes.DATEONLY,
          allowNull: false
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
      })
    }

    // 索引／唯一約束冪等處理
    const ensureIndex = async (fields) => {
      try {
        await queryInterface.addIndex('book_downloads', fields)
      } catch (_) {}
    }
    await ensureIndex(['book_id'])
    await ensureIndex(['view_date'])
    try {
      await queryInterface.addConstraint('book_downloads', {
        fields: ['book_id', 'viewer_key', 'view_date'],
        type: 'unique',
        name: 'uq_book_download_unique_daily'
      })
    } catch (_) {}
  },

  down: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface
      .describeTable('book_downloads')
      .then(() => true)
      .catch(() => false)
    if (tableExists) {
      await queryInterface.dropTable('book_downloads')
    }
  }
}


