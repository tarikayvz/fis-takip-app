// server/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// GİZLİ ANAHTAR (Bunu normalde .env'de saklarız ama şimdilik buraya yazalım)
const JWT_SECRET = "cok_gizli_super_sifre_123"; 

// 📝 KAYIT OL
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body; 

        // E-posta var mı kontrol et
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ error: "Bu e-posta zaten kayıtlı." });

        // Şifreyi kriptola
        const hashedPassword = await bcrypt.hash(password, 10);

        // Kullanıcıyı oluştur
        const user = await User.create({ name, email, password: hashedPassword });

        res.status(201).json({ message: "Kayıt başarılı! Şimdi giriş yapabilirsiniz." });
    } catch (error) {
        res.status(500).json({ error: "Kayıt oluşturulamadı." });
    }
};

// 🔑 GİRİŞ YAP
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kullanıcıyı bul
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı." });

        // Şifreyi kontrol et
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Hatalı şifre." });

        // Token oluştur (Kimlik Kartı)
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: "Giriş başarılı.",
            token,
            user: { id: user.id, name: user.name, email: user.email, budget: user.budget, currency: user.currency }
        });
    } catch (error) {
        res.status(500).json({ error: "Giriş yapılamadı." });
    }
};

// ⚙️ AYARLARI GÜNCELLE (Profesyonel Yöntem)
// server/controllers/authController.js

// ... (Diğer fonksiyonlar aynı kalsın)

// ⚙️ AYARLARI GÜNCELLE
exports.updateSettings = async (req, res) => {
    try {
        const { userId, name, budget, income, currency } = req.body;
        
        console.log("Gelen Güncelleme İsteği:", req.body); // Hata ayıklama için log

        // Veritabanını güncelle
        // DİKKAT: income ve budget değerlerini float'a çevirerek kaydediyoruz garanti olsun diye
        await User.update({ 
            name, 
            budget: parseFloat(budget), 
            income: parseFloat(income), 
            currency 
        }, { where: { id: userId } });
        
        // Güncel veriyi geri dön (Bu kısım çok önemli, Frontend bunu bekliyor)
        const updatedUser = await User.findByPk(userId);
        
        res.json({ message: "Ayarlar güncellendi.", user: updatedUser });
    } catch (error) {
        console.error("Ayarlar Güncelleme Hatası:", error);
        res.status(500).json({ error: "Güncelleme başarısız." });
    }
};