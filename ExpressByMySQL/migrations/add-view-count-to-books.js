const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('books', 'view_count', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '電子書被點擊閱讀的次數'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('books', 'view_count');
  }
};


