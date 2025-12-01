// client/src/app/login/page.js
'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { Receipt, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const res = await login(email, password);
        if (!res.success) {
            setError(res.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-4">
                        <Receipt className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Tekrar Hoş Geldiniz</h1>
                    <p className="text-slate-500 text-sm mt-2">Hesabınıza giriş yapın ve harcamalarınızı yönetin.</p>
                </div>

                {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">E-posta Adresi</label>
                        <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="ornek@email.com"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                        <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••"/>
                    </div>
                    
                    <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <>Giriş Yap <ArrowRight className="w-5 h-5"/></>}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Hesabınız yok mu? <Link href="/register" className="text-indigo-600 font-bold hover:underline">Kayıt Olun</Link>
                </p>
            </div>
        </div>
    );
}