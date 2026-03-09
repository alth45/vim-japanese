// src/components/VocabBank.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { playVoicevox } from '@/lib/voicevox';

interface VocabEntry {
    id: string;
    kanji: string;
    reading: string;
    meaning: string;
}

export default function VocabBank() {
    const [vocabs, setVocabs] = useState<VocabEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<'list' | 'flashcard'>('list');

    // Flashcard State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        fetchVocabs();
    }, []);

    const fetchVocabs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('vocab_bank')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setVocabs(data);
        setLoading(false);
    };

    const deleteVocab = async (id: string) => {
        if (!confirm('Yakin mau hapus vocab ini bro?')) return;
        setVocabs(prev => prev.filter(v => v.id !== id));
        await supabase.from('vocab_bank').delete().eq('id', id);
    };

    const nextCard = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % vocabs.length);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + vocabs.length) % vocabs.length);
    };

    if (loading) return <div className="flex-1 flex items-center justify-center font-mono animate-pulse">Memuat Database Vocab...</div>;

    return (
        <div className="flex-1 flex flex-col p-8 font-mono overflow-hidden" style={{ color: 'var(--text-main)' }}>
            <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                    <h1 className="text-2xl font-bold tracking-widest text-yellow-400">🎴 VOCABULARY BANK</h1>
                    <p className="text-xs opacity-60 mt-1">Total: {vocabs.length} kata tersimpan di database.</p>
                </div>
                <div className="flex gap-2 text-sm font-bold">
                    <button onClick={() => setMode('list')} className="px-4 py-2 transition-colors border" style={{ backgroundColor: mode === 'list' ? 'var(--accent)' : 'transparent', color: mode === 'list' ? '#000' : 'var(--accent)', borderColor: 'var(--accent)' }}>LIST VIEW</button>
                    <button onClick={() => setMode('flashcard')} className="px-4 py-2 transition-colors border" style={{ backgroundColor: mode === 'flashcard' ? 'var(--accent)' : 'transparent', color: mode === 'flashcard' ? '#000' : 'var(--accent)', borderColor: 'var(--accent)' }}>FLASHCARD</button>
                </div>
            </div>

            {vocabs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center opacity-50">Belum ada vocab yang di-save bro. Buka file teks dan hover kanji buat nge-save!</div>
            ) : mode === 'list' ? (
                // --- MODE LIST ---
                <div className="flex-1 overflow-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-panel)', borderBottom: '2px solid var(--border)' }}>
                                <th className="p-3">Kanji</th>
                                <th className="p-3">Furigana</th>
                                <th className="p-3">Arti (Meaning)</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vocabs.map((v) => (
                                <tr key={v.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td className="p-3 text-xl font-bold text-yellow-300">{v.kanji}</td>
                                    <td className="p-3 text-blue-300">{v.reading}</td>
                                    <td className="p-3 opacity-90">{v.meaning}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => deleteVocab(v.id)} className="text-red-400 hover:text-red-600">✕ Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                // --- MODE FLASHCARD ---
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-xs mb-4 opacity-50">Kartu {currentIndex + 1} dari {vocabs.length}</div>

                    <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="w-96 h-64 rounded-xl cursor-pointer flex flex-col items-center justify-center p-6 text-center transition-all duration-300 transform shadow-2xl relative"
                        style={{ backgroundColor: 'var(--bg-panel)', border: '2px solid var(--accent)' }}
                    >
                        {/* --- TOMBOL SUARA DI POJOK KANAN ATAS --- */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Wajib ada biar kartunya gak ikut ke-flip pas lu klik tombol suaranya!
                                playVoicevox(vocabs[currentIndex].kanji); // Kirim teks Kanji ke Voicevox
                            }}
                            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-xl opacity-50 hover:opacity-100 z-10"
                            title="Dengarkan Suara (Zundamon)"
                        >
                            🔊
                        </button>
                        {/* -------------------------------------- */}
                        {!isFlipped ? (
                            <span className="text-7xl font-bold text-yellow-400 drop-shadow-lg">{vocabs[currentIndex].kanji}</span>
                        ) : (
                            <div className="flex flex-col gap-4 animate-fade-in">
                                <span className="text-2xl text-blue-400 tracking-widest">{vocabs[currentIndex].reading}</span>
                                <div className="w-full h-px bg-white/20"></div>
                                <span className="text-xl">{vocabs[currentIndex].meaning}</span>
                            </div>
                        )}
                        <span className="absolute bottom-4 text-[10px] opacity-40">(Klik kartu untuk {isFlipped ? 'tutup' : 'buka'})</span>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button onClick={prevCard} className="px-6 py-2 border hover:bg-white/10 transition-all" style={{ borderColor: 'var(--border)' }}>&larr; Prev</button>
                        <button onClick={nextCard} className="px-6 py-2 border font-bold transition-all" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>Next &rarr;</button>
                    </div>
                </div>
            )}
        </div>
    );
}