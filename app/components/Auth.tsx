// src/components/Auth.tsx
'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Registrasi sukses! Langsung login aja bro.');
                setIsLogin(true); // Pindah ke tab login
            }
        } catch (error: any) {
            alert(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center font-mono relative" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            {/* Background Keren */}
            <div className="absolute inset-0 z-0 bg-cover bg-center opacity-20" style={{ backgroundImage: 'url("https://media.giphy.com/media/1n7DPJsqQG2K4/giphy.gif")' }}></div>

            <div className="relative z-10 p-8 rounded-lg shadow-2xl w-96 backdrop-blur-md" style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                <div className="text-center mb-8">
                    <div className="text-5xl mb-2">🎌</div>
                    <h1 className="text-2xl font-bold tracking-widest" style={{ color: 'var(--text-muted)' }}>JAPAN LEARNER</h1>
                    <p className="text-xs mt-1" style={{ color: 'var(--accent)' }}>System Authentication</p>
                </div>

                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-bold opacity-70 mb-1 block">EMAIL</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 bg-black/30 outline-none focus:ring-1 transition-all"
                            style={{ border: '1px solid var(--border)', color: 'var(--text-main)' }}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold opacity-70 mb-1 block">PASSWORD</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 bg-black/30 outline-none focus:ring-1 transition-all"
                            style={{ border: '1px solid var(--border)', color: 'var(--text-main)' }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 py-2 font-bold tracking-widest hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: 'var(--accent)', color: '#000' }}
                    >
                        {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'REGISTER')}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs opacity-60">
                    <button onClick={() => setIsLogin(!isLogin)} className="hover:text-white underline decoration-dotted">
                        {isLogin ? "Belum punya akun? Register di sini bro" : "Udah punya akun? Balik ke Login"}
                    </button>
                </div>
            </div>
        </div>
    );
}