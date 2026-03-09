// src/hooks/useHoverableText.ts
import { useState, useRef, useEffect, useMemo } from 'react';
import { fetchWithCache } from '@/lib/apiCache';

export interface TooltipData {
    visible: boolean;
    x: number;
    y: number;
    loading: boolean;
    word: string;
    reading: string;
    meaning: string;
    saved: boolean;
    jlpt: { level: string, color: string };
}

export function useHoverableText(text: string, onSaveVocab: (kanji: string, reading: string, meaning: string) => void) {
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);
    const hideTimeout = useRef<NodeJS.Timeout | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleMouseEnter = (e: React.MouseEvent, word: string, jlptData: { level: string, color: string }) => {
        if (hideTimeout.current) clearTimeout(hideTimeout.current);

        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        setTooltip({
            visible: true,
            x: rect.left + (rect.width / 2),
            y: rect.top - 8,
            loading: true,
            word,
            reading: '',
            meaning: '',
            saved: false,
            jlpt: jlptData
        });

        fetchWithCache(`/api/dictionary?word=${word}`)
            .then(data => {
                setTooltip(prev => prev ? { ...prev, loading: false, reading: data.reading, meaning: data.meaning } : null);
            })
            .catch((err) => {
                console.error("Kamus Error:", err);
                setTooltip(null);
            });
    };

    const handleMouseLeave = () => {
        hideTimeout.current = setTimeout(() => {
            setTooltip(null);
        }, 300);
    };

    const handleSaveClick = () => {
        if (tooltip && !tooltip.loading) {
            onSaveVocab(tooltip.word, tooltip.reading, tooltip.meaning);
            setTooltip(prev => prev ? { ...prev, saved: true } : null);
        }
    };

    // TAMBAHAN BARU: Fungsi khusus buat nahan tooltip pas mouse masuk ke kotaknya
    const cancelHide = () => {
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };

    // --- MESIN PARSER (Dioptimasi dengan useMemo) ---
    // Cuma jalan ulang kalau isi 'text' berubah, ngurangin lag parah!
    const tokens = useMemo(() => {
        const result: { type: 'furigana' | 'kanji' | 'text', text?: string, kanji?: string, furigana?: string }[] = [];
        const furiganaParts = text.split(/(\[[^|\]]+\|[^\]]+\])/g);

        furiganaParts.forEach(part => {
            const match = part.match(/\[([^|\]]+)\|([^\]]+)\]/);
            if (match) {
                result.push({ type: 'furigana', kanji: match[1], furigana: match[2] });
            } else {
                const kanjiParts = part.split(/([\u4e00-\u9faf]+)/g);
                kanjiParts.forEach(kPart => {
                    if (/[\u4e00-\u9faf]+/.test(kPart)) {
                        result.push({ type: 'kanji', text: kPart });
                    } else if (kPart) {
                        result.push({ type: 'text', text: kPart });
                    }
                });
            }
        });
        return result;
    }, [text]);

    return {
        mounted,
        tooltip,
        tokens,
        handleMouseEnter,
        handleMouseLeave,
        handleSaveClick,
        cancelHide
    };
}