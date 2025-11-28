// server/controllers/goalController.js
const Goal = require('../models/Goal');
const Receipt = require('../models/Receipt');

// Hedefleri Getir
exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'ASC']] });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: "Hedefler getirilemedi." });
    }
};

// Yeni Hedef Ekle
exports.addGoal = async (req, res) => {
    try {
        const { title, targetAmount, color } = req.body;
        const newGoal = await Goal.create({
            title,
            targetAmount,
            color: color || "bg-indigo-500",
            userId: req.user.id
        });
        res.status(201).json(newGoal);
    } catch (error) {
        res.status(500).json({ error: "Hedef oluşturulamadı." });
    }
};

// Hedefe Para Ekle (VE BAĞLANTILI FİŞ OLUŞTUR)
exports.updateGoalProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        const goal = await Goal.findOne({ where: { id, userId: req.user.id } });
        if (!goal) return res.status(404).json({ error: "Hedef bulunamadı." });

        // 1. Hedefin birikmiş miktarını güncelle
        const newAmount = parseFloat(goal.savedAmount) + parseFloat(amount);
        await goal.update({ savedAmount: newAmount });

        // 2. Bunu harcama olarak kaydet (ve goalId ile bağla!)
        if (parseFloat(amount) > 0) {
            await Receipt.create({
                merchantName: `Hedef: ${goal.title}`,
                date: new Date().toISOString().slice(0, 10),
                totalAmount: parseFloat(amount),
                category: "Birikim",
                items: [],
                imagePath: "", 
                userId: req.user.id,
                isRecurring: false,
                goalId: goal.id // 👈 KRİTİK NOKTA: Fişi hedefe bağlıyoruz
            });
        }

        res.json(goal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Güncelleme başarısız." });
    }
};

// Hedef Sil (VE BAĞLANTILI FİŞLERİ SİL)
// GÜNCELLENMİŞ SADE HALİ (Bunu kullan):
// GÜNCELLENMİŞ SADE HALİ (Bunu kullan):
exports.deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Fişleri "İptal" moduna al
        await Receipt.update(
            { isCancelled: true }, 
            { where: { goalId: id, userId: userId } }
        );

        // Hedefi sil
        const result = await Goal.destroy({ where: { id: id, userId: userId } });

        if (result === 0) return res.status(404).json({ error: "Hedef bulunamadı." });
        res.json({ message: "Hedef silindi." });
    } catch (error) {
        res.status(500).json({ error: "Hata oluştu." });
    }
};