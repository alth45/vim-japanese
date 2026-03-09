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
        <div className="flex h-screen items-center justify-center font-mono relative bg-[#0d1117] text-gray-200 overflow-hidden">

            {/* Background Image & Overlay Biar Keren */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: 'url("https://media.giphy.com/media/1n7DPJsqQG2K4/giphy.gif")' }}
            ></div>
            {/* Gradient Overlay biar teks tetep kebaca walau backgroundnya rame */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/80 to-transparent"></div>

            {/* Form Card (Glassmorphism) */}
            <div className="relative z-10 p-10 rounded-2xl w-[400px] bg-[#161b22]/80 backdrop-blur-xl border border-gray-700 shadow-[0_0_50px_rgba(0,0,0,0.5)]">

                <div className="text-center mb-8">
                    <div className="text-5xl mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">🎌</div>
                    <h1 className="text-2xl font-bold tracking-[0.2em] text-white">JAPAN LEARNER</h1>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <p className="text-xs text-green-400 font-bold tracking-widest">SYSTEM_AUTH</p>
                    </div>
                </div>

                <form onSubmit={handleAuth} className="flex flex-col gap-5">
                    <div>
                        <label className="text-xs font-bold text-gray-400 mb-2 block tracking-wider">EMAIL_ADDRESS</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white transition-all placeholder-gray-600"
                            placeholder="hacker@tokyo.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 mb-2 block tracking-wider">PASSWORD</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white transition-all placeholder-gray-600"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3.5 rounded-lg font-bold tracking-widest text-white transition-all duration-300 shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.6)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                        style={{ backgroundColor: '#9333ea' }} // Warna Ungu Neon fix, gak ngandelin theme variable!
                    >
                        {loading ? 'PROCESSING...' : (isLogin ? 'ACCESS_SYSTEM' : 'REGISTER_ID')}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs">
                    <p className="text-gray-500 mb-2">{isLogin ? "Belum punya akses?" : "Sudah punya ID?"}</p>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-purple-400 hover:text-purple-300 font-bold underline decoration-dotted decoration-purple-500/50 underline-offset-4 transition-colors"
                    >
                        {isLogin ? "Daftar Akun Baru (Register)" : "Kembali ke Login"}
                    </button>
                </div>
            </div>
        </div>
    );
}