// server/test-ai.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Buraya kendi API anahtarını yapıştır
const genAI = new GoogleGenerativeAI("AIzaSyCNOCNWq2zw_WBy3uWjMEGqSXSvHx1d2pU");

async function listModeller() {
  try {
    console.log("🔍 Modeller aranıyor...");
    // Mevcut modelleri listele (bize sadece 'generateContent' destekleyenler lazım)
    // Not: Listeleme fonksiyonu bazen beta sürümde farklılık gösterebilir, 
    // biz direkt en popüler modelleri deneyen bir döngü kuralım.
    
    const denenecekModeller = [
        "gemini-1.5-flash", 
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-pro-vision"
    ];

    for (const modelName of denenecekModeller) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            // Boş bir test isteği atalım
            const result = await model.generateContent("Test");
            console.log(`✅ ÇALIŞAN MODEL BULUNDU: ${modelName}`);
            return; // İlk çalışanı bulunca çıkalım
        } catch (error) {
            console.log(`❌ ${modelName} çalışmadı (404 veya yetki yok).`);
        }
    }
    
    console.log("😔 Hiçbir standart model ismi çalışmadı. API Key veya Bölge sorunu olabilir.");

  } catch (error) {
    console.error("Genel Hata:", error.message);
  }
}

listModeller();