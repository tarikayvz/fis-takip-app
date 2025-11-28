// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = "cok_gizli_super_sifre_123"; // authController'daki ile aynı olmalı!

module.exports = (req, res, next) => {
    // 1. Token'ı al (Header'dan)
    const token = req.header('Authorization');

    // 2. Token yoksa reddet
    if (!token) {
        return res.status(401).json({ error: "Erişim reddedildi. Token yok." });
    }

    try {
        // 3. Token'ı doğrula (Bearer ... kısmını temizle)
        const cleanToken = token.replace('Bearer ', '');
        const decoded = jwt.verify(cleanToken, JWT_SECRET);

        // 4. Kullanıcı bilgisini isteğe ekle (req.user)
        req.user = decoded; 
        next(); // Devam et
    } catch (error) {
        res.status(400).json({ error: "Geçersiz Token." });
    }
};