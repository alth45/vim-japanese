// src/components/HoverableText.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getJLPTData } from '@/lib/jlptData';
import { useHoverableText } from '@/hooks/useHoverableText';
import { playVoicevox } from '@/lib/voicevox';
import { supabase } from '@/lib/supabase'; // JANGAN LUPA IMPORT SUPABASE BRO!

interface HoverableTextProps {
    text: string;
    onSaveVocab: (kanji: string, reading: string, meaning: string) => void;
}

export default function HoverableText({ text, onSaveVocab }: HoverableTextProps) {
    const {
        mounted, tooltip, tokens,
        handleMouseEnter, handleMouseLeave, handleSaveClick, cancelHide
    } = useHoverableText(text, onSaveVocab);

    // --- STATE BUAT CATATAN KANJI CLOUD ---
    const [kanjiNotes, setKanjiNotes] = useState<Record<string, string>>({});
    const [userId, setUserId] = useState<string | null>(null); // Nyimpen ID user yang lagi login

    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, char: string, hasNote: boolean } | null>(null);
    const [modal, setModal] = useState<{ type: 'view' | 'edit' | 'create', char: string } | null>(null);
    const [noteInput, setNoteInput] = useState('');

    // Load catatan langsung dari Cloud Supabase pas pertama buka!
    useEffect(() => {
        const fetchNotes = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            // Tarik semua catatan milik user ini
            const { data, error } = await supabase.from('kanji_notes').select('kanji, note');

            if (data && !error) {
                // Ubah format Array dari DB jadi Object/Dictionary biar gampang dibaca UI
                const notesMap: Record<string, string> = {};
                data.forEach(item => { notesMap[item.kanji] = item.note; });
                setKanjiNotes(notesMap);
            }
        };

        fetchNotes();

        const handleClickOutside = () => setContextMenu(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    // Fungsi sakti buat nge-save catatan langsung nembus ke Supabase
    const handleSaveNote = async () => {
        if (!modal || !userId) return;

        // Optimistic UI: Update layar langsung biar kerasa ngebut!
        const updatedNotes = { ...kanjiNotes, [modal.char]: noteInput };
        setKanjiNotes(updatedNotes);
        setModal(null);

        // Nembak ke DB di *background* (Upsert = Kalau ada di-update, kalau gada dibikin baru)
        const { error } = await supabase
            .from('kanji_notes')
            .upsert(
                { user_id: userId, kanji: modal.char, note: noteInput },
                { onConflict: 'user_id, kanji' } // Kunci biar gak double-entry
            );

        if (error) {
            console.error("Gagal nyimpen catatan ke Cloud:", error);
            alert("Koneksi gagal bro, catatan gagal tersimpan di cloud!");
        }
    };

    const isTooltipFlipped = tooltip ? tooltip.y < 250 : false;

    return (
        <>
            {tokens.map((token, i) => {
                if (token.type === 'furigana' || token.type === 'kanji') {
                    const char = token.type === 'furigana' ? token.kanji! : token.text!;
                    const jlpt = getJLPTData(char);
                    const hasNote = !!kanjiNotes[char];

                    return (
                        <ruby
                            key={i}
                            className="cursor-help transition-all duration-300 rounded px-[2px] hover:bg-white/20"
                            onMouseEnter={(e) => handleMouseEnter(e, char, jlpt)}
                            onMouseLeave={handleMouseLeave}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setContextMenu({ x: e.clientX, y: e.clientY, char, hasNote });
                            }}
                            style={{
                                borderBottom: hasNote ? `3px double #4ade80` : `2px dashed ${jlpt.color}`,
                                backgroundColor: hasNote ? 'rgba(74, 222, 128, 0.15)' : 'transparent',
                                color: hasNote ? '#86efac' : 'var(--text-main)',
                                textShadow: `0 0 10px ${jlpt.color}40`
                            }}
                            title={hasNote ? "Klik Kanan untuk opsi catatan" : "Klik Kanan untuk tambah catatan"}
                        >
                            {char}
                            {token.type === 'furigana' && (
                                <rt className="text-[0.6em] opacity-90 select-none font-sans tracking-tighter" style={{ color: hasNote ? '#4ade80' : jlpt.color }}>
                                    {token.furigana}
                                </rt>
                            )}
                        </ruby>
                    );
                } else {
                    return <span key={i} style={{ color: 'var(--text-main)' }}>{token.text}</span>;
                }
            })}

            {mounted && tooltip && tooltip.visible && createPortal(
                <div
                    className={`fixed z-[99999] shadow-[0_15px_40px_rgba(0,0,0,0.6)] p-3.5 rounded-xl min-w-[180px] max-w-[280px] flex flex-col gap-2 font-sans transition-all duration-150 animate-in fade-in zoom-in-95 ${isTooltipFlipped ? 'transform -translate-x-1/2 translate-y-4' : 'transform -translate-x-1/2 -translate-y-full -mt-2'
                        }`}
                    style={{
                        left: tooltip.x, top: tooltip.y,
                        backgroundColor: 'var(--bg-panel)', border: `1px solid ${tooltip.jlpt.color}50`,
                        backdropFilter: 'blur(12px)', writingMode: 'horizontal-tb'
                    }}
                    onMouseEnter={cancelHide}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="absolute -top-3 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest text-black shadow-lg" style={{ backgroundColor: tooltip.jlpt.color }}>
                        {tooltip.jlpt.level !== '?' ? `JLPT ${tooltip.jlpt.level}` : 'UNRANKED'}
                    </div>

                    {tooltip.loading ? (
                        <div className="flex items-center justify-center gap-2 text-xs py-4" style={{ color: 'var(--text-muted)' }}>
                            <span className="animate-spin" style={{ color: tooltip.jlpt.color }}>⏳</span> Mencari arti...
                        </div>
                    ) : (
                        <>
                            <div className="relative flex flex-col pr-8">
                                <button
                                    onClick={(e) => { e.stopPropagation(); playVoicevox(tooltip.word); }}
                                    className="absolute -top-1 -right-1 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-lg opacity-80 hover:opacity-100"
                                    title="Dengarkan Suara"
                                >
                                    🔊
                                </button>
                                <span className="font-bold text-[10px] tracking-widest uppercase opacity-80" style={{ color: tooltip.jlpt.color }}>Furigana</span>
                                <span className="text-xl font-serif mb-2 mt-0.5 drop-shadow-sm" style={{ color: 'var(--text-main)' }}>{tooltip.reading || '-'}</span>
                                <span className="font-bold text-[10px] tracking-widest uppercase opacity-80" style={{ color: 'var(--text-muted)' }}>English / Arti</span>
                                <span className="text-sm break-words leading-relaxed mt-0.5" style={{ color: 'var(--text-main)' }}>{tooltip.meaning || 'Tidak ditemukan'}</span>
                            </div>

                            <div className="mt-2 pt-2 border-t border-dashed" style={{ borderColor: 'var(--border)' }}>
                                <button
                                    onClick={handleSaveClick}
                                    disabled={tooltip.saved}
                                    className="w-full py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"
                                    style={{
                                        backgroundColor: tooltip.saved ? `${tooltip.jlpt.color}20` : 'var(--bg-main)',
                                        color: tooltip.saved ? tooltip.jlpt.color : 'var(--text-main)',
                                        border: '1px solid', borderColor: tooltip.saved ? tooltip.jlpt.color : 'var(--border)',
                                        cursor: tooltip.saved ? 'default' : 'pointer'
                                    }}
                                    onMouseEnter={(e) => { if (!tooltip.saved) { e.currentTarget.style.borderColor = tooltip.jlpt.color; e.currentTarget.style.color = tooltip.jlpt.color; } }}
                                    onMouseLeave={(e) => { if (!tooltip.saved) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-main)'; } }}
                                >
                                    {tooltip.saved ? '✓ Tersimpan' : '+ Save to Vocab'}
                                </button>
                            </div>
                        </>
                    )}

                    <div
                        className={`absolute w-3.5 h-3.5 transform rotate-45 left-1/2 -translate-x-1/2 ${isTooltipFlipped ? '-top-[7px]' : '-bottom-[7px]'}`}
                        style={{
                            backgroundColor: 'var(--bg-panel)',
                            borderTop: isTooltipFlipped ? `1px solid ${tooltip.jlpt.color}50` : 'none',
                            borderLeft: isTooltipFlipped ? `1px solid ${tooltip.jlpt.color}50` : 'none',
                            borderBottom: !isTooltipFlipped ? `1px solid ${tooltip.jlpt.color}50` : 'none',
                            borderRight: !isTooltipFlipped ? `1px solid ${tooltip.jlpt.color}50` : 'none'
                        }}>
                    </div>
                </div>,
                document.body
            )}

            {contextMenu && (
                <div
                    className="fixed z-[100000] py-1 w-40 rounded shadow-2xl text-xs font-sans border"
                    style={{ top: contextMenu.y, left: contextMenu.x, backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-3 py-1 mb-1 font-bold border-b text-center text-lg" style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}>
                        {contextMenu.char}
                    </div>

                    {contextMenu.hasNote ? (
                        <>
                            <button onClick={() => { setModal({ type: 'view', char: contextMenu.char }); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors">
                                👁️ Lihat Catatan
                            </button>
                            <button onClick={() => { setNoteInput(kanjiNotes[contextMenu.char]); setModal({ type: 'edit', char: contextMenu.char }); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors">
                                ✏️ Edit Catatan
                            </button>
                        </>
                    ) : (
                        <button onClick={() => { setNoteInput(''); setModal({ type: 'create', char: contextMenu.char }); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors text-green-400">
                            ➕ Tambah Catatan
                        </button>
                    )}
                </div>
            )}

            {modal && (
                <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)}>
                    <div
                        className="p-5 rounded-lg shadow-2xl w-96 flex flex-col font-sans"
                        style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-4 flex items-center justify-between" style={{ color: 'var(--text-main)' }}>
                            <span>Catatan Kanji: <span style={{ color: 'var(--accent)' }}>{modal.char}</span></span>
                            {modal.type === 'view' && <span className="text-xs font-normal px-2 py-1 rounded bg-white/10">Mode Baca</span>}
                        </h2>

                        {modal.type === 'view' ? (
                            <div className="p-3 rounded mb-4 min-h-[100px] whitespace-pre-wrap leading-relaxed" style={{ backgroundColor: 'var(--bg-panel)', color: 'var(--text-main)' }}>
                                {kanjiNotes[modal.char]}
                            </div>
                        ) : (
                            <textarea
                                autoFocus
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                placeholder="Ketik makna kanji, cara baca, atau mnemonic di sini..."
                                className="w-full p-3 rounded mb-4 h-32 outline-none resize-none"
                                style={{ backgroundColor: 'var(--bg-panel)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                            />
                        )}

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setModal(null)} className="px-4 py-2 rounded text-sm hover:bg-white/10 transition-colors" style={{ color: 'var(--text-muted)' }}>
                                {modal.type === 'view' ? 'Tutup' : 'Batal'}
                            </button>
                            {modal.type !== 'view' && (
                                <button onClick={handleSaveNote} className="px-4 py-2 rounded text-sm font-bold shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-main)' }}>
                                    Simpan Catatan
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}