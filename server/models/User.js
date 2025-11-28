// server/models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Her e-posta 1 kez kullanılabilir
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // 👇 AYARLARI BURADA TUTACAĞIZ
    budget: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    income: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'TRY'
    }
}, { timestamps: true });

module.exports = User;