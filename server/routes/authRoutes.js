// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, updateSettings } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.put('/settings', updateSettings);

module.exports = router;