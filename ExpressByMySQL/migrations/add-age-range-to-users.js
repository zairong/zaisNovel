'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'age_range', {
      type: Sequelize.ENUM('10~20', '20~30', '30~40', '40~50', '50~60', '60以上'),
      allowNull: true,
      comment: '年齡範圍'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'age_range');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_age_range";');
  }
};
