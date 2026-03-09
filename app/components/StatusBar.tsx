// src/components/StatusBar.tsx
import React, { useMemo } from 'react';

interface StatusBarProps {
    text: string;
    vimMode: string;
    theme: string;
    isJsonFile: boolean;
}

export default function StatusBar({ text, vimMode, theme, isJsonFile }: StatusBarProps) {
    // useMemo biar dia cuma ngitung ulang kalau teksnya berubah (Biar hemat memori!)
    const stats = useMemo(() => {
        if (!text) return { chars: 0, kanji: 0, kana: 0, jlpt: 'N5 (Pemula)' };

        // Hapus spasi dan enter buat ngitung karakter murni
        const cleanText = text.replace(/\s/g, '');
        const chars = cleanText.length;

        // Regex sakti buat nyari Kanji dan Kana (Hiragana/Katakana)
        const kanji = (text.match(/[\u4e00-\u9faf]/g) || []).length;
        const kana = (text.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || []).length;

        // Algoritma estimasi JLPT dari seberapa brutal jumlah Kanji lu
        let jlpt = 'N5 (Pemula)';
        if (kanji > 200) jlpt = 'N1 (Master)';
        else if (kanji > 100) jlpt = 'N2 (Lanjutan)';
        else if (kanji > 50) jlpt = 'N3 (Menengah)';
        else if (kanji > 15) jlpt = 'N4 (Dasar)';

        return { chars, kanji, kana, jlpt };
    }, [text]);

    return (
        <div
            className="shrink-0 h-6 w-full flex items-center justify-between px-3 text-[10px] font-bold tracking-widest uppercase select-none z-40 transition-colors shadow-[0_-2px_10px_rgba(0,0,0,0.2)]"
            // Warnanya kita balik: Background pakai warna Accent (Neon), Text pakai warna Background Biar nyala!
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-main)' }}
        >
            {/* Bagian Kiri (Mode Info) */}
            <div className="flex items-center gap-2 h-full">
                <span className="flex items-center h-full px-2 hover:bg-black/20 cursor-pointer transition-colors" title="Vim Mode">
                    {vimMode === 'NORMAL' ? '🟢 NORMAL' : '🔴 INSERT'}
                </span>
                <span className="flex items-center h-full px-2 hover:bg-black/20 cursor-pointer transition-colors" title="Tipe File">
                    {isJsonFile ? '⚙️ JSON' : '🎌 JAPANESE'}
                </span>
            </div>

            {/* Bagian Kanan (Live Stats) */}
            <div className="flex items-center gap-1 h-full opacity-90">
                <span className="flex items-center h-full px-2 hover:bg-black/20 cursor-pointer transition-colors" title="Total Karakter (Tanpa Spasi)">
                    📝 Chars: {stats.chars}
                </span>

                {/* Kalau lagi buka file JSON, gak usah nampilin stat Jepang */}
                {!isJsonFile && (
                    <>
                        <span className="flex items-center h-full px-2 hover:bg-black/20 cursor-pointer transition-colors" title="Jumlah Hiragana & Katakana">
                            あ Kana: {stats.kana}
                        </span>
                        <span className="flex items-center h-full px-2 hover:bg-black/20 cursor-pointer transition-colors" title="Jumlah Kanji">
                            漢 Kanji: {stats.kanji}
                        </span>
                        <span className="flex items-center h-full px-2 hover:bg-black/20 cursor-pointer transition-colors" title="Estimasi Level JLPT Tulisan Ini">
                            🏆 {stats.jlpt}
                        </span>
                    </>
                )}

                <span className="flex items-center h-full px-2 hover:bg-black/20 cursor-pointer transition-colors" title="Tema IDE Aktif">
                    🎨 {theme}
                </span>
            </div>
        </div>
    );
}