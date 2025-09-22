const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const booksDesc = await queryInterface.describeTable('books')
      if (!booksDesc.download_count) {
        await queryInterface.addColumn('books', 'download_count', {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: '電子書被下載的次數'
        })
      }
    } catch (e) {
      // 若表不存在或其他問題，讓遷移直接嘗試新增
      await queryInterface.addColumn('books', 'download_count', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '電子書被下載的次數'
      })
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const booksDesc = await queryInterface.describeTable('books')
      if (booksDesc.download_count) {
        await queryInterface.removeColumn('books', 'download_count')
      }
    } catch (_) {
      // 忽略
    }
  }
}


