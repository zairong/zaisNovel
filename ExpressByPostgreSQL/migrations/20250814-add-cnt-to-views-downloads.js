const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const v = await queryInterface.describeTable('book_views')
      if (!v.cnt) {
        await queryInterface.addColumn('book_views', 'cnt', {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          comment: '事件數量，供統計用（預設為1）'
        })
      }
    } catch (_) {}

    try {
      const d = await queryInterface.describeTable('book_downloads')
      if (!d.cnt) {
        await queryInterface.addColumn('book_downloads', 'cnt', {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          comment: '事件數量，供統計用（預設為1）'
        })
      }
    } catch (_) {}
  },

  down: async (queryInterface, Sequelize) => {
    try { await queryInterface.removeColumn('book_views', 'cnt') } catch (_) {}
    try { await queryInterface.removeColumn('book_downloads', 'cnt') } catch (_) {}
  }
}


