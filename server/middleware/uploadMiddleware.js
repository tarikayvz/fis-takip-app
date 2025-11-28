// server/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Depolama Ayarları
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Dosyalar nereye kaydedilsin?
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Dosya adı ne olsun? (Çakışmayı önlemek için tarih ekliyoruz)
        // Örn: fis-1712345678.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Dosya Filtresi (Sadece Resimler)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Kabul et
    } else {
        cb(new Error('Sadece resim dosyaları yüklenebilir!'), false); // Reddet
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Maksimum 5MB
});

module.exports = upload;