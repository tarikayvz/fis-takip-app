// server/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { dbBaglantisiniTestEt, sequelize } = require('./config/db');

// 👇 MODELLERİ ÇAĞIR (Sıralama Önemli!)
const User = require('./models/User');     // Önce User
const Receipt = require('./models/Receipt'); // Sonra Receipt
const Goal = require('./models/Goal'); // 👈 YENİ

// İlişkiyi Kur (Bir kullanıcının çok fişi olabilir)
User.hasMany(Receipt, { foreignKey: 'userId' });
Receipt.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Goal, { foreignKey: 'userId' }); // 👈 YENİ
Goal.belongsTo(User, { foreignKey: 'userId' }); // 👈 YENİ

const receiptRoutes = require('./routes/receiptRoutes');
// 👇 YENİ ROTA
const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes'); // 👈 YENİ

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotalar
app.use('/api/receipts', receiptRoutes);
app.use('/api/auth', authRoutes); // 👈 Auth rotasını ekle
app.use('/api/goals', goalRoutes); // 👈 YENİ

const sunucuyuBaslat = async () => {
    try {
        await dbBaglantisiniTestEt();
        // ⚠️ DİKKAT: Tabloları güncellemek için 'alter: true' kullandık
        await sequelize.sync({ alter: true }); 
        console.log("✅ Tablolar (User & Receipt) senkronize edildi.");

        app.listen(PORT, () => {
            console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
        });
    } catch (error) {
        console.error("❌ Sunucu hatası:", error);
    }
};

sunucuyuBaslat();