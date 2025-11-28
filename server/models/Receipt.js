// server/models/Receipt.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Receipt = sequelize.define('Receipt', {
    merchantName: { type: DataTypes.STRING, allowNull: true },
    date: { type: DataTypes.DATEONLY, allowNull: true },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    imagePath: { type: DataTypes.STRING, allowNull: true },
    category: { type: DataTypes.STRING, allowNull: true },
    items: { type: DataTypes.JSONB, allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    isRecurring: { type: DataTypes.BOOLEAN, defaultValue: false },
    goalId: { type: DataTypes.INTEGER, allowNull: true },
    // 👇 YENİ: İptal Durumu (Varsayılan: Hayır)
    isCancelled: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    }
}, { timestamps: true });

module.exports = Receipt;