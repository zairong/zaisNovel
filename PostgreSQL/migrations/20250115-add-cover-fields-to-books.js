'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 讓遷移具備可重入性：若欄位已存在則略過
    const desc = await queryInterface.describeTable('books').catch(() => ({}))

    if (!desc.cover_image) {
      await queryInterface.addColumn('books', 'cover_image', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: '封面圖片路徑'
      })
    }

    if (!desc.cover_filename) {
      await queryInterface.addColumn('books', 'cover_filename', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: '封面圖片檔案名稱'
      })
    }

    if (!desc.has_cover) {
      await queryInterface.addColumn('books', 'has_cover', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否有封面圖片'
      })
    }
  },

  async down(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('books').catch(() => ({}))
    if (desc.cover_image) {
      await queryInterface.removeColumn('books', 'cover_image')
    }
    if (desc.cover_filename) {
      await queryInterface.removeColumn('books', 'cover_filename')
    }
    if (desc.has_cover) {
      await queryInterface.removeColumn('books', 'has_cover')
    }
  }
};
