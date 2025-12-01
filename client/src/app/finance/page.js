// client/src/app/finance/page.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { 
    LayoutDashboard, Receipt, Wallet, TrendingDown, PiggyBank, 
    RefreshCw, ArrowUpRight, ArrowDownRight, Save, Loader2,
    Calendar, FileSpreadsheet, FileText, CalendarRange, CalendarDays, CalendarCheck, Settings
} from 'lucide-react';

export default function Finance() {
    const { user, updateUser, loading: authLoading } = useAuth();
    const [receipts, setReceipts] = useState([]);
    const [income, setIncome] = useState(0);
    const [budget, setBudget] = useState(0);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (user) {
            setIncome(parseFloat(user.income || 0));
            setBudget(parseFloat(user.budget || 0));
            fetchReceipts();
        }
    }, [user]);

    const fetchReceipts = async () => {
        try {
            const res = await fetch('/api/receipts', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            const data = await res.json();
            if (Array.isArray(data)) setReceipts(data);
        } catch (error) { console.error(error); }
    };

    // Gelir ve Bütçe Kaydetme
    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: user.id, 
                    income: parseFloat(income), // Sayı olduğundan emin olalım
                    budget: parseFloat(budget), 
                    name: user.name, 
                    currency: user.currency 
                }),
            });

            const data = await res.json(); // Cevabı JSON olarak al

            if (res.ok) {
                // 👇 KRİTİK DÜZELTME: Backend'den dönen güncel 'user' objesiyle context'i güncelle
                // data.user içinde güncel income var.
                if (data.user) {
                    updateUser(data.user); 
                } else {
                    // Eğer backend user dönmezse manuel güncelle
                    updateUser({ ...user, income, budget });
                }
                
                setMsg('Güncellendi! ✅');
                setTimeout(() => setMsg(''), 3000);
            } else {
                console.error("Hata:", data.error);
            }
        } catch (error) { 
            console.error("Bağlantı hatası:", error); 
        } 
        finally { setLoading(false); }
    };

    // Hesaplamalar
    const totalSpent = receipts.reduce((a, c) => a + parseFloat(c.totalAmount || 0), 0);
    const recurringExpenses = receipts.filter(r => r.isRecurring);
    const recurringTotal = recurringExpenses.reduce((a, c) => a + parseFloat(c.totalAmount || 0), 0);
    const netBalance = income - totalSpent;
    const budgetPercent = budget > 0 ? (totalSpent / budget) * 100 : 0;
    
    let progressBarColor = 'bg-emerald-500';
    if (budgetPercent >= 80) progressBarColor = 'bg-amber-500';
    if (budgetPercent >= 100) progressBarColor = 'bg-rose-600';

    if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-indigo-600"/></div>;

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
            {/* SIDEBAR (Aynı Tasarım) */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-slate-100"><h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-600"><Receipt className="w-8 h-8" /> Fiş Takip</h1><p className="text-xs text-slate-400 mt-1 pl-10">Hoş Geldin, {user.name}</p></div>
                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/" className="flex items-center gap-3 w-full p-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"><LayoutDashboard className="w-5 h-5"/> Gösterge Paneli</Link>
                    {/* 👇 AKTİF SAYFA */}
                    <button className="flex items-center gap-3 w-full p-3 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg"><Wallet className="w-5 h-5"/> Finansal Durum</button>
                    <div className="pt-6 pb-2 text-[10px] font-extrabold text-slate-400 px-3 uppercase tracking-wider">Sistem</div>
                    <Link href="/settings" className="flex items-center gap-3 w-full p-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"><Settings className="w-5 h-5"/> Ayarlar</Link>
                </nav>
            </aside>

            <main className="flex-1 md:ml-64 p-8">
                <header className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Finansal Yönetim</h2>
                    <p className="text-slate-500 text-sm">Gelirlerini, bütçeni ve sabit giderlerini buradan yönet.</p>
                </header>

                {/* AYARLAR KARTI (MAAŞ VE BÜTÇE GİRİŞİ) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-slate-400"/> Hızlı Ayarlar</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Aylık Net Gelir</label>
                            <div className="relative"><input type="number" value={income} onChange={(e)=>setIncome(e.target.value)} className="w-full p-3 border rounded-xl font-bold text-emerald-600"/><span className="absolute right-4 top-3 text-slate-400">₺</span></div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Bütçe Hedefi</label>
                            <div className="relative"><input type="number" value={budget} onChange={(e)=>setBudget(e.target.value)} className="w-full p-3 border rounded-xl font-bold text-indigo-600"/><span className="absolute right-4 top-3 text-slate-400">₺</span></div>
                        </div>
                        <button onClick={handleSave} disabled={loading} className="bg-slate-800 hover:bg-slate-900 text-white p-3 rounded-xl font-bold transition flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin w-5 h-5"/> : 'Güncelle'}</button>
                    </div>
                    {msg && <p className="text-emerald-600 text-sm mt-2 font-medium">{msg}</p>}
                </div>

                {/* 4'LÜ KARTLAR */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-emerald-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
                        <p className="text-emerald-100 text-sm font-medium flex items-center gap-2"><ArrowUpRight className="w-4 h-4"/> Gelir</p>
                        <h3 className="text-3xl font-bold mt-1">{parseFloat(income).toLocaleString()} ₺</h3>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <p className="text-slate-500 text-sm font-medium flex items-center gap-2"><TrendingDown className="w-4 h-4 text-rose-500"/> Gider</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalSpent.toLocaleString()} ₺</h3>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <p className="text-slate-500 text-sm font-medium flex items-center gap-2"><RefreshCw className="w-4 h-4 text-blue-500"/> Sabit</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">{recurringTotal.toLocaleString()} ₺</h3>
                    </div>
                    <div className={`rounded-2xl p-6 border shadow-sm ${netBalance >= 0 ? 'bg-white border-slate-200' : 'bg-rose-50 border-rose-200'}`}>
                        <p className="text-slate-500 text-sm font-medium flex items-center gap-2"><PiggyBank className="w-4 h-4 text-indigo-500"/> Kalan</p>
                        <h3 className={`text-3xl font-bold mt-1 ${netBalance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>{netBalance.toLocaleString()} ₺</h3>
                    </div>
                </div>

                {/* BÜTÇE İLERLEME */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="font-bold text-slate-700">Bütçe Doluluk Oranı</span>
                        <span className={`font-bold ${budgetPercent>100?'text-rose-600':'text-slate-600'}`}>%{budgetPercent.toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div className={`h-4 rounded-full transition-all duration-1000 ${progressBarColor}`} style={{ width: `${Math.min(budgetPercent, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Toplam {budget} TL bütçenizin {totalSpent} TL kadarını harcadınız.</p>
                </div>

                {/* ABONELİK LİSTESİ */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-slate-800 flex items-center gap-2"><RefreshCw className="w-5 h-5 text-blue-500"/> Sabit Giderler & Abonelikler</h3></div>
                    <div className="divide-y divide-slate-100">
                        {recurringExpenses.length > 0 ? recurringExpenses.map(r => (
                            <div key={r.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                                <div><p className="font-bold text-slate-800">{r.merchantName}</p><p className="text-xs text-slate-500">{r.category}</p></div>
                                <span className="font-bold text-slate-700">{r.totalAmount} ₺</span>
                            </div>
                        )) : <p className="p-6 text-slate-400 text-sm">Hiç sabit gideriniz yok.</p>}
                    </div>
                </div>

            </main>
        </div>
    );
}