// client/src/context/AuthContext.js
'use client';
import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

// 👇 API Adresini Belirle
// Eğer Vercel'de (Production) isek Environment Variable kullan, yoksa localhost.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // GİRİŞ YAP
    const login = async (email, password) => {
        try {
            // 👇 URL'yi dinamik yaptık
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            // Hata varsa JSON parse etmeden yakala
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Giriş başarısız.');
            }

            const data = await res.json();

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            router.push('/');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // KAYIT OL
    const register = async (name, email, password) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Kayıt başarısız.');
            }
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading, API_URL }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);