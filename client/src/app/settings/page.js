// client/src/app/settings/page.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { 
    Save, User, ArrowLeft, LogOut, Loader2, Wallet, 
    Moon, Sun, Shield, Monitor, Layout, CreditCard, Trash2, Coins 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// 👇 BU SATIR ÇOK ÖNEMLİ! (Adresi otomatik seçer)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Settings() {
    const { user, updateUser, logout, loading: authLoading } = useAuth(); 
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('profile');
    const [name, setName] = useState('');
    const [budget, setBudget] = useState(0);
    const [income, setIncome] = useState(0);
    const [currency, setCurrency] = useState('TRY');
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
        if (user) {
            setName(user.name || '');
            setBudget(user.budget || 0);
            setIncome(user.income || 0);
            setCurrency(user.currency || 'TRY');
        }
        const currentTheme = localStorage.getItem('theme') || 'light';
        setTheme(currentTheme);
    }, [user, authLoading, router]);

    const handleThemeChange = (mode) => {
        setTheme(mode);
        localStorage.setItem('theme', mode);
        if (mode === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        try {
            // 👇 ADRESİ DİNAMİK YAPTIK
            const res = await fetch(`${API_URL}/api/auth/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, name, budget, income, currency }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Değişiklikler Kaydedildi! ✅');
                updateUser({ name, budget, income, currency });
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Hata: ' + data.error);
            }
        } catch (error) { setMessage('Sunucu hatası.'); } 
        finally { setLoading(false); }
    };

    const handleResetApp = () => {
        if(confirm("Uygulamadaki yerel ayarlarınız sıfırlanacak. Devam edilsin mi?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><Loader2 className="w-10 h-10 animate-spin text-indigo-600"/></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Ayarlar</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Hesap ve uygulama tercihleri.</p>
                    </div>
                </div>

                {message && <div className={`mb-6 p-4 rounded-xl border font-medium ${message.includes('Hata') ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{message}</div>}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 space-y-2">
                        <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><User className="w-5 h-5" /> Profil</button>
                        <button onClick={() => setActiveTab('finance')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${activeTab === 'finance' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Wallet className="w-5 h-5" /> Finansal Hedefler</button>
                        <button onClick={() => setActiveTab('appearance')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${activeTab === 'appearance' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Layout className="w-5 h-5" /> Görünüm</button>
                        <button onClick={() => setActiveTab('account')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${activeTab === 'account' ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Shield className="w-5 h-5" /> Hesap</button>
                    </div>

                    <div className="md:col-span-3">
                        {activeTab === 'profile' && (
                            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><User className="w-5 h-5 text-indigo-500" /> Kişisel Bilgiler</h2>
                                <div className="space-y-6">
                                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Adınız Soyadınız</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"/></div>
                                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Para Birimi</label><select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition"><option value="TRY">₺ - Türk Lirası</option><option value="USD">$ - Amerikan Doları</option><option value="EUR">€ - Euro</option></select></div>
                                    <div className="pt-4 flex justify-end"><button onClick={handleSave} disabled={loading} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200/50 transition transform hover:scale-105 disabled:opacity-50">{loading ? <Loader2 className="animate-spin w-5 h-5"/> : <><Save className="w-5 h-5" /> Profili Kaydet</>}</button></div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'finance' && (
                            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Coins className="w-5 h-5 text-emerald-500" /> Bütçe ve Gelir</h2>
                                <div className="space-y-6">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Bu bilgiler ana sayfadaki analiz kartlarında kullanılır.</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 text-emerald-600 dark:text-emerald-400">Aylık Net Gelir (Maaş)</label><div className="relative"><input type="number" value={income} onChange={(e) => setIncome(e.target.value)} className="w-full p-3 border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-emerald-700 dark:text-emerald-400"/><span className="absolute right-4 top-3 text-emerald-400 font-bold">₺</span></div></div>
                                            <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 text-indigo-600 dark:text-indigo-400">Bütçe Hedefi</label><div className="relative"><input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full p-3 border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold text-indigo-700 dark:text-indigo-400"/><span className="absolute right-4 top-3 text-indigo-400 font-bold">₺</span></div></div>
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end"><button onClick={handleSave} disabled={loading} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200/50 transition transform hover:scale-105 disabled:opacity-50">{loading ? <Loader2 className="animate-spin w-5 h-5"/> : <><Save className="w-5 h-5" /> Finansı Güncelle</>}</button></div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'appearance' && (
                            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Monitor className="w-5 h-5 text-purple-500" /> Tema Seçimi</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div onClick={() => handleThemeChange('light')} className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-200' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}><div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200"><Sun className={`w-10 h-10 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400'}`} /></div><span className={`font-bold ${theme === 'light' ? 'text-indigo-700' : 'text-slate-600 dark:text-slate-400'}`}>Aydınlık Mod</span></div>
                                    <div onClick={() => handleThemeChange('dark')} className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'border-indigo-500 bg-slate-800 ring-2 ring-indigo-500/50' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}><div className="w-full h-24 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700"><Moon className={`w-10 h-10 ${theme === 'dark' ? 'text-indigo-400' : 'text-slate-600'}`} /></div><span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>Karanlık Mod</span></div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'account' && (
                            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                                <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><CreditCard className="w-5 h-5 text-rose-500" /> Hesap Yönetimi</h2>
                                    <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800"><div><p className="font-bold text-slate-800 dark:text-white">Oturumu Kapat</p><p className="text-sm text-slate-500 dark:text-slate-400">Bu cihazdan güvenli çıkış yap.</p></div><button onClick={logout} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition flex items-center gap-2"><LogOut className="w-4 h-4"/> Çıkış Yap</button></div>
                                    <div className="flex items-center justify-between py-4 mt-2"><div><p className="font-bold text-rose-600">Yerel Verileri Temizle</p><p className="text-sm text-slate-500 dark:text-slate-400">Uygulama takılırsa önbelleği temizler.</p></div><button onClick={handleResetApp} className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg font-medium transition flex items-center gap-2"><Trash2 className="w-4 h-4"/> Sıfırla</button></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}