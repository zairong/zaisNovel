'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('books', 'ebook_content', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '電子書內容（Markdown）'
      });
    } catch (_) {}
    try {
      await queryInterface.addColumn('books', 'ebook_mime', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'text/markdown',
        comment: '電子書內容 MIME 類型'
      });
    } catch (_) {}
  },

  async down(queryInterface) {
    try { await queryInterface.removeColumn('books', 'ebook_content'); } catch (_) {}
    try { await queryInterface.removeColumn('books', 'ebook_mime'); } catch (_) {}
  }
};
