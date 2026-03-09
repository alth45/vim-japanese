// app/read/[id]/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';

export default function PublicReaderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [book, setBook] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBook = async () => {
            // Tarik juga kolom share_token_expires_at
            const { data, error } = await supabase
                .from('file_system')
                .select('name, content, is_public, share_token_expires_at')
                .eq('id', id)
                .single();

            if (error || !data) {
                setError('Buku tidak ditemukan atau link salah.');
            } else if (!data.is_public) {
                setError('🔒 Buku ini di-private oleh penulisnya.');
            } else if (data.share_token_expires_at && new Date() > new Date(data.share_token_expires_at)) {
                // LOGIKA SAKTI: Kalau waktu sekarang LEBIH BESAR dari waktu kadaluarsa, tolak!
                setError('⏳ Link ini sudah KADALUARSA (Melewati batas 24 Jam). Minta penulis untuk share ulang!');
            } else {
                try {
                    const parsed = JSON.parse(data.content);
                    setBook(parsed);
                } catch (e) {
                    setError('Format buku rusak.');
                }
            }
            setLoading(false);
        };
        fetchBook();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] text-white font-mono tracking-widest">Memuat Mahakarya... ⏳</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] text-red-400 font-mono text-xl">{error}</div>;
    if (!book) return null;

    return (
        <div className="min-h-screen font-serif relative overflow-hidden" style={{ backgroundColor: '#fdfbf7', color: '#2c2c2c' }}>

            <style dangerouslySetInnerHTML={{
                __html: `
                .tategaki-scrollbar::-webkit-scrollbar { height: 10px; }
                .tategaki-scrollbar::-webkit-scrollbar-track { background: #f0ebe1; border-radius: 8px; margin: 0 20px; }
                .tategaki-scrollbar::-webkit-scrollbar-thumb { background: #d4c5b9; border-radius: 8px; border: 2px solid #f0ebe1; }
                .tategaki-scrollbar::-webkit-scrollbar-thumb:hover { background: #bcaaa4; }
                ::selection { background: #e9d5ff; color: #6b21a8; }
            `}} />

            {/* Header Estetik */}
            <div className="fixed top-0 left-0 right-0 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 shadow-sm">
                <div className="font-bold tracking-widest text-sm text-gray-400">JAPAN LEARNER <span className="text-purple-500">PUBLIC READER</span></div>
                <div className="text-xs px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full font-bold shadow-sm">📖 Published</div>
            </div>

            {/* Bagian Cover */}
            {book.coverImage && (
                <div className="relative w-full flex flex-col items-center justify-center pt-28 pb-12 z-10" style={{ backgroundColor: '#fdfbf7' }}>
                    <img src={book.coverImage} alt="Cover" className="w-auto h-[50vh] object-contain shadow-[0_15px_35px_rgba(0,0,0,0.2)] mb-8 border border-gray-200 rounded-r-md rounded-l-sm" />
                    <h1 className="text-3xl md:text-4xl tracking-[0.2em] font-bold text-gray-800 drop-shadow-sm text-center px-6 leading-relaxed">{book.title}</h1>
                    <p className="text-gray-400 mt-6 tracking-widest text-xs uppercase animate-bounce">Scroll ke bawah ↓</p>
                </div>
            )}

            {/* Area Kanvas Baca */}
            <div className="relative w-full pb-24 px-4 md:px-12 flex justify-center" style={{ backgroundColor: book.coverImage ? '#f4f0e6' : '#fdfbf7', paddingTop: book.coverImage ? '40px' : '120px' }}>

                {/* --- SIHIR KALIGRAFI BACKGROUND (WATERMARK RAKSASA) --- */}
                <div className="absolute inset-0 pointer-events-none flex justify-between items-center px-2 md:px-16 z-0 overflow-hidden">
                    {/* Kiri: Kachou Fuugetsu (Keindahan Alam) */}
                    <div className="text-[15vh] md:text-[25vh] text-black opacity-[0.03] font-serif select-none" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                        花鳥風月
                    </div>
                    {/* Kanan: Meikyou Shisui (Ketenangan Batin) */}
                    <div className="text-[15vh] md:text-[25vh] text-black opacity-[0.03] font-serif select-none" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                        明鏡止水
                    </div>
                </div>

                {/* Box "Kertas" (Ditambahin z-10 biar posisinya di atas watermark) */}
                <div
                    className="relative z-10 w-full max-w-6xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-sm p-6 md:p-12 overflow-x-auto tategaki-scrollbar border border-gray-100"
                    dir="rtl"
                >
                    <div
                        style={{
                            writingMode: 'vertical-rl',
                            textOrientation: 'upright',
                            lineHeight: '2.2',
                            fontSize: '18px',
                            height: '65vh',
                            minHeight: '400px',
                            whiteSpace: 'pre-wrap',
                            fontFamily: '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif',
                            textAlign: 'justify',
                            color: '#2b2b2b',
                            paddingBottom: '20px'
                        }}
                    >
                        {book.content}
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="relative z-10 w-full py-6 text-center text-xs text-gray-400 tracking-widest uppercase border-t border-gray-200 bg-white">
                Powered by Japan Learner IDE
            </div>
        </div>
    );
}