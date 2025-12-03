// client/src/app/page.js
'use client'; 
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { 
    LayoutDashboard, UploadCloud, FileSpreadsheet, Trash2, 
    Search, Calendar, Wallet, Receipt, TrendingUp, AlertCircle, 
    Store, PieChart, CalendarDays, CalendarRange, Settings, HelpCircle, FileText, Loader2,
    TrendingDown, PiggyBank, Clock, PlusCircle, X, CalendarCheck, MessageCircle, Send,
    RefreshCw, Target, CheckCircle, Printer, Download, Save, Pencil, Menu // İkonlar
} from 'lucide-react'; 
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// API ADRESİ
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // --- STATE ---
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(0);
  const [income, setIncome] = useState(0);

  // 👇 YENİ: Resim Büyütme State'i
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Modals
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [manualData, setManualData] = useState({ merchantName: '', date: new Date().toISOString().slice(0, 10), totalAmount: '', category: 'Diğer', isRecurring: false });
  const [goals, setGoals] = useState([]);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoalData, setNewGoalData] = useState({ title: '', targetAmount: '', color: 'bg-indigo-500' });
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [reportTitle, setReportTitle] = useState("");

  // Alert/Confirm Modalları
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false); 
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);   
  const [targetGoalId, setTargetGoalId] = useState(null); 
  const [addAmount, setAddAmount] = useState('');         
  const [confirmAction, setConfirmAction] = useState(null); 
  const [confirmMessage, setConfirmMessage] = useState(''); 

  // Chatbot
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'ai', text: 'Merhaba! Ben FişBot 🤖 Finansal durumun hakkında bana soru sorabilirsin.' }]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const categories = ["Market", "Giyim", "Teknoloji", "Restoran", "Ulaşım", "Sağlık", "Fatura", "Eğlence", "Kira/Aidat", "Birikim", "Diğer"];
  const goalColors = ["bg-indigo-500", "bg-emerald-500", "bg-rose-500", "bg-amber-500", "bg-purple-500"];

  useEffect(() => { if (!authLoading && !user) router.push('/login'); }, [user, authLoading, router]);
  useEffect(() => { 
      if (user) {
          fetchReceipts(); fetchGoals();
          if(user.budget) setBudget(parseFloat(user.budget));
          if(user.income) setIncome(parseFloat(user.income));
          const isDark = localStorage.getItem('theme') === 'dark';
          if(isDark) document.documentElement.classList.add('dark');
      }
  }, [user]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const getAuthHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

  // Bildirim
  const showToast = (message, type = 'success') => {
      setNotification({ show: true, message, type });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  // API Functions
  const fetchReceipts = async () => { try { const res = await fetch(`${API_URL}/api/receipts`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); const data = await res.json(); if(Array.isArray(data)) setReceipts(data); } catch (error) { console.error("Hata:", error); } };
  const fetchGoals = async () => { try { const res = await fetch(`${API_URL}/api/goals`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); const data = await res.json(); if(Array.isArray(data)) setGoals(data); } catch (error) { console.error(error); } };

  const handleDeleteRequest = (e, id, type) => {
      e.stopPropagation();
      setConfirmMessage(type === 'receipt' ? "Bu fişi silmek istediğine emin misin?" : "Hedefi silmek istiyor musun?");
      setConfirmAction(() => async () => {
          const endpoint = type === 'receipt' ? `${API_URL}/api/receipts/${id}` : `${API_URL}/api/goals/${id}`;
          try {
              const res = await fetch(endpoint, { method: 'DELETE', headers: getAuthHeaders() });
              if (res.ok) {
                  if (type === 'receipt') {
                      setReceipts(prev => prev.filter(item => item.id !== id));
                      if(selectedReceipt?.id === id) setSelectedReceipt(null);
                  } else {
                      fetchGoals();
                      fetchReceipts();
                  }
                  setIsConfirmModalOpen(false);
                  showToast("Başarıyla Silindi! 🗑️", "success");
              } else { showToast("Silinemedi!", "error"); }
          } catch (error) { showToast("Hata oluştu", "error"); }
      });
      setIsConfirmModalOpen(true);
  };

  const handleUpload = async () => { 
      if (!file) { showToast("Lütfen resim seçin!", "error"); return; } 
      setStatus('AI Analiz Ediyor... ⏳'); 
      const formData = new FormData(); 
      formData.append('image', file); 
      try { 
          const res = await fetch(`${API_URL}/api/receipts/upload`, { 
              method: 'POST', 
              body: formData, 
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
          }); 
          if (res.ok) { 
              setStatus('Başarılı! ✅'); 
              showToast("Fiş Başarıyla Okundu! 🎉", "success");
              fetchReceipts(); 
              setTimeout(() => setStatus(''), 3000); 
          } else { 
              setStatus('Hata oluştu.'); 
              showToast("Fiş okunamadı.", "error");
          } 
      } catch (error) { setStatus('Sunucu hatası.'); showToast("Sunucuya bağlanılamadı.", "error"); } 
  };

  const handleManualSubmit = async (e) => { e.preventDefault(); if(!manualData.totalAmount) return showToast("Tutar giriniz!", "error"); try { const res = await fetch(`${API_URL}/api/receipts/manual`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(manualData) }); if(res.ok) { fetchReceipts(); setIsManualOpen(false); setManualData({ merchantName: '', date: new Date().toISOString().slice(0, 10), totalAmount: '', category: 'Diğer', isRecurring: false }); showToast('Harcama Eklendi! ✍️', "success"); } else { showToast("Kaydedilemedi.", "error"); } } catch (error) { console.error(error); } };
  const handleAddGoal = async (e) => { e.preventDefault(); try { const res = await fetch(`${API_URL}/api/goals`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(newGoalData) }); if(res.ok) { fetchGoals(); setIsGoalModalOpen(false); setNewGoalData({ title: '', targetAmount: '', color: 'bg-indigo-500' }); showToast("Hedef Oluşturuldu! 🎯", "success"); } } catch (error) { console.error(error); } };
  
  const openAddMoneyModal = (goalId) => { setTargetGoalId(goalId); setAddAmount(''); setIsAddMoneyModalOpen(true); };
  const submitAddMoney = async (e) => { e.preventDefault(); if(!addAmount) return; try { await fetch(`${API_URL}/api/goals/${targetGoalId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ amount: parseFloat(addAmount) }) }); fetchGoals(); fetchReceipts(); setIsAddMoneyModalOpen(false); showToast("Para Eklendi! 💰", "success"); } catch (error) { console.error(error); } };

  const handleSendMessage = async (e) => { e.preventDefault(); if (!chatInput.trim()) return; const userMessage = chatInput; setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]); setChatInput(''); setChatLoading(true); try { const res = await fetch(`${API_URL}/api/receipts/chat`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ message: userMessage }) }); const data = await res.json(); setChatMessages(prev => [...prev, { role: 'ai', text: data.reply || "Hata oluştu." }]); } catch (error) { setChatMessages(prev => [...prev, { role: 'ai', text: "Bağlantı hatası ❌" }]); } finally { setChatLoading(false); } };
  
  const handleItemChange = (index, field, value) => { const newItems = [...selectedReceipt.items]; newItems[index][field] = field === 'price' ? parseFloat(value) || 0 : value; const newTotal = newItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0); setSelectedReceipt({ ...selectedReceipt, items: newItems, totalAmount: newTotal }); };
  const handleReceiptChange = (field, value) => { setSelectedReceipt({ ...selectedReceipt, [field]: value }); };
  const handleSaveDetails = async () => { try { const res = await fetch(`${API_URL}/api/receipts/${selectedReceipt.id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ merchantName: selectedReceipt.merchantName, date: selectedReceipt.date, totalAmount: selectedReceipt.totalAmount, category: selectedReceipt.category, items: selectedReceipt.items }) }); if (res.ok) { showToast("Güncellendi! ✅", "success"); fetchReceipts(); setSelectedReceipt(null); } else { showToast("Güncelleme hatası.", "error"); } } catch (error) { console.error(error); } };

  const filteredReceipts = receipts.filter(receipt => { const textMatch = receipt.merchantName?.toLowerCase().includes(searchTerm.toLowerCase()) || receipt.category?.toLowerCase().includes(searchTerm.toLowerCase()); let dateMatch = true; if (startDate && receipt.date < startDate) dateMatch = false; if (endDate && receipt.date > endDate) dateMatch = false; return textMatch && dateMatch; });
  const downloadExcel = () => { if (reportData.length === 0) { showToast("Veri yok.", "error"); return; } const dataToExport = reportData.map(r => ({ "Tarih": r.date, "Mağaza": r.merchantName, "Kategori": r.category, "Tutar": parseFloat(r.totalAmount), "Durum": r.isCancelled ? "İPTAL" : "Aktif" })); const ws = XLSX.utils.json_to_sheet(dataToExport); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Harcamalar"); XLSX.writeFile(wb, `${reportTitle}.xlsx`); };
  const printReport = () => { window.print(); };
  const handleQuickExport = (type) => { const now = new Date(); let filtered = []; let title = ""; const getLocalDate = (d) => { const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0'); return `${year}-${month}-${day}`; }; if (type === 'daily') { filtered = receipts.filter(r => r.date === getLocalDate(now)); title = "Gunluk_Rapor"; } else if (type === 'weekly') { const lastWeek = new Date(); lastWeek.setDate(now.getDate() - 7); lastWeek.setHours(0,0,0,0); filtered = receipts.filter(r => { const rDate = new Date(r.date); rDate.setHours(0,0,0,0); return rDate >= lastWeek; }); title = "Haftalik_Rapor"; } else if (type === 'monthly') { const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); startOfMonth.setHours(0,0,0,0); filtered = receipts.filter(r => { const rDate = new Date(r.date); rDate.setHours(0,0,0,0); return rDate >= startOfMonth; }); title = "Aylik_Rapor"; } else if (type === 'yearly') { const startOfYear = new Date(now.getFullYear(), 0, 1); startOfYear.setHours(0,0,0,0); filtered = receipts.filter(r => { const rDate = new Date(r.date); rDate.setHours(0,0,0,0); return rDate >= startOfYear; }); title = "Yillik_Rapor"; } if (filtered.length === 0) showToast(`⚠️ Bu dönem için veri yok.`, "error"); else { setReportData(filtered); setReportTitle(title); setIsReportModalOpen(true); } };
  const handleExport = (data = filteredReceipts, filenamePrefix = "Rapor") => { if (data.length === 0) { showToast("Veri yok.", "error"); return; } const dataToExport = data.map(r => ({ "Tarih": r.date, "Mağaza": r.merchantName, "Kategori": r.category, "Tutar": parseFloat(r.totalAmount) })); const ws = XLSX.utils.json_to_sheet(dataToExport); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Harcamalar"); XLSX.writeFile(wb, `${filenamePrefix}.xlsx`); };

  // Calculations & Charts
  const activeReceipts = filteredReceipts.filter(r => !r.isCancelled);
  const totalSpent = activeReceipts.reduce((a, c) => a + parseFloat(c.totalAmount||0), 0);
  const budgetPercent = budget > 0 ? (totalSpent / budget) * 100 : 0;
  let progressBarColor = budgetPercent >= 100 ? 'bg-rose-600' : budgetPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500';
  const netBalance = income - totalSpent; 
  const recurringExpenses = activeReceipts.filter(r => r.isRecurring);
  const recurringTotal = recurringExpenses.reduce((a, c) => a + parseFloat(c.totalAmount||0), 0);
  const monthlyDataRaw = activeReceipts.reduce((acc, curr) => { const d = new Date(curr.date); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; acc[key] = (acc[key] || 0) + parseFloat(curr.totalAmount); return acc; }, {});
  const sortedMonths = Object.keys(monthlyDataRaw).sort();
  const barData = { labels: sortedMonths.map(k => {const [y,m]=k.split('-'); return new Date(y,m-1).toLocaleDateString('tr-TR',{month:'long',year:'numeric'})}), datasets: [{ label: 'Aylık Harcama', data: sortedMonths.map(k => monthlyDataRaw[k]), backgroundColor: '#6366f1', borderRadius: 6 }] };
  const categoryTotals = activeReceipts.reduce((acc, r) => { if (r.items?.length > 0) r.items.forEach(i => acc[i.category||r.category||'Diğer']=(acc[i.category||r.category||'Diğer']||0)+parseFloat(i.price||0)); else acc[r.category||'Diğer']=(acc[r.category||'Diğer']||0)+parseFloat(r.totalAmount||0); return acc; }, {});
  const pieData = { labels: Object.keys(categoryTotals), datasets: [{ data: Object.values(categoryTotals), backgroundColor: ['#f43f5e', '#3b82f6', '#eab308', '#10b981', '#8b5cf6'], borderWidth:0 }] };
  const merchantTotals = activeReceipts.reduce((acc, r) => { acc[r.merchantName||'?']=(acc[r.merchantName||'?']||0)+parseFloat(r.totalAmount||0); return acc; }, {});
  const merchantData = { labels: Object.keys(merchantTotals), datasets: [{ data: Object.values(merchantTotals), backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'], borderWidth: 0 }] };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400"/></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300 relative">
      
      {/* TOAST BİLDİRİM */}
      {notification.show && (
          <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
              {notification.type === 'error' ? <AlertCircle className="w-6 h-6"/> : <CheckCircle className="w-6 h-6"/>}
              <span className="font-bold">{notification.message}</span>
          </div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed md:sticky top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 overflow-y-auto`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div><h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400"><Receipt className="w-8 h-8" /> Fiş Takip</h1><p className="text-xs text-slate-400 mt-1 pl-10">Hoş Geldin, {user.name}</p></div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-slate-500"><X/></button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
            <button className="flex items-center gap-3 w-full p-3 text-sm font-medium text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg"><LayoutDashboard className="w-5 h-5"/> Gösterge Paneli</button>
            <Link href="/finance" className="flex items-center gap-3 w-full p-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-lg transition-colors"><Wallet className="w-5 h-5"/> Finansal Durum</Link>
            <div className="pt-6 pb-2 text-[10px] font-extrabold text-slate-400 px-3 uppercase tracking-wider">Hızlı Raporlar</div>
            <button onClick={() => handleQuickExport('daily')} className="flex items-center gap-3 w-full p-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-lg transition-colors"><FileText className="w-5 h-5"/> Günlük Rapor</button>
            <button onClick={() => handleQuickExport('weekly')} className="flex items-center gap-3 w-full p-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg transition-colors"><CalendarRange className="w-5 h-5"/> Haftalık Rapor</button>
            <button onClick={() => handleQuickExport('monthly')} className="flex items-center gap-3 w-full p-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-400 rounded-lg transition-colors"><CalendarDays className="w-5 h-5"/> Aylık Rapor</button>
            <button onClick={() => handleQuickExport('yearly')} className="flex items-center gap-3 w-full p-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-400 rounded-lg transition-colors"><CalendarCheck className="w-5 h-5"/> Yıllık Rapor</button>
            <button onClick={() => handleExport()} className="flex items-center gap-3 w-full p-3 text-sm font-medium text-slate-600 hover:bg-amber-50 hover:text-amber-700 rounded-lg"><FileSpreadsheet className="w-5 h-5"/> Özel Rapor</button>
            <div className="pt-6 pb-2 text-[10px] font-extrabold text-slate-400 px-3 uppercase tracking-wider">Sistem</div>
            <Link href="/settings" className="flex items-center gap-3 w-full p-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><Settings className="w-5 h-5"/> Ayarlar</Link>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 pb-24 transition-colors duration-300 w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Menu className="w-6 h-6" /></button>
                <div><h2 className="text-xl md:text-2xl font-bold dark:text-white">Gösterge Paneli</h2><p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">Harcamalarını buradan analiz et.</p></div>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 w-full md:w-auto justify-between md:justify-start">
                <label className="cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-2 rounded-lg text-xs md:text-sm font-medium flex gap-2 dark:text-slate-200"><UploadCloud className="w-4 h-4"/> <span className="hidden sm:inline">Fiş Seç</span><input type="file" onChange={(e)=>setFile(e.target.files[0])} accept="image/*" className="hidden"/></label>
                <div className="flex gap-2">
                    <button onClick={handleUpload} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium shadow-lg shadow-indigo-200/50">Analiz Et ✨</button>
                    <button onClick={() => setIsManualOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-medium shadow-lg shadow-emerald-200/50 flex items-center gap-2"><PlusCircle className="w-4 h-4"/><span className="hidden sm:inline">Ekle</span></button>
                </div>
            </div>
        </header>

        {status && <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl flex items-center gap-3 border border-indigo-100 dark:border-indigo-800 animate-pulse"><AlertCircle className="w-5 h-5" /> {status}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"><div className="relative z-10"><p className="text-emerald-100 text-sm font-medium flex items-center gap-2"><Wallet className="w-4 h-4"/> Aylık Gelir</p><h3 className="text-2xl font-bold mt-1">{income.toLocaleString()} ₺</h3></div><Wallet className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-400/20" /></div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"><p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2"><TrendingDown className="w-4 h-4 text-rose-500"/> Toplam Gider</p><h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{totalSpent.toLocaleString()} ₺</h3><div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2"><div className="bg-rose-500 h-2 rounded-full" style={{width: income > 0 ? `${Math.min((totalSpent/income)*100, 100)}%` : '0%'}}></div></div></div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"><p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2"><RefreshCw className="w-4 h-4 text-blue-500"/> Sabit Giderler</p><h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{recurringTotal.toLocaleString()} ₺</h3></div>
            <div className={`rounded-2xl p-6 border shadow-sm ${netBalance >= 0 ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' : 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900'}`}><p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2"><PiggyBank className="w-4 h-4 text-indigo-500"/> Kalan</p><h3 className={`text-2xl font-bold mt-1 ${netBalance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>{netBalance.toLocaleString()} ₺</h3></div>
        </div>

        <div className="mb-8">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Target className="w-5 h-5 text-purple-600"/> Hedef Kumbaraları</h3><button onClick={() => setIsGoalModalOpen(true)} className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3 py-1 rounded-lg transition">+ Yeni Hedef</button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => {
                    const progress = (goal.savedAmount / goal.targetAmount) * 100;
                    return (
                        <div key={goal.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800 transition" onClick={() => openAddMoneyModal(goal.id)}>
                            <div className="flex justify-between items-start mb-2"><div><h4 className="font-bold text-slate-700 dark:text-slate-200">{goal.title}</h4><p className="text-xs text-slate-400">Hedef: {parseFloat(goal.targetAmount).toLocaleString()} ₺</p></div><div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${goal.color}`}>{Math.round(progress)}%</div></div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{parseFloat(goal.savedAmount).toLocaleString()} <span className="text-sm font-normal text-slate-400">₺</span></h3>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3"><div className={`h-2 rounded-full transition-all duration-1000 ${goal.color}`} style={{ width: `${Math.min(progress, 100)}%` }}></div></div>
                            <button onClick={(e) => handleDeleteRequest(e, goal.id, 'goal')} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4"/></button>
                        </div>
                    )
                })}
                {goals.length === 0 && <div onClick={() => setIsGoalModalOpen(true)} className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-purple-300 hover:text-purple-500 transition h-32"><PlusCircle className="w-8 h-8 mb-2"/><span className="text-sm font-medium">Hayal Ekle</span></div>}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 col-span-1 lg:col-span-2"><h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Aylık Trend</h3><div className="h-64"><Bar data={barData} options={{maintainAspectRatio:false}} /></div></div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"><h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Kategori</h3><div className="h-64 flex justify-center"><Doughnut data={pieData} options={{maintainAspectRatio:false, cutout:'60%'}} /></div></div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"><h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Mağaza</h3><div className="h-64 flex justify-center"><Doughnut data={merchantData} options={{maintainAspectRatio:false, cutout:'60%'}} /></div></div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between"><h3 className="font-semibold text-slate-800 dark:text-slate-200">Son İşlemler ({filteredReceipts.length})</h3></div>
            <div className="max-h-[500px] overflow-y-auto">
                {filteredReceipts.map((fis) => (
                    <div key={fis.id} onClick={() => setSelectedReceipt(fis)} className={`flex justify-between items-center p-4 cursor-pointer border-b last:border-0 border-slate-100 dark:border-slate-800 transition ${fis.isCancelled ? 'bg-slate-50 dark:bg-slate-900 opacity-60 grayscale' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs flex-shrink-0">
                                {/* 👇 RESİM DÜZELTİLDİ: TIKLANINCA BÜYÜR (onClick ekledik) */}
                                {fis.imagePath ? (
                                    <img 
                                        src={`${API_URL}/${fis.imagePath.replace(/\\/g, '/')}`} 
                                        className="w-full h-full object-cover rounded-full" 
                                        alt="."
                                        onClick={(e) => { e.stopPropagation(); setSelectedReceipt(fis); setIsImageZoomed(true); }}
                                    />
                                ) : fis.category?.[0]}
                            </div>
                            <div><p className={`font-bold text-slate-800 dark:text-slate-200 ${fis.isCancelled ? 'line-through text-slate-500' : ''}`}>{fis.merchantName}</p><p className="text-xs text-slate-500 dark:text-slate-400">{fis.date} {fis.isRecurring && <span className="bg-blue-100 text-blue-600 px-1 rounded ml-1 text-[10px]">ABONELİK</span>} {fis.isCancelled && <span className="bg-red-100 text-red-600 px-1 rounded ml-1 text-[10px]">İPTAL</span>}</p></div>
                        </div>
                        <div className="flex items-center gap-4"><span className={`font-bold ${fis.isCancelled ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{fis.totalAmount} ₺</span><button onClick={(e) => handleDeleteRequest(e, fis.id, 'receipt')} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4"/></button></div>
                    </div>
                ))}
            </div>
        </div>
      </main>

      {/* 1. PARA EKLEME MODALI */}
      {isAddMoneyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Hedefe Para Ekle 💰</h3>
                <form onSubmit={submitAddMoney}>
                    <input autoFocus type="number" placeholder="Miktar (TL)" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg mb-4 font-bold text-lg"/>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setIsAddMoneyModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">İptal</button>
                        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Ekle</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* 2. SİLME ONAY MODALI */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border-2 border-rose-100 dark:border-rose-900 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-3 mb-3 text-rose-600"><AlertTriangle className="w-6 h-6"/><h3 className="text-lg font-bold">Emin misin?</h3></div>
                <p className="text-slate-600 dark:text-slate-300 mb-6">{confirmMessage}</p>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Vazgeç</button>
                    <button onClick={confirmAction} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">Evet, Sil</button>
                </div>
            </div>
        </div>
      )}

      {/* 3. DÜZENLEME VE DETAY MODALI (RESİM TIKLAMA DÜZELTİLDİ) */}
      {selectedReceipt && !isImageZoomed && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedReceipt(null)}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="w-5/12 bg-slate-100 dark:bg-slate-950 p-4 flex items-center justify-center border-r border-slate-200 dark:border-slate-800 relative group">
                    {selectedReceipt.imagePath ? (
                        <>
                            {/* 👇 RESME TIKLAYINCA BÜYÜTEÇ AÇILIR */}
                            <img 
                                src={`${API_URL}/${selectedReceipt.imagePath.replace(/\\/g, '/')}`} 
                                className="max-h-full max-w-full rounded shadow-lg object-contain cursor-zoom-in transition-transform hover:scale-105"
                                alt="Fiş Görseli"
                                onClick={() => setIsImageZoomed(true)}
                                onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<p class="text-rose-500 text-sm">Resim yüklenemedi</p>'; }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs">Büyütmek için tıkla</span>
                            </div>
                        </>
                    ) : <p className="text-slate-400">Resim Yok</p>}
                </div>
                <div className="w-7/12 p-8 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-slate-800 dark:text-white">Fiş Detayları</h2><button onClick={() => setSelectedReceipt(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition">✕</button></div>
                    <div className="space-y-4 mb-6"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mağaza</label><input type="text" value={selectedReceipt.merchantName} onChange={(e) => handleReceiptChange('merchantName', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-lg font-bold"/></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tarih</label><input type="date" value={selectedReceipt.date} onChange={(e) => handleReceiptChange('date', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg"/></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori</label><select value={selectedReceipt.category} onChange={(e) => handleReceiptChange('category', e.target.value)} className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg">{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div></div></div>
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2 border-b dark:border-slate-800 pb-2 text-sm">ÜRÜNLER</h3>
                    <div className="space-y-2 mb-6">{selectedReceipt.items?.map((item, i) => (<div key={i} className="flex gap-2 items-center"><input type="text" value={item.name} onChange={(e) => handleItemChange(i, 'name', e.target.value)} className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded text-sm dark:text-slate-200"/><input type="number" value={item.price} onChange={(e) => handleItemChange(i, 'price', e.target.value)} className="w-24 p-2 bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded text-sm font-mono text-right dark:text-slate-200"/></div>))}</div>
                    <div className="flex justify-between items-center pt-4 border-t dark:border-slate-800"><div><p className="text-xs text-slate-500">TOPLAM</p><p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{selectedReceipt.totalAmount} ₺</p></div><button onClick={handleSaveDetails} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-indigo-200/50"><Save className="w-4 h-4"/> Güncelle</button></div>
                </div>
            </div>
        </div>
      )}

      {/* 👇 YENİ: TAM EKRAN RESİM (LIGHTBOX) */}
      {isImageZoomed && selectedReceipt && (
          <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsImageZoomed(false)}>
              <img 
                  src={`${API_URL}/${selectedReceipt.imagePath.replace(/\\/g, '/')}`} 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in duration-300"
              />
              <button className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm"><X className="w-8 h-8"/></button>
          </div>
      )}

      {/* DİĞER MODALLAR AYNI... */}
      {isManualOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200"><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-slate-800 dark:text-white">Manuel Ekle</h3><button onClick={() => setIsManualOpen(false)}><X className="w-6 h-6 text-slate-400 hover:text-slate-600"/></button></div><form onSubmit={handleManualSubmit} className="space-y-4"><div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Açıklama</label><input type="text" required placeholder="Örn: Kira" value={manualData.merchantName} onChange={(e) => setManualData({...manualData, merchantName: e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg"/></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tarih</label><input type="date" required value={manualData.date} onChange={(e) => setManualData({...manualData, date: e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg"/></div><div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tutar</label><input type="number" required placeholder="0.00" value={manualData.totalAmount} onChange={(e) => setManualData({...manualData, totalAmount: e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg font-bold"/></div></div><div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label><select value={manualData.category} onChange={(e) => setManualData({...manualData, category: e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg bg-white">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div><div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 cursor-pointer" onClick={() => setManualData({...manualData, isRecurring: !manualData.isRecurring})}><div className={`w-5 h-5 rounded border flex items-center justify-center ${manualData.isRecurring ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-600'}`}>{manualData.isRecurring && <span className="text-white text-xs">✓</span>}</div><span className="text-sm text-slate-600 dark:text-slate-300 select-none">Sabit Ödeme (Abonelik)</span></div><button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-bold mt-4 shadow-lg shadow-emerald-200">Kaydet ✅</button></form></div></div>}
      {isGoalModalOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200"><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-slate-800 dark:text-white">Yeni Hedef 🎯</h3><button onClick={() => setIsGoalModalOpen(false)}><X className="w-6 h-6 text-slate-400 hover:text-slate-600"/></button></div><form onSubmit={handleAddGoal} className="space-y-4"><div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hedef Adı</label><input type="text" required placeholder="Örn: Tatil" value={newGoalData.title} onChange={(e) => setNewGoalData({...newGoalData, title: e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg"/></div><div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hedef Tutar</label><input type="number" required placeholder="50000" value={newGoalData.targetAmount} onChange={(e) => setNewGoalData({...newGoalData, targetAmount: e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg font-bold"/></div><div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Renk Seç</label><div className="flex gap-2">{goalColors.map(c => <div key={c} onClick={() => setNewGoalData({...newGoalData, color: c})} className={`w-8 h-8 rounded-full cursor-pointer border-2 ${c} ${newGoalData.color === c ? 'border-slate-800 dark:border-white' : 'border-transparent'}`}></div>)}</div></div><button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl font-bold mt-4 shadow-lg shadow-purple-200">Hedefi Oluştur 🚀</button></form></div></div>}
      {isReportModalOpen && ( <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"> <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"> <div className="flex justify-between items-center mb-6 border-b pb-4"> <div><h3 className="text-2xl font-bold text-slate-800 dark:text-white">{reportTitle}</h3><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{reportData.length} kayıt listeleniyor</p></div> <button onClick={() => setIsReportModalOpen(false)}><X className="w-6 h-6 text-slate-400 hover:text-slate-600"/></button> </div> <div className="flex-1 overflow-y-auto mb-6 border rounded-xl dark:border-slate-700"> <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300"> <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500 sticky top-0"><tr><th className="px-6 py-4">Tarih</th><th className="px-6 py-4">Mağaza</th><th className="px-6 py-4">Kategori</th><th className="px-6 py-4 text-right">Tutar</th></tr></thead> <tbody className="divide-y divide-slate-100 dark:divide-slate-700"> {reportData.map((r, i) => (<tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800"><td className="px-6 py-3">{r.date}</td><td className="px-6 py-3 font-medium text-slate-800 dark:text-white">{r.merchantName}</td><td className="px-6 py-3">{r.category}</td><td className="px-6 py-3 text-right font-bold text-slate-700 dark:text-slate-300">{r.totalAmount} ₺</td></tr>))} </tbody> </table> </div> <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl"> <div className="text-lg font-bold text-indigo-700 dark:text-indigo-400">Toplam: {reportData.reduce((a,c)=>a+parseFloat(c.totalAmount||0),0).toLocaleString()} ₺</div> <div className="flex gap-3"> <button onClick={printReport} className="flex items-center gap-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 font-medium"><Printer className="w-4 h-4"/> Yazdır</button> <button onClick={downloadExcel} className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium shadow-lg shadow-green-200"><Download className="w-4 h-4"/> Excel İndir</button> </div> </div> </div> </div> )}
      <div className="fixed bottom-6 right-6 z-50">{!isChatOpen ? <button onClick={() => setIsChatOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl animate-bounce"><MessageCircle className="w-8 h-8"/></button> : <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl border flex flex-col"><div className="bg-indigo-600 p-4 text-white flex justify-between"><span>FişBot 🤖</span><button onClick={()=>setIsChatOpen(false)}><X/></button></div><div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">{chatMessages.map((m,i)=><div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}><div className={`p-3 rounded-xl text-sm ${m.role==='user'?'bg-indigo-600 text-white':'bg-white border'}`}>{m.text}</div></div>)}{chatLoading&&<Loader2 className="animate-spin"/>}<div ref={chatEndRef}></div></div><form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2"><input className="flex-1 p-2 bg-slate-100 rounded" value={chatInput} onChange={e=>setChatInput(e.target.value)}/><button type="submit"><Send/></button></form></div>}</div>
    </div>
  );
}