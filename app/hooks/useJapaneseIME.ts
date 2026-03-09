// src/hooks/useJapaneseIME.ts
import { useState, useEffect, useCallback } from 'react';
import { ROMAJI_MAP, KATAKANA_SMALL_MAP } from '../lib/japaneseData';
import { fetchWithCache } from '../lib/apiCache';

export function useJapaneseIME(
    text: string,
    setText: (val: React.SetStateAction<string>) => void
) {
    const [mode, setMode] = useState<'hiragana' | 'katakana' | 'romaji'>('hiragana');
    const [romajiBuffer, setRomajiBuffer] = useState('');

    const [dakutenMode, setDakutenMode] = useState(false);
    const [handakutenMode, setHandakutenMode] = useState(false);
    const [smallMode, setSmallMode] = useState(false);

    const [autoKanjiMode, setAutoKanjiMode] = useState(false);
    const [kanjiSuggestions, setKanjiSuggestions] = useState<{ k: string, r: string, m: string }[]>([]);

    const commitChar = useCallback((ch: string) => {
        setText((prev) => prev + ch);
        setRomajiBuffer('');
    }, [setText]);

    // =============== LOGIC NGETIK DIPERBARUI DI SINI ===============
    const typeRaw = useCallback((r: string) => {
        let newBuf = romajiBuffer + r;

        // 1. AUTO TSU KECIL (っ) UNTUK DOUBLE KONSONAN
        // Contoh: ngetik "tt" buat "kitte", atau "kk" buat "gakkou"
        if (newBuf.length === 2 && newBuf[0] === newBuf[1] && !['a', 'i', 'u', 'e', 'o', 'n'].includes(newBuf[0])) {
            let ch = mode === 'katakana' ? 'ッ' : 'っ';
            setText((prev) => prev + ch);
            newBuf = newBuf[1]; // Sisa huruf kedua disimpan buat huruf selanjutnya
        }

        // 2. AUTO HURUF 'N' (ん) JIKA DIIKUTI KONSONAN (Selain y dan n)
        // Contoh: ngetik "nk" buat "benkyou", huruf 'n' otomatis jadi 'ん'
        if (newBuf.length === 2 && newBuf[0] === 'n' && !['a', 'i', 'u', 'e', 'o', 'y', 'n'].includes(newBuf[1])) {
            let ch = mode === 'katakana' ? 'ン' : 'ん';
            setText((prev) => prev + ch);
            newBuf = newBuf[1]; // Sisa huruf konsonan (misal 'k') lanjut diproses
        }

        // Pengecekan standar di Kamus Romaji
        if (ROMAJI_MAP[newBuf]) {
            let ch = ROMAJI_MAP[newBuf];
            if (mode === 'katakana') ch = String.fromCharCode(ch.charCodeAt(0) + 96);
            commitChar(ch);
        } else {
            setRomajiBuffer(newBuf);
        }
    }, [romajiBuffer, mode, commitChar, setText]);
    // ===============================================================

    const displayChar = useCallback((k: any) => {
        let base = mode === 'katakana' && k.k ? k.k : k.h;
        if (dakutenMode && k.d) base = mode === 'katakana' ? String.fromCharCode(k.d.charCodeAt(0) + 96) : k.d;
        if (handakutenMode && k.p) base = mode === 'katakana' ? String.fromCharCode(k.p.charCodeAt(0) + 96) : k.p;
        if (smallMode && k.s) {
            if (mode === 'hiragana') return k.s;
            if (mode === 'katakana') return KATAKANA_SMALL_MAP[k.s] || base;
        }
        return base;
    }, [mode, dakutenMode, handakutenMode, smallMode]);

    const typeKey = useCallback((k: any) => {
        if (k.r === 'daku') { setDakutenMode(!dakutenMode); return; }
        if (k.r === 'handaku') { setHandakutenMode(!handakutenMode); return; }
        if (k.r === 'small') { setSmallMode(!smallMode); return; }

        if (mode === 'romaji') {
            typeRaw(k.r);
        } else {
            let ch = displayChar(k);
            commitChar(ch);
        }
        setDakutenMode(false); setHandakutenMode(false); setSmallMode(false);
    }, [mode, dakutenMode, handakutenMode, smallMode, typeRaw, displayChar, commitChar]);

    const backspace = useCallback(() => {
        if (romajiBuffer.length > 0) {
            setRomajiBuffer((prev) => prev.slice(0, -1));
        } else {
            setText((prev) => prev.slice(0, -1));
            setKanjiSuggestions([]);
        }
    }, [romajiBuffer, setText]);

    const selectKanji = useCallback((kanjiObj: any) => {
        setText((prev) => prev.slice(0, -kanjiObj.r.length) + kanjiObj.k);
        setKanjiSuggestions([]);
    }, [setText]);

    const onNumKey = useCallback((num: string) => {
        if (kanjiSuggestions.length > 0) {
            const idx = parseInt(num) - 1;
            if (kanjiSuggestions[idx]) {
                selectKanji(kanjiSuggestions[idx]);
                return;
            }
        }
        commitChar(num);
    }, [kanjiSuggestions, commitChar, selectKanji]);

    // Logic API KANJI
    useEffect(() => {
        const match = text.match(/[\u3040-\u309F]+$/);
        if (!match) return;

        const lastHiraganaWord = match[0];
        const timer = setTimeout(async () => {
            try {
                // const res = await fetch(`/api/kanji?text=${lastHiraganaWord}`);
                // const data = await res.json();
                // Panggil lewat cache, gak usah di-.json() lagi karena udah dihandle di apiCache.ts
                const data = await fetchWithCache(`/api/kanji?text=${lastHiraganaWord}`);

                if (data && data[0] && data[0][1]) {
                    const googleKanjis: string[] = data[0][1];
                    const formatted = googleKanjis.map(kanji => ({ k: kanji, r: lastHiraganaWord, m: 'API' }));

                    if (autoKanjiMode && formatted.length > 0) {
                        const bestMatchObj = formatted.find(item => item.k !== lastHiraganaWord);
                        if (bestMatchObj) {
                            setText((prev) => {
                                if (prev.endsWith(lastHiraganaWord)) {
                                    return prev.slice(0, -lastHiraganaWord.length) + bestMatchObj.k;
                                }
                                return prev;
                            });
                            setKanjiSuggestions([]);
                            return;
                        }
                    }
                    setKanjiSuggestions(formatted.slice(0, 5));
                }
            } catch (e) {
                console.error("Kamus API Error:", e);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [text, autoKanjiMode, setText]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            const key = e.key;

            if (key === 'Backspace') {
                e.preventDefault(); backspace();
            } else if (/^[a-zA-Z]$/.test(key)) {
                e.preventDefault(); typeRaw(key.toLowerCase());
            } else if (/^[0-9]$/.test(key)) {
                e.preventDefault(); onNumKey(key);
            } else if (key === ' ' || key === 'Spacebar') {
                e.preventDefault(); commitChar('　');
            } else if (key === '-') {
                e.preventDefault(); commitChar('ー');
            } else if (key === 'Enter') {
                e.preventDefault(); commitChar('\n');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [backspace, typeRaw, onNumKey, commitChar]);

    return {
        text, mode, setMode, romajiBuffer,
        dakutenMode, handakutenMode, smallMode,
        kanjiSuggestions, typeKey, backspace, onNumKey, displayChar,
        autoKanjiMode, setAutoKanjiMode
    };
}