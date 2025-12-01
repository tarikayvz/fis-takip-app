// client/src/app/finance/page.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { 
    LayoutDashboard, Receipt, Wallet, TrendingDown, PiggyBank, 
    RefreshCw, ArrowUpRight, ArrowDownRight, Save, Loader2,
    Calendar, FileSpreadsheet, FileText, CalendarRange, CalendarDays, CalendarCheck, Settings,
    UploadCloud, PlusCircle, Menu, X
} from 'lucide-react';

export default function Finance() {
    const { user, updateUser, loading: authLoading } = useAuth();
    const [receipts, setReceipts] = useState([]);
    const [income, setIncome] = useState(0);
    const [budget, setBudget] = useState(0);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobil menü için

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        if (user) {
            setIncome(parseFloat(user.income || 0));
            setBudget(parseFloat(user.budget || 0));
            fetchReceipts();
            
            // 👇 TEMA KONTROLÜ (Sayfa yenilenirse karanlık modu hatırla)
            const isDark = localStorage.getItem('theme') === 'dark';
            if(isDark) document.documentElement.classList.add('dark');
        }
    }, [user]);

    const fetchReceipts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/receipts`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            const data = await res.json();
            if (Array.isArray(data)) setReceipts(data);
        } catch (error) { console.error(error); }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, income, budget, name: user.name, currency: user.currency }),
            });
            if (res.ok) {
                updateUser({ income, budget });
                setMsg('Güncellendi! ✅');
                setTimeout(() => setMsg(''), 3000);
            }
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    const totalSpent = receipts.reduce((a, c) => a + parseFloat(c.totalAmount || 0), 0);
    const recurringExpenses = receipts.filter(r => r.isRecurring);
    const recurringTotal = recurringExpenses.reduce((a, c) => a + parseFloat(c.totalAmount || 0), 0);
    const netBalance = income - totalSpent;
    const budgetPercent = budget > 0 ? (totalSpent / budget) * 100 : 0;
    
    let progressBarColor = 'bg-emerald-500';
    if (budgetPercent >= 80) progressBarColor = 'bg-amber-500';
    if (budgetPercent >= 100) progressBarColor = 'bg-rose-600';

    if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400"/></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
            
            {/* MOBİL OVERLAY */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* SIDEBAR */}
            <aside className={`fixed md:sticky top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 overflow-y-auto`}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400"><Receipt className="w-8 h-8" /> Fiş Takip</h1>
                        <p className="text-xs text-slate-400 mt-1 pl-10">Hoş Geldin, {user.name}</p>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-slate-500"><X/></button>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/" className="flex items-center gap-3 w-full p-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><LayoutDashboard className="w-5 h-5"/> Gösterge Paneli</Link>
                    <button className="flex items-center gap-3 w-full p-3 text-sm font-medium text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg"><Wallet className="w-5 h-5"/> Finansal Durum</button>
                    
                    <div className="pt-6 pb-2 text-[10px] font-extrabold text-slate-400 px-3 uppercase tracking-wider">Sistem</div>
                    <Link href="/settings" className="flex items-center gap-3 w-full p-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><Settings className="w-5 h-5"/> Ayarlar</Link>
                </nav>
            </aside>

            <main className="flex-1 md:ml-64 p-8 w-full">
                <header className="mb-8 flex items-center gap-4">
                     <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Finansal Yönetim</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Gelirlerini, bütçeni ve sabit giderlerini buradan yönet.</p>
                    </div>
                </header>

                {/* AYARLAR KARTI */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-slate-400"/> Hızlı Ayarlar</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Aylık Net Gelir</label>
                            <div className="relative">
                                <input type="number" value={income} onChange={(e)=>setIncome(e.target.value)} className="w-full p-3 border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 rounded-xl font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                                <span className="absolute right-4 top-3 text-emerald-400 font-bold">₺</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Bütçe Hedefi</label>
                            <div className="relative">
                                <input type="number" value={budget} onChange={(e)=>setBudget(e.target.value)} className="w-full p-3 border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 rounded-xl font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                                <span className="absolute right-4 top-3 text-indigo-400 font-bold">₺</span>
                            </div>
                        </div>
                        <button onClick={handleSave} disabled={loading} className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white p-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg">
                            {loading ? <Loader2 className="animate-spin w-5 h-5"/> : 'Güncelle'}
                        </button>
                    </div>
                    {msg && <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-2 font-medium animate-pulse">{msg}</p>}
                </div>

                {/* 4'LÜ KARTLAR */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-emerald-500 dark:bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200/50 dark:shadow-none">
                        <p className="text-emerald-100 text-sm font-medium flex items-center gap-2"><ArrowUpRight className="w-4 h-4"/> Gelir</p>
                        <h3 className="text-3xl font-bold mt-1">{parseFloat(income).toLocaleString()} ₺</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2"><TrendingDown className="w-4 h-4 text-rose-500"/> Gider</p>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{totalSpent.toLocaleString()} ₺</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2"><RefreshCw className="w-4 h-4 text-blue-500"/> Sabit</p>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{recurringTotal.toLocaleString()} ₺</h3>
                    </div>
                    <div className={`rounded-2xl p-6 border shadow-sm ${netBalance >= 0 ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'}`}>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2"><PiggyBank className="w-4 h-4 text-indigo-500"/> Kalan</p>
                        <h3 className={`text-3xl font-bold mt-1 ${netBalance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>{netBalance.toLocaleString()} ₺</h3>
                    </div>
                </div>

                {/* BÜTÇE İLERLEME */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Bütçe Doluluk Oranı</span>
                        <span className={`font-bold ${budgetPercent>100?'text-rose-600 dark:text-rose-400':'text-slate-600 dark:text-slate-400'}`}>%{budgetPercent.toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                        <div className={`h-4 rounded-full transition-all duration-1000 ${progressBarColor}`} style={{ width: `${Math.min(budgetPercent, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Toplam {budget} TL bütçenizin {totalSpent} TL kadarını harcadınız.</p>
                </div>

                {/* ABONELİK LİSTESİ */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800"><h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><RefreshCw className="w-5 h-5 text-blue-500"/> Sabit Giderler & Abonelikler</h3></div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recurringExpenses.length > 0 ? recurringExpenses.map(r => (
                            <div key={r.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                <div><p className="font-bold text-slate-800 dark:text-slate-200">{r.merchantName}</p><p className="text-xs text-slate-500 dark:text-slate-400">{r.category}</p></div>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{r.totalAmount} ₺</span>
                            </div>
                        )) : <p className="p-6 text-slate-400 text-sm">Hiç sabit gideriniz yok.</p>}
                    </div>
                </div>

            </main>
        </div>
    );
}