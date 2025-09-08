'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 將 cover_image 欄位改為 LONGTEXT 以儲存 Base64 數據
    await queryInterface.changeColumn('books', 'cover_image', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: '封面圖片 Base64 數據'
    });
  },

  async down(queryInterface, Sequelize) {
    // 回滾為 STRING 類型
    await queryInterface.changeColumn('books', 'cover_image', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '封面圖片路徑'
    });
  }
};
