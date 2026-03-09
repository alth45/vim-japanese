// src/components/SettingsTab.tsx
import React, { useState, useEffect } from 'react';
import { THEME_OPTIONS } from '@/lib/themes';
import { THEME_REGISTRY, ThemeId } from '@/lib/themes';
import { supabase } from '@/lib/supabase'; // IMPORT SUPABASE!

export interface EditorSettings {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    theme: ThemeId;
    writingMode: 'horizontal-tb' | 'vertical-rl';
}

interface SettingsTabProps {
    autoKanjiMode: boolean;
    setAutoKanjiMode: (val: boolean) => void;
    editorSettings: EditorSettings;
    setEditorSettings: React.Dispatch<React.SetStateAction<EditorSettings>>;
    onExport: () => void;
    onReset: () => void;
}

export default function SettingsTab({
    autoKanjiMode, setAutoKanjiMode,
    editorSettings, setEditorSettings,
    onExport, onReset
}: SettingsTabProps) {
    const updateSetting = (key: keyof EditorSettings, value: any) => {
        setEditorSettings(prev => ({ ...prev, [key]: value }));
    };

    // --- STATE UNTUK AKUN USER ---
    const [user, setUser] = useState<any>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                // Coba ambil nama dari metadata Google, atau nama custom, atau fallback ke bagian depan email
                const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Hacker';
                setNewName(displayName);
            }
        };
        fetchUser();
    }, []);

    // Fungsi sakti buat ngubah Display Name
    const handleUpdateName = async () => {
        if (!newName.trim() || !user) return;

        const { error } = await supabase.auth.updateUser({
            data: { name: newName } // Simpan di user_metadata.name
        });

        if (error) {
            alert('Gagal update nama: ' + error.message);
        } else {
            setIsEditingName(false);
            // Refresh state user biar UI langsung update
            const { data: { user: updatedUser } } = await supabase.auth.getUser();
            setUser(updatedUser);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 font-sans transition-colors duration-300" style={{ backgroundColor: 'transparent', color: 'var(--text-main)' }}>
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Settings
            </h1>

            <div className="max-w-2xl space-y-8 pb-20">

                {/* --- FITUR BARU: ACCOUNT SETTINGS --- */}
                <section>
                    <h2 className="text-sm font-bold tracking-widest uppercase pb-2 mb-4" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        Account Settings
                    </h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-md border gap-6" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}>

                        <div className="flex items-center gap-4">
                            {/* Avatar / Initial Bulat */}
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-main)' }}>
                                {user?.user_metadata?.name?.[0]?.toUpperCase()
                                    || user?.user_metadata?.full_name?.[0]?.toUpperCase()
                                    || user?.email?.[0]?.toUpperCase()
                                    || 'JP'}
                            </div>

                            {/* Info Email & Nama */}
                            <div className="flex flex-col">
                                {isEditingName ? (
                                    <div className="flex items-center gap-2 mb-1">
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="px-2 py-1 text-sm rounded outline-none w-48 font-bold"
                                            style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--accent)' }}
                                            autoFocus
                                        />
                                        <button onClick={handleUpdateName} className="text-xs px-2 py-1 rounded font-bold" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-main)' }}>Save</button>
                                        <button onClick={() => setIsEditingName(false)} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Cancel</button>
                                    </div>
                                ) : (
                                    <div className="text-lg font-bold flex items-center gap-2">
                                        {user?.user_metadata?.name || user?.user_metadata?.full_name || 'Hacker'}
                                        <button onClick={() => setIsEditingName(true)} className="opacity-50 hover:opacity-100 transition-opacity" title="Edit Nama">
                                            ✏️
                                        </button>
                                    </div>
                                )}
                                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email || 'Loading email...'}</div>
                                <div className="text-xs mt-2 px-2 py-0.5 rounded w-max font-mono bg-green-500/20 text-green-400 border border-green-500/30">
                                    Status: ACTIVE
                                </div>
                            </div>
                        </div>

                        {/* Tombol Logout di Settings Biar Gampang Nyari */}
                        <button
                            onClick={async () => {
                                if (confirm('Yakin mau logout sekarang?')) {
                                    await supabase.auth.signOut();
                                    window.location.reload();
                                }
                            }}
                            className="px-4 py-2 text-sm rounded transition-opacity hover:opacity-80 font-bold border whitespace-nowrap"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                        >
                            Log Out
                        </button>

                    </div>
                </section>

                {/* SECTION: TEXT EDITOR VISUALS */}
                <section>
                    <h2 className="text-sm font-bold tracking-widest uppercase pb-2 mb-4" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        Text Editor (Canvas)
                    </h2>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md border gap-4" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                            <div>
                                <div className="font-bold">Color Theme</div>
                                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Pilih gaya tampilan editor favorit Anda.</div>
                            </div>
                            <select
                                value={editorSettings.theme}
                                onChange={(e) => updateSetting('theme', e.target.value as any)}
                                className="text-sm rounded block p-2 outline-none cursor-pointer w-40"
                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                            >
                                {THEME_OPTIONS.map((theme) => (
                                    <option key={theme.id} value={theme.id}>
                                        {theme.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md border gap-4" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                            <div>
                                <div className="font-bold">Font Family</div>
                                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Gaya tulisan untuk Canvas Editor.</div>
                            </div>
                            <select
                                value={editorSettings.fontFamily}
                                onChange={(e) => updateSetting('fontFamily', e.target.value)}
                                className="text-sm rounded block p-2 outline-none cursor-pointer w-40"
                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                            >
                                <option value="sans-serif">Sans Serif (Modern)</option>
                                <option value="serif">Serif (Buku/Novel)</option>
                                <option value="monospace">Monospace (Coding)</option>
                                <option value="klee-one">Klee One (Tulisan Tangan)</option>
                                <option value="yuji-syuku">Yuji Syuku (Kaligrafi)</option>
                                <option value="dot-gothic">DotGothic (Retro 8-bit)</option>
                            </select>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md border gap-4" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                            <div className="flex-1">
                                <div className="font-bold">Font Size ({editorSettings.fontSize}px)</div>
                                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Atur ukuran huruf agar lebih nyaman dibaca.</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range" min="14" max="48" step="2"
                                    value={editorSettings.fontSize}
                                    onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                                    className="w-32 h-2 rounded-lg appearance-none cursor-pointer"
                                    style={{ backgroundColor: 'var(--bg-main)', accentColor: 'var(--accent)' }}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md border gap-4" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                            <div>
                                <div className="font-bold">Line Height</div>
                                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Jarak spasi antar baris kalimat.</div>
                            </div>
                            <select
                                value={editorSettings.lineHeight}
                                onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                                className="text-sm rounded block p-2 outline-none cursor-pointer w-40"
                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                            >
                                <option value={1.2}>Tight (Rapat)</option>
                                <option value={1.6}>Normal</option>
                                <option value={2.0}>Loose (Renggang)</option>
                                <option value={2.5}>Very Loose</option>
                            </select>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md border gap-4" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                            <div>
                                <div className="font-bold">Writing Mode (Tategaki)</div>
                                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Gaya penulisan vertikal ala Manga dan Novel Jepang.</div>
                            </div>
                            <select
                                value={editorSettings.writingMode || 'horizontal-tb'}
                                onChange={(e) => updateSetting('writingMode', e.target.value)}
                                className="text-sm rounded block p-2 outline-none cursor-pointer w-40"
                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                            >
                                <option value="horizontal-tb">Horizontal (Yoko)</option>
                                <option value="vertical-rl">Vertical (Tate)</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* SECTION: IME BEHAVIOR */}
                <section>
                    <h2 className="text-sm font-bold tracking-widest uppercase pb-2 mb-4" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        Japanese IME Behavior
                    </h2>
                    <div className="flex items-center justify-between p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                        <div>
                            <div className="font-bold">Aggressive Auto-Kanji</div>
                            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Mengubah hiragana menjadi kanji secara otomatis tanpa perlu memilih di suggestion bar.</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={autoKanjiMode} onChange={(e) => setAutoKanjiMode(e.target.checked)} />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ backgroundColor: autoKanjiMode ? 'var(--accent)' : 'gray' }}></div>
                        </label>
                    </div>
                </section>

                {/* SECTION: DATA MANAGEMENT */}
                <section>
                    <h2 className="text-sm font-bold tracking-widest uppercase pb-2 mb-4" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        Data Management
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                            <div>
                                <div className="font-bold">Backup Workspace</div>
                                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Simpan semua file dan isi kamus (vocab) ke komputer Anda (.json).</div>
                            </div>
                            <button onClick={onExport} className="px-4 py-2 text-white text-sm rounded transition-opacity hover:opacity-80 font-bold" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-main)' }}>
                                Export JSON
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-[#4a1c1c] bg-opacity-30 rounded-md border border-[#e05c5c] border-opacity-50">
                            <div>
                                <div className="font-bold text-[#e05c5c]">Danger Zone: Reset System</div>
                                <div className="text-xs text-[#e05c5c] opacity-80 mt-1">Hapus semua file, folder, dan kembalikan ke setelan pabrik.</div>
                            </div>
                            <button onClick={onReset} className="px-4 py-2 bg-[#e05c5c] hover:bg-red-600 text-white text-sm rounded font-bold transition-colors shadow-lg">
                                Reset Workspace
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}