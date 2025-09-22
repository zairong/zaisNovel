const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // book_views.user_id
    try {
      const desc = await queryInterface.describeTable('book_views')
      if (!desc.user_id) {
        await queryInterface.addColumn('book_views', 'user_id', {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onUpdate: 'SET NULL',
          onDelete: 'SET NULL'
        })
        await queryInterface.addIndex('book_views', ['user_id'])
      }
    } catch (_) {}

    // book_downloads.user_id
    try {
      const desc2 = await queryInterface.describeTable('book_downloads')
      if (!desc2.user_id) {
        await queryInterface.addColumn('book_downloads', 'user_id', {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onUpdate: 'SET NULL',
          onDelete: 'SET NULL'
        })
        await queryInterface.addIndex('book_downloads', ['user_id'])
      }
    } catch (_) {}
  },

  down: async (queryInterface, Sequelize) => {
    try { await queryInterface.removeIndex('book_views', ['user_id']) } catch (_) {}
    try { await queryInterface.removeColumn('book_views', 'user_id') } catch (_) {}
    try { await queryInterface.removeIndex('book_downloads', ['user_id']) } catch (_) {}
    try { await queryInterface.removeColumn('book_downloads', 'user_id') } catch (_) {}
  }
}


