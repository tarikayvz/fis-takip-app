// server/config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Render/Neon için gerekli
        }
    }
});

const dbBaglantisiniTestEt = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Bulut Veritabanı bağlantısı başarılı!');
    } catch (error) {
        console.error('❌ Veritabanına bağlanılamadı:', error);
    }
};

module.exports = { sequelize, dbBaglantisiniTestEt };