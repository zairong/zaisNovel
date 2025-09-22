'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 冪等：若欄位已存在則略過
    const desc = await queryInterface.describeTable('users').catch(() => ({}))
    if (!desc.age_range) {
      await queryInterface.addColumn('users', 'age_range', {
        type: Sequelize.ENUM('10~20', '20~30', '30~40', '40~50', '50~60', '60以上'),
        allowNull: true,
        comment: '年齡範圍'
      })
    }
  },

  async down(queryInterface, Sequelize) {
    // 冪等：欄位存在才移除，並嘗試刪除 ENUM 型別
    const desc = await queryInterface.describeTable('users').catch(() => ({}))
    if (desc.age_range) {
      await queryInterface.removeColumn('users', 'age_range')
    }
    try {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_age_range";')
    } catch (_) {}
  }
};
