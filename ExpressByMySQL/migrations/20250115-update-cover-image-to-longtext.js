'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 僅在欄位存在時才嘗試變更型別
    const desc = await queryInterface.describeTable('books').catch(() => ({}))
    if (desc.cover_image) {
      await queryInterface.changeColumn('books', 'cover_image', {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: '封面圖片 Base64 數據'
      })
    }
  },

  async down(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('books').catch(() => ({}))
    if (desc.cover_image) {
      await queryInterface.changeColumn('books', 'cover_image', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: '封面圖片路徑'
      })
    }
  }
};
