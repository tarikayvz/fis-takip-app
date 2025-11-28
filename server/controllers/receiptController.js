// server/controllers/receiptController.js
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Receipt = require('../models/Receipt');
const User = require('../models/User');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyCNOCNWq2zw_WBy3uWjMEGqSXSvHx1d2pU");

function fileToGenerativePart(path, mimeType) {
    return { inlineData: { data: Buffer.from(fs.readFileSync(path)).toString("base64"), mimeType } };
}

function temizleFiyat(fiyat) {
    if (!fiyat) return 0;
    if (typeof fiyat === 'number') return fiyat;
    let temiz = fiyat.toString().replace('TL', '').replace('₺', '').trim();
    if (temiz.includes('.') && temiz.includes(',')) temiz = temiz.replace(/\./g, '').replace(',', '.');
    else if (temiz.includes(',')) temiz = temiz.replace(',', '.');
    return parseFloat(temiz) || 0;
}

exports.uploadReceipt = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Lütfen bir resim yükleyin." });

        console.log("🤖 Gemini Analizi (v2.5) Başlıyor:", req.file.path);
        
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: { temperature: 0 } 
        });

        const imagePart = fileToGenerativePart(req.file.path, req.file.mimetype);

        // 👇 GÜNCELLENMİŞ PROMPT (ABONELİK TESPİTİ EKLENDİ)
        const prompt = `
            Sen uzman bir veri giriş robotusun. Görevin:
            1. Fiyatları ve Toplam Tutarı kesinlikle doğru oku.
            2. Mağaza adını sadeleştir (Örn: "Netflix Services" -> "Netflix").
            3. Ürünleri kategorize et.
            
            4. KRİTİK GÖREV: "isRecurring" (Abonelik) tespiti yap.
               - Eğer harcama şunlardan biriyse "true" yap: Netflix, Spotify, YouTube, Apple, Exxen, BluTV, Amazon Prime, Turkcell, Vodafone, Türk Telekom, Superonline, Enerjisa, İgdaş, İski, Kira, Aidat, Spor Salonu.
               - Değilse "false" yap.

            Format (JSON):
            {
                "merchantName": "Netflix", 
                "date": "YYYY-MM-DD",
                "totalAmount": 150.99,
                "category": "Eğlence",
                "isRecurring": true,
                "items": [{"name": "Aylık Üyelik", "price": 150.99, "category": "Eğlence"}]
            }
        `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        let text = response.text();

        const jsonStartIndex = text.indexOf('{');
        const jsonEndIndex = text.lastIndexOf('}');
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) text = text.substring(jsonStartIndex, jsonEndIndex + 1);
        else throw new Error("AI JSON üretemedi.");

        let parsedData = JSON.parse(text);

        // Fiyat temizleme
        if (parsedData.items) parsedData.items = parsedData.items.map(i => ({...i, price: temizleFiyat(i.price)}));
        let finalTotal = temizleFiyat(parsedData.totalAmount);
        const itemsTotal = parsedData.items ? parsedData.items.reduce((acc, i) => acc + i.price, 0) : 0;
        if (finalTotal === 0 || Math.abs(finalTotal - itemsTotal) > 50) finalTotal = itemsTotal;

        const newReceipt = await Receipt.create({
            merchantName: parsedData.merchantName,
            date: parsedData.date,
            totalAmount: finalTotal,
            category: parsedData.category || "Diğer",
            items: parsedData.items,
            imagePath: req.file.path,
            userId: req.user.id,
            isRecurring: parsedData.isRecurring || false // 👇 KAYDEDİYORUZ
        });

        res.status(200).json({ message: "Analiz Tamamlandı! ✅", data: newReceipt });
    } catch (error) {
        console.error("Hata:", error);
        res.status(500).json({ error: "İşlem başarısız." });
    }
};

exports.addManualReceipt = async (req, res) => {
    try {
        // 👇 isRecurring parametresini de alıyoruz
        const { merchantName, date, totalAmount, category, items, isRecurring } = req.body;

        if (!totalAmount) return res.status(400).json({ error: "Tutar zorunludur." });

        const newReceipt = await Receipt.create({
            merchantName: merchantName || "Manuel Harcama",
            date: date || new Date().toISOString().slice(0, 10),
            totalAmount: parseFloat(totalAmount),
            category: category || "Diğer",
            items: items || [],
            imagePath: "",
            userId: req.user.id,
            isRecurring: isRecurring || false // 👇 KAYDEDİYORUZ
        });

        res.status(201).json({ message: "Eklendi.", data: newReceipt });
    } catch (error) { res.status(500).json({ error: "Kayıt başarısız." }); }
};

exports.getAllReceipts = async (req, res) => {
    try {
        const receipts = await Receipt.findAll({ where: { userId: req.user.id }, order: [['date', 'DESC']] });
        res.json(receipts);
    } catch (error) { res.status(500).json({ error: "Veri hatası." }); }
};

exports.deleteReceipt = async (req, res) => {
    try {
        const result = await Receipt.destroy({ where: { id: req.params.id, userId: req.user.id } });
        if (result === 0) return res.status(404).json({ error: "Bulunamadı." });
        res.json({ message: "Silindi." });
    } catch (error) { res.status(500).json({ error: "Silme hatası." }); }
};

exports.chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;
        const receipts = await Receipt.findAll({ where: { userId }, limit: 30, order: [['date', 'DESC']] });
        
        const summary = receipts.length > 0 
            ? receipts.map(r => `- ${r.date}: ${r.merchantName} (${r.category}) -> ${r.totalAmount} TL`).join('\n')
            : "Veri yok.";
        
        const user = await User.findByPk(userId);
        const userContext = `Maaş: ${user.income} TL, Bütçe: ${user.budget} TL.`;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Sen FişBot adında finans koçusun. KULLANICI: ${userContext}. HARCAMALAR: ${summary}. SORU: "${message}". Cevapla (kısa, samimi, Türkçe).`;
        
        const result = await model.generateContent(prompt);
        res.json({ reply: result.response.text() });
    } catch (error) { res.status(500).json({ error: "Hata oluştu." }); }
};
// 👇 GÜNCELLENMİŞ UPDATE FONKSİYONU
exports.updateReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        // 👇 'items' parametresini de alıyoruz
        const { merchantName, date, totalAmount, category, items } = req.body;

        const receipt = await Receipt.findOne({ where: { id: id, userId: req.user.id } });
        
        if (!receipt) {
            return res.status(404).json({ error: "Fiş bulunamadı." });
        }

        // Veritabanını güncelle
        await receipt.update({
            merchantName,
            date,
            totalAmount: parseFloat(totalAmount), // Frontend'den gelen güncel toplam
            category,
            items // 👇 JSON listesini de güncelliyoruz
        });

        res.json({ message: "Fiş ve ürünler güncellendi.", data: receipt });

    } catch (error) {
        console.error("Güncelleme Hatası:", error);
        res.status(500).json({ error: "Güncelleme başarısız." });
    }
};