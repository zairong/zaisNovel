const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('book_views', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      viewer_key: {
        type: DataTypes.STRING(191),
        allowNull: false
      },
      view_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })

    await queryInterface.addIndex('book_views', ['book_id'])
    await queryInterface.addIndex('book_views', ['view_date'])
    await queryInterface.addConstraint('book_views', {
      fields: ['book_id', 'viewer_key', 'view_date'],
      type: 'unique',
      name: 'uq_book_view_unique_daily'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('book_views')
  }
}


