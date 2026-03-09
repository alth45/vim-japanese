// src/lib/voicevox.ts

// speakerId = 3 (Suara Zundamon Normal)
// speakerId = 2 (Suara Shikoku Metan Normal)
// speakerId = 8 (Suara Kasukabe Tsumugi Normal)

export const playVoicevox = async (text: string, speakerId: number = 2) => {
    try {
        // Tembak API ke aplikasi Voicevox yang lagi nyala di PC lu
        const engineUrl = 'http://localhost:50021';

        // 1. Minta Voicevox bikin resep intonasi (Audio Query)
        const queryRes = await fetch(`${engineUrl}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`, {
            method: 'POST'
        });

        if (!queryRes.ok) throw new Error("Voicevox gagal nge-query. Engine nyala gak bro?");
        const queryJson = await queryRes.json();

        // 2. Minta Voicevox nge-render file WAV-nya (Synthesis)
        const synthRes = await fetch(`${engineUrl}/synthesis?speaker=${speakerId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(queryJson)
        });

        if (!synthRes.ok) throw new Error("Voicevox gagal nge-render suara.");

        // 3. Konversi ke bentuk Blob (File Audio) dan Putar!
        const blob = await synthRes.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);

        audio.play();

        // Bersihin memori abis suaranya beres diputar
        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
        };

    } catch (err) {
        console.warn("⚠️ Voicevox mati/error! Pindah ke gigi 2 (Suara Browser)...", err);
        // FALLBACK: Kalau Voicevox mati, pake Web Speech API bawaan browser
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.9; // Biar ngomongnya gak terlalu ngebut
        window.speechSynthesis.speak(utterance);
    }
};