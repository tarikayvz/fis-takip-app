// server/models/Goal.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Goal = sequelize.define('Goal', {
    title: {
        type: DataTypes.STRING,
        allowNull: false // Örn: "Tatil", "Araba"
    },
    targetAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false // Hedeflenen Tutar (Örn: 50000)
    },
    savedAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0 // Şu ana kadar biriken
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: "bg-blue-500" // Görsel için renk kodu
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, { timestamps: true });

module.exports = Goal;