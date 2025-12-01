// server/config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Senaryo 1: İnternetteyiz (Render/Neon)
if (process.env.DATABASE_URL) {
    console.log("🌍 Bulut veritabanına (Neon) bağlanılıyor...");
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });
} 
// Senaryo 2: Kendi Bilgisayarındasın (Localhost)
else {
    console.log("💻 Yerel veritabanına (Localhost) bağlanılıyor...");
    sequelize = new Sequelize(
        process.env.DB_NAME,     // fistakipDB
        process.env.DB_USER,     // postgres
        process.env.DB_PASSWORD, // şifren
        {
            host: process.env.DB_HOST || 'localhost',
            dialect: 'postgres',
            logging: false
        }
    );
}

const dbBaglantisiniTestEt = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Veritabanı bağlantısı başarılı!');
    } catch (error) {
        console.error('❌ Veritabanına bağlanılamadı:', error);
    }
};

module.exports = { sequelize, dbBaglantisiniTestEt };