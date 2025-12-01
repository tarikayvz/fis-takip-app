// client/src/app/register/page.js
'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2 } from 'lucide-react';

export default function Register() {
    const { register } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const res = await register(name, email, password);
        if (res.success) {
            alert("Kayıt Başarılı! Giriş yapabilirsiniz.");
            router.push('/login');
        } else {
            setError(res.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
                        <UserPlus className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Hesap Oluştur</h1>
                    <p className="text-slate-500 text-sm mt-2">Harcamalarınızı kontrol altına alın.</p>
                </div>

                {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                        <input type="text" required value={name} onChange={(e)=>setName(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Adınız"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                        <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="ornek@email.com"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                        <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="••••••••"/>
                    </div>
                    
                    <button disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin w-5 h-5"/> : 'Kayıt Ol'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Zaten hesabınız var mı? <Link href="/login" className="text-emerald-600 font-bold hover:underline">Giriş Yap</Link>
                </p>
            </div>
        </div>
    );
}