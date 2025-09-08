const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('books', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      author_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      author_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        allowNull: true
      },
      isbn: {
        type: DataTypes.STRING,
        allowNull: true
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true
      },
      ebook_file: {
        type: DataTypes.STRING,
        allowNull: true
      },
      ebook_filename: {
        type: DataTypes.STRING,
        allowNull: true
      },
      ebook_size: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      has_ebook: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      cover_image: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      cover_filename: {
        type: DataTypes.STRING,
        allowNull: true
      },
      has_cover: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      download_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('books');
  }
};
