// src/app/api/kanji/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');

    if (!text) {
        return NextResponse.json([]);
    }

    try {
        const response = await fetch(`https://www.google.com/transliterate?langpair=ja-Hira|ja&text=${encodeURIComponent(text)}`);
        const data = await response.json();

        // Kalau data bukan array (error dari Google), balikin kosong
        if (!Array.isArray(data)) return NextResponse.json([]);

        // --- MESIN PENGGABUNG KALIMAT (CARTESIAN PRODUCT) ---
        // Menggabungkan: [ ["は", ["は", "葉"]], ["わたし", ["私", "渡し"]] ]
        // Menjadi: ["は私", "は渡し", "葉私", "葉渡し"]

        let combinedSuggestions: string[] = [""];

        for (const chunk of data) {
            // chunk[1] adalah array berisi pilihan kanji dari Google
            const options: string[] = chunk[1] || [];
            const newCombinations: string[] = [];

            for (const existing of combinedSuggestions) {
                for (const option of options) {
                    newCombinations.push(existing + option);
                    // Kita batasi 15 kombinasi biar memori nggak jebol pas kalimatnya panjang
                    if (newCombinations.length >= 15) break;
                }
                if (newCombinations.length >= 15) break;
            }
            combinedSuggestions = newCombinations;
        }

        // Kita bungkus ulang pakai format ala Google biar Frontend lu nggak perlu diubah!
        // Frontend lu akan tetap baca array index ke-0 dengan aman.
        const forgedGoogleFormat = [
            [text, combinedSuggestions]
        ];

        return NextResponse.json(forgedGoogleFormat);
    } catch (error) {
        return NextResponse.json({ error: 'Gagal fetch kamus' }, { status: 500 });
    }
}