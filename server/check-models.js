// server/check-models.js
// Kütüphane kullanmadan, direkt fetch ile soruyoruz.
const API_KEY = "AIzaSyCNOCNWq2zw_WBy3uWjMEGqSXSvHx1d2pU"; 

async function modelleriListele() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("❌ HATA VAR:", data.error.message);
        } else {
            console.log("✅ ERİŞİLEBİLEN MODELLER:");
            if (data.models) {
                data.models.forEach(m => {
                    // Sadece 'generateContent' destekleyenleri gösterelim
                    if (m.supportedGenerationMethods.includes("generateContent")) {
                        console.log(`- ${m.name.replace("models/", "")}`);
                    }
                });
            } else {
                console.log("⚠️ Liste boş! Hiçbir modele erişim yok.");
            }
        }
    } catch (error) {
        console.error("Bağlantı Hatası:", error);
    }
}

modelleriListele();