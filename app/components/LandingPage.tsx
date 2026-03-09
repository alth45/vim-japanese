// src/components/LandingPage.tsx
import React from 'react';

interface LandingPageProps {
    onLoginClick: () => void;
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
    return (
        <div className="min-h-screen font-mono flex flex-col selection:bg-purple-500/30" style={{ backgroundColor: '#0d1117', color: '#c9d1d9' }}>

            {/* --- NAVBAR --- */}
            <nav className="w-full flex items-center justify-between px-8 py-6 border-b border-gray-800 bg-[#0d1117]/80 backdrop-blur-md fixed top-0 z-50">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🎌</span>
                    <span className="font-bold tracking-widest text-white">JAPAN LEARNER</span>
                </div>
                <button
                    onClick={onLoginClick}
                    className="px-6 py-2 rounded font-bold text-sm transition-all hover:scale-105"
                    style={{ backgroundColor: '#8b5cf6', color: '#fff', boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)' }}
                >
                    Login / Register
                </button>
            </nav>

            {/* --- HERO SECTION --- */}
            <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center relative overflow-hidden">
                {/* Watermark Jepang Raksasa di Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-serif font-bold text-white opacity-[0.02] select-none pointer-events-none whitespace-nowrap">
                    日本語
                </div>

                <div className="z-10 max-w-4xl flex flex-col items-center">
                    <div className="px-4 py-1.5 rounded-full border border-purple-500/30 text-purple-400 text-xs font-bold tracking-widest mb-8 bg-purple-500/10">
                        V 1.0.0 — IDE FOR LANGUAGE LEARNERS
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Catatan Bahasa Jepang,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Gaya Hacker.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
                        Bukan sekadar notepad. Ini adalah Text Editor khusus dengan fitur Auto-Kanji, JLPT Scanner, Terminal Command, dan mesin pembuat Web Novel (Tategaki).
                    </p>

                    <button
                        onClick={onLoginClick}
                        className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded hover:bg-gray-200 transition-all"
                    >
                        <span className="flex items-center gap-2">
                            Buka Workspace Sekarang
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                    </button>
                </div>
            </main>

            {/* --- FEATURES SECTION --- */}
            <section className="w-full bg-[#161b22] py-24 px-8 border-t border-gray-800 z-10">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Fitur 1 */}
                    <div className="bg-[#0d1117] p-8 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-colors">
                        <div className="text-4xl mb-4">🤖</div>
                        <h3 className="text-xl font-bold text-white mb-3">Smart Kanji Scanner</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Ketikanmu langsung dianalisis. Deteksi otomatis level JLPT, Furigana, dan simpan kosakata baru ke dalam Flashcard/Vocab Bank pribadimu.
                        </p>
                    </div>

                    {/* Fitur 2 */}
                    <div className="bg-[#0d1117] p-8 rounded-xl border border-gray-800 hover:border-cyan-500/50 transition-colors">
                        <div className="text-4xl mb-4">⌨️</div>
                        <h3 className="text-xl font-bold text-white mb-3">Terminal & Vim Mode</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Kendalikan aplikasimu lewat command line. Ganti tema, buat file, hapus sampah (clean), hingga mem-build buku secara otomatis tanpa menyentuh mouse.
                        </p>
                    </div>

                    {/* Fitur 3 */}
                    <div className="bg-[#0d1117] p-8 rounded-xl border border-gray-800 hover:border-green-500/50 transition-colors">
                        <div className="text-4xl mb-4">📖</div>
                        <h3 className="text-xl font-bold text-white mb-3">Tategaki Publisher</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Gabungkan catatanmu menjadi satu file <code className="text-purple-400">.jbook</code>. Pasang cover, lalu sebarkan link publiknya untuk dibaca dalam format vertikal ala Light Novel.
                        </p>
                    </div>

                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="w-full text-center py-8 text-xs text-gray-600 border-t border-gray-800 bg-[#0d1117] z-10">
                &copy; 2026 Japan Learner IDE. Dibuat dengan penuh ☕ dan 🎌.
            </footer>
        </div>
    );
}