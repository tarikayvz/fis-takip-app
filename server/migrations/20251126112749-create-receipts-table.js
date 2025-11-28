'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Tabloyu Oluştur
    await queryInterface.createTable('Receipts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      merchantName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      imagePath: {
        type: Sequelize.STRING,
        allowNull: false
      },
      items: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    // Tabloyu Sil (Geri Alma işlemi için)
    await queryInterface.dropTable('Receipts');
  }
};