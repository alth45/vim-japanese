// src/components/VirtualKeyboard.tsx
import React from 'react';
import { numRow, row2, row3, row4 } from '@/lib/japaneseData';

interface VirtualKeyboardProps {
    activeFile: string | null;
    mode: string;
    setMode: (mode: 'hiragana' | 'katakana' | 'romaji') => void;
    romajiBuffer: string;
    smallMode: boolean;
    kanjiSuggestions: { k: string, r: string, m: string }[];
    typeKey: (k: any) => void;
    backspace: () => void;
    onNumKey: (num: string) => void;
    displayChar: (k: any) => string;
    autoKanjiMode: boolean;
    setAutoKanjiMode: (val: boolean) => void;
}

export default function VirtualKeyboard({
    activeFile, mode, setMode, romajiBuffer, smallMode,
    kanjiSuggestions, typeKey, backspace, onNumKey, displayChar,
    autoKanjiMode, setAutoKanjiMode
}: VirtualKeyboardProps) {
    return (
        <div className="h-full p-4 flex flex-col gap-2 overflow-y-auto relative transition-colors duration-300" style={{ backgroundColor: 'transparent' }}>

            {/* OVERLAY JIKA TIDAK ADA FILE TERBUKA */}
            {!activeFile && (
                <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}>
                    <span className="px-4 py-2 rounded-full text-xs font-bold border" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        Buka file terlebih dahulu untuk mengetik
                    </span>
                </div>
            )}

            {/* SUGGESTION BAR */}
            <div className="flex gap-2 mb-2 h-8 items-center text-sm">
                <span className="text-xs font-bold w-16" style={{ color: 'var(--text-muted)' }}>SUGGEST:</span>
                {kanjiSuggestions.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => onNumKey((i + 1).toString())}
                        className="px-3 py-1 rounded border hover:bg-white/10 transition-colors"
                        style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
                    >
                        <span className="mr-1" style={{ color: 'var(--text-muted)' }}>{i + 1}:</span> {s.k}
                    </button>
                ))}
            </div>

            {/* NUM ROW */}
            <div className="flex justify-center gap-1">
                {numRow.map(num => (
                    <button
                        key={num}
                        onClick={() => onNumKey(num)}
                        className="w-10 h-10 border rounded text-sm shadow flex items-center justify-center hover:bg-white/10 transition-colors"
                        style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--text-main)' }}
                    >
                        {num}
                    </button>
                ))}
                {/* Tombol Backspace tetap merah transparan biar jelas kalau ini tombol hapus */}
                <button onClick={backspace} className="w-20 h-10 bg-red-500/20 text-red-500 border border-red-500/50 rounded hover:bg-red-500/30 text-xs font-bold flex items-center justify-center transition-colors">
                    BACK
                </button>
            </div>

            {/* ROW 2 */}
            <div className="flex justify-center gap-1">
                <button className="w-14 h-12 border rounded text-xs flex items-center justify-center cursor-default" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>TAB</button>
                {row2.map((k, i) => {
                    const isHinted = romajiBuffer && k.r && k.r.startsWith(romajiBuffer);
                    return (
                        <button
                            key={i}
                            onClick={() => typeKey(k)}
                            className={`w-12 h-12 border rounded text-lg flex flex-col items-center justify-center relative group transition-all ${isHinted ? 'scale-[0.98]' : 'hover:bg-white/10'}`}
                            style={{
                                backgroundColor: isHinted ? 'rgba(255,255,255,0.05)' : 'var(--bg-panel)',
                                borderColor: isHinted ? 'var(--accent)' : 'var(--border)',
                                color: isHinted ? 'var(--accent)' : 'var(--text-main)',
                                boxShadow: isHinted ? 'inset 0 0 10px var(--accent)' : 'none'
                            }}
                        >
                            <span className="font-serif">{displayChar(k)}</span>
                            <span className="text-[9px] absolute bottom-0.5 right-1" style={{ color: isHinted ? 'var(--accent)' : 'var(--text-muted)', fontWeight: isHinted ? 'bold' : 'normal' }}>{k.r}</span>
                        </button>
                    );
                })}
            </div>

            {/* ROW 3 */}
            <div className="flex justify-center gap-1 ml-4">
                {row3.map((k, i) => {
                    const isHinted = romajiBuffer && k.r && k.r.startsWith(romajiBuffer);
                    return (
                        <button
                            key={i}
                            onClick={() => typeKey(k)}
                            className={`w-12 h-12 border rounded text-lg flex flex-col items-center justify-center relative group transition-all ${isHinted ? 'scale-[0.98]' : 'hover:bg-white/10'}`}
                            style={{
                                backgroundColor: isHinted ? 'rgba(255,255,255,0.05)' : 'var(--bg-panel)',
                                borderColor: isHinted ? 'var(--accent)' : 'var(--border)',
                                color: isHinted ? 'var(--accent)' : 'var(--text-main)',
                                boxShadow: isHinted ? 'inset 0 0 10px var(--accent)' : 'none'
                            }}
                        >
                            <span className="font-serif">{displayChar(k)}</span>
                            <span className="text-[9px] absolute bottom-0.5 right-1" style={{ color: isHinted ? 'var(--accent)' : 'var(--text-muted)', fontWeight: isHinted ? 'bold' : 'normal' }}>{k.r}</span>
                        </button>
                    );
                })}
            </div>

            {/* ROW 4 */}
            <div className="flex justify-center gap-1 ml-10">
                {row4.map((k, i) => {
                    const isHinted = romajiBuffer && k.r && k.r.startsWith(romajiBuffer);
                    return (
                        <button
                            key={i}
                            onClick={() => typeKey(k)}
                            className={`w-12 h-12 border rounded text-lg flex flex-col items-center justify-center relative group transition-all ${isHinted ? 'scale-[0.98]' : 'hover:bg-white/10'}`}
                            style={{
                                backgroundColor: isHinted ? 'rgba(255,255,255,0.05)' : 'var(--bg-panel)',
                                borderColor: isHinted ? 'var(--accent)' : 'var(--border)',
                                color: isHinted ? 'var(--accent)' : 'var(--text-main)',
                                boxShadow: isHinted ? 'inset 0 0 10px var(--accent)' : 'none'
                            }}
                        >
                            <span className="font-serif">{displayChar(k)}</span>
                            <span className="text-[9px] absolute bottom-0.5 right-1" style={{ color: isHinted ? 'var(--accent)' : 'var(--text-muted)', fontWeight: isHinted ? 'bold' : 'normal' }}>{k.r}</span>
                        </button>
                    );
                })}
                <button
                    onClick={() => typeKey({ s: 'small', r: 'small' })}
                    className="w-12 h-12 border rounded text-xs font-bold transition-colors"
                    style={{
                        backgroundColor: smallMode ? 'var(--accent)' : 'var(--bg-panel)',
                        borderColor: smallMode ? 'var(--accent)' : 'var(--border)',
                        color: smallMode ? '#000' : 'var(--text-muted)'
                    }}
                >
                    小
                </button>
            </div>

            {/* BOTTOM ROW (Controls) */}
            <div className="flex justify-center gap-2 mt-2">
                <button
                    onClick={() => setMode('hiragana')}
                    className="px-4 py-2 rounded text-xs font-bold border transition-colors"
                    style={{
                        backgroundColor: mode === 'hiragana' ? 'var(--accent)' : 'var(--bg-panel)',
                        borderColor: mode === 'hiragana' ? 'var(--accent)' : 'var(--border)',
                        color: mode === 'hiragana' ? '#000' : 'var(--text-muted)'
                    }}
                >
                    あ (Hira)
                </button>
                <button
                    onClick={() => setMode('katakana')}
                    className="px-4 py-2 rounded text-xs font-bold border transition-colors"
                    style={{
                        backgroundColor: mode === 'katakana' ? 'var(--accent)' : 'var(--bg-panel)',
                        borderColor: mode === 'katakana' ? 'var(--accent)' : 'var(--border)',
                        color: mode === 'katakana' ? '#000' : 'var(--text-muted)'
                    }}
                >
                    ア (Kata)
                </button>
                <button
                    onClick={() => typeKey({ r: ' ' })}
                    className="w-48 h-8 border rounded hover:bg-white/10 text-xs shadow flex items-center justify-center transition-colors"
                    style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                    SPACE
                </button>

                <button
                    onClick={() => setAutoKanjiMode(!autoKanjiMode)}
                    className="px-4 py-2 rounded text-xs font-bold border transition-all"
                    style={{
                        backgroundColor: autoKanjiMode ? 'var(--accent)' : 'var(--bg-panel)',
                        borderColor: autoKanjiMode ? 'var(--accent)' : 'var(--border)',
                        color: autoKanjiMode ? '#000' : 'var(--text-muted)',
                        boxShadow: autoKanjiMode ? '0 0 12px var(--accent)' : 'none'
                    }}
                >
                    ⚡ AUTO KANJI: {autoKanjiMode ? 'ON' : 'OFF'}
                </button>
            </div>
        </div>
    );
}