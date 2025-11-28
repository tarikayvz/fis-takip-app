// server/routes/goalRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getGoals, addGoal, updateGoalProgress, deleteGoal } = require('../controllers/goalController');

router.get('/', authMiddleware, getGoals);
router.post('/', authMiddleware, addGoal);
router.put('/:id', authMiddleware, updateGoalProgress);
router.delete('/:id', authMiddleware, deleteGoal);

module.exports = router;