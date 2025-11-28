'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Receipts tablosuna 'category' sütunu ekliyoruz
    await queryInterface.addColumn('Receipts', 'category', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'Diğer' // Kategori bulamazsa 'Diğer' yazsın
    });
  },

  async down (queryInterface, Sequelize) {
    // Geri alma durumunda sütunu sil
    await queryInterface.removeColumn('Receipts', 'category');
  }
};