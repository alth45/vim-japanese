// src/app/api/dictionary/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const word = searchParams.get('word');

    if (!word) return NextResponse.json({ error: 'Kata tidak ada' }, { status: 400 });

    try {
        // Nge-hit API Jisho.org
        const res = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`);
        const data = await res.json();

        // Ambil hasil pencarian paling atas (paling akurat)
        if (data.data && data.data.length > 0) {
            const firstResult = data.data[0];
            const reading = firstResult.japanese[0].reading || '';
            // Jisho pakai bahasa Inggris buat artinya
            const meaning = firstResult.senses[0].english_definitions.join(', ');

            return NextResponse.json({ reading, meaning });
        }

        return NextResponse.json({ reading: '', meaning: 'Arti tidak ditemukan' });
    } catch (e) {
        return NextResponse.json({ error: 'Gagal fetch kamus' }, { status: 500 });
    }
}