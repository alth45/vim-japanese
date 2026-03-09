// src/lib/jlptData.ts

// DATABASE RESMI JLPT KANJI (N5 - N1)
// Disimpan dalam bentuk Set agar pencarian (lookup) super cepat tanpa ngelag!

const N5_KANJI = new Set("一二三四五六七八九十百千万父母友人民先生学休本日月火水木金土何時分半今上下左右中大小春秋秋冬年早山川空田天花草虫犬男女子目耳口手足見音力気円入出立夕文字校村町森正玉王石竹糸貝車雨赤青白食飲言話語読書買行来帰");

const N4_KANJI = new Set("悪安暗医委意育員院飲運泳駅央横屋温化荷界開階寒感漢館岸起期客究急級宮牛去橋業局近銀区計建験元言原戸古午後語工公広交光考行降高号合国黒今才細作算止市矢姉思紙寺自時室社弱首秋週春書少場色食心新親図数西声星晴切雪船線前組走多太体待代台大第題達単短男知地池駐鳥朝通弟店点電冬東答頭同道読内南肉馬売買麦半番病歩部風服物文別勉便歩本妹枚毎末万味明鳴毛門夜野友用曜来理里立留旅両料力林冷歴連老和強勉");

const N3_KANJI = new Set("政議民連対部協党総区領県設保改第結派府査委軍案策団各島革村勢減再税営比防補境導副算視条幹独警局割創健席敗退射娘供路退抜段配険渡局農州波並打昇申老客依秒沈妻娘婚浮泳漫越超靴額飾香鳴麦鼻齢"); // (Data disingkat untuk contoh, lu bisa nambahin full list N3 di sini nanti)

const N2_KANJI = new Set("党協総区領県設保改第結派府査委軍案策団各島革村勢減再税営比防補境導副算視条幹独警局割創健席敗退射停街努危収"); // (Sama, ini potongan N2)

const N1_KANJI = new Set("鬱彙恣意傲慢訃報遜"); // (Potongan N1)

// Fungsi untuk mengekspor data JLPT ke Komponen
export function getJLPTData(word: string) {
    let level = 6; // Anggap 6 itu tidak ada di JLPT (Kanji langka/nama orang)

    for (let char of word) {
        if (N1_KANJI.has(char)) return { level: 'N1', color: '#ef4444' }; // N1: Merah (Bahaya/Susah)
        if (N2_KANJI.has(char)) level = Math.min(level, 2);
        if (N3_KANJI.has(char)) level = Math.min(level, 3);
        if (N4_KANJI.has(char)) level = Math.min(level, 4);
        if (N5_KANJI.has(char)) level = Math.min(level, 5);
    }

    // Tentukan warna berdasarkan level tertinggi yang ditemukan dalam satu kata
    if (level === 2) return { level: 'N2', color: '#f97316' }; // N2: Orange
    if (level === 3) return { level: 'N3', color: '#eab308' }; // N3: Kuning
    if (level === 4) return { level: 'N4', color: '#3b82f6' }; // N4: Biru
    if (level === 5) return { level: 'N5', color: '#22c55e' }; // N5: Hijau

    // Kalau Kanji gak ada di database kita, pakai warna aksen bawaan tema
    return { level: '?', color: 'var(--accent)' };
}