// server/routes/receiptRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware'); 

// 👇 updateReceipt'i import listesine ekle
const { uploadReceipt, getAllReceipts, deleteReceipt, addManualReceipt, chatWithAI, updateReceipt } = require('../controllers/receiptController'); 

router.post('/upload', authMiddleware, upload.single('image'), uploadReceipt);
router.post('/manual', authMiddleware, addManualReceipt);
router.post('/chat', authMiddleware, chatWithAI);
router.get('/', authMiddleware, getAllReceipts);
router.delete('/:id', authMiddleware, deleteReceipt);

// 👇 YENİ GÜNCELLEME ROTASI
router.put('/:id', authMiddleware, updateReceipt);

module.exports = router;