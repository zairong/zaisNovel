'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('books', 'cover_image', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '封面圖片路徑'
    });

    await queryInterface.addColumn('books', 'cover_filename', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '封面圖片檔案名稱'
    });

    await queryInterface.addColumn('books', 'has_cover', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否有封面圖片'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('books', 'cover_image');
    await queryInterface.removeColumn('books', 'cover_filename');
    await queryInterface.removeColumn('books', 'has_cover');
  }
};
