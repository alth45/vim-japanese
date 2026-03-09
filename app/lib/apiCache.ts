// src/lib/apiCache.ts

const cache = new Map<string, { data: any; expiry: number }>();

const CACHE_DURATION = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 500;

export async function fetchWithCache(url: string) {
    const now = Date.now();

    if (cache.has(url)) {
        const cachedItem = cache.get(url)!;
        if (now < cachedItem.expiry) {
            console.log('⚡ [CACHE HIT]', url);
            // MAGIC FIX: Kita balikin 'Copy/Kloningan' dari datanya, bukan data aslinya.
            // Biar kalau frontend ngehapus isi array-nya, data di Cache tetap aman!
            return JSON.parse(JSON.stringify(cachedItem.data));
        } else {
            cache.delete(url);
        }
    }

    // console.log('🌐 [FETCHING API]', url);
    const res = await fetch(url);
    const data = await res.json();

    if (cache.size >= MAX_CACHE_SIZE) {
        const keysToDelete = Array.from(cache.keys()).slice(0, 50);
        keysToDelete.forEach(k => cache.delete(k));
    }

    cache.set(url, { data, expiry: now + CACHE_DURATION });

    // Jangan lupa balikin kloningannya juga di sini
    return JSON.parse(JSON.stringify(data));
}