// src/hooks/useWorkspace.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { EditorSettings } from '@/components/SettingsTab';
import { supabase } from '@/lib/supabase';

// Tipe data disamain kayak di Database Supabase
export interface FileNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    parent_id: string | null;
    content: string;
}

export function useWorkspace() {
    // 1. STATE PROPERTIES (Udah di-upgrade ke FileNode)
    const [fileNodes, setFileNodes] = useState<FileNode[]>([]);
    const [openTabs, setOpenTabs] = useState<FileNode[]>([]);
    const [activeFileId, setActiveFileId] = useState<string | null>(null);

    const [bottomTab, setBottomTab] = useState<'keyboard' | 'terminal'>('keyboard');
    // --- TAMBAHIN 2 BARIS INI ---
    const [bottomPanelHeight, setBottomPanelHeight] = useState<number>(300); // Default 300px
    const [isBottomPanelOpen, setIsBottomPanelOpen] = useState<boolean>(true);

    const [isLoaded, setIsLoaded] = useState(false);
    const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [editorSettings, setEditorSettings] = useState<EditorSettings>({
        fontFamily: 'serif',
        fontSize: 24,
        lineHeight: 1.6,
        theme: 'vscode-dark',
        writingMode: 'horizontal-tb'
    });

    // 2. LIFECYCLE METHODS (Fetch dari Supabase & LocalStorage untuk Settings)
    useEffect(() => {
        const fetchFiles = async () => {
            const { data, error } = await supabase
                .from('file_system')
                .select('*')
                .order('type', { ascending: false }) // Folder di atas
                .order('name', { ascending: true })
                .is('deleted_at', null);

            if (!error && data) {
                setFileNodes(data);

                // Coba balikin state tabs terakhir dari LocalStorage
                const savedTabsIds = localStorage.getItem('jp_ide_tabs_ids');
                const savedActiveId = localStorage.getItem('jp_ide_active_id');

                if (savedTabsIds) {
                    const parsedIds: string[] = JSON.parse(savedTabsIds);
                    const restoredTabs = parsedIds.map(id => data.find(f => f.id === id)).filter(Boolean) as FileNode[];
                    setOpenTabs(restoredTabs);
                } else {
                    // Kalau gak ada histori, buka file pertama (kalau ada)
                    const firstFile = data.find(f => f.type === 'file');
                    if (firstFile) {
                        setOpenTabs([firstFile]);
                        setActiveFileId(firstFile.id);
                    }
                }

                if (savedActiveId && data.find(f => f.id === savedActiveId)) {
                    setActiveFileId(savedActiveId);
                }
            } else {
                console.error("Gagal load dari Supabase:", error);
            }
            // Taruh ini sebelum atau sesudah narik data awal
            const cleanUpTrash = async () => {
                const satuHariLalu = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                // Hapus permanen file yang tanggal deleted_at -nya lebih lama dari 24 jam lalu
                await supabase.from('file_system').delete().lt('deleted_at', satuHariLalu);
            };
            cleanUpTrash();
            setIsLoaded(true);
        };

        // Load Settings dari LocalStorage biar tetep nempel di browser user
        const savedEditorSettings = localStorage.getItem('jp_ide_editor_settings');
        if (savedEditorSettings) setEditorSettings(JSON.parse(savedEditorSettings));

        fetchFiles();
    }, []);

    // Save UI State (Tabs, Settings) ke LocalStorage tiap kali berubah
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('jp_ide_tabs_ids', JSON.stringify(openTabs.map(t => t.id)));
            if (activeFileId) localStorage.setItem('jp_ide_active_id', activeFileId);
            else localStorage.removeItem('jp_ide_active_id');
            localStorage.setItem('jp_ide_editor_settings', JSON.stringify(editorSettings));

        }
    }, [openTabs, activeFileId, editorSettings, isLoaded]);

    // Command Palette Listener
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                setIsCmdPaletteOpen(true);
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    // 3. ACTION METHODS (Supabase Integration + Debounce Save)

    const setActiveFileText = useCallback((updater: React.SetStateAction<string>) => {
        if (!activeFileId || activeFileId === 'settings') return;

        setFileNodes(prevNodes => {
            const node = prevNodes.find(n => n.id === activeFileId);
            if (!node) return prevNodes;

            const currentVal = node.content;
            const nextVal = typeof updater === 'function' ? updater(currentVal) : updater;

            // A. Update UI instan
            const newNodes = prevNodes.map(n => n.id === activeFileId ? { ...n, content: nextVal } : n);

            // B. Debounce Auto-Save ke DB (1 detik)
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(async () => {
                const { error } = await supabase
                    .from('file_system')
                    .update({ content: nextVal, updated_at: new Date().toISOString() })
                    .eq('id', activeFileId);
                if (error) console.error("Gagal Auto-Save:", error);
            }, 1000);

            return newNodes;
        });
    }, [activeFileId]);

    // File Management (Contoh hapus, rename butuh nembak DB juga)
    // const handleDeleteFile = async (nodeId: string) => {
    //     // Hapus UI dulu biar cepet
    //     setFileNodes(prev => prev.filter(f => f.id !== nodeId));
    //     setOpenTabs(prev => {
    //         const newTabs = prev.filter(t => t.id !== nodeId);
    //         if (activeFileId === nodeId) setActiveFileId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
    //         return newTabs;
    //     });

    //     // Tembak DB di background
    //     await supabase.from('file_system').delete().eq('id', nodeId);
    // };
    const handleDeleteFile = async (id: string) => {
        // UBAH DARI .delete() JADI .update() BRO!
        const { error } = await supabase
            .from('file_system')
            .update({ deleted_at: new Date().toISOString() }) // Kasih stempel waktu sekarang
            .eq('id', id);

        if (!error) {
            setFileNodes(prev => prev.filter(n => n.id !== id));
            if (activeFileId === id) setActiveFileId(null);
        }
    };

    const handleRenameFile = async (nodeId: string, newName: string) => {
        setFileNodes(prev => prev.map(f => f.id === nodeId ? { ...f, name: newName } : f));
        setOpenTabs(prev => prev.map(t => t.id === nodeId ? { ...t, name: newName } : t));

        await supabase.from('file_system').update({ name: newName }).eq('id', nodeId);
    };

    const handleSidebarClick = (node: FileNode) => {
        if (node.type === 'folder') return; // Nanti folder ada logic toggle di Sidebar komponennya

        if (!openTabs.find(t => t.id === node.id)) setOpenTabs([...openTabs, node]);
        setActiveFileId(node.id);
    };

    const handleCloseTab = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        const newTabs = openTabs.filter(t => t.id !== nodeId);
        setOpenTabs(newTabs);
        if (activeFileId === nodeId) setActiveFileId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
    };

    // Pake ID khusus buat Settings Tab
    const openSettingsTab = () => {
        const settingsNode: FileNode = { id: 'settings', name: '⚙️ Settings', type: 'file', parent_id: null, content: '' };
        if (!openTabs.find(t => t.id === 'settings')) {
            setOpenTabs([...openTabs, settingsNode]);
        }
        setActiveFileId('settings');
    };
    // --- TAMBAHIN FUNGSI INI BRO ---
    const openVocabTab = () => {
        // Kita bikin ID 'vocab' khusus biar nggak bentrok sama file beneran
        const vocabNode: FileNode = { id: 'vocab', name: '🎴 Vocab Bank', type: 'file', parent_id: null, content: '' };
        if (!openTabs.find(t => t.id === 'vocab')) {
            setOpenTabs([...openTabs, vocabNode]);
        }
        setActiveFileId('vocab');
    };


    const handleSaveVocab = useCallback(async (kanji: string, reading: string, meaning: string) => {
        // 1. Cek dulu, jangan sampai vocab-nya dobel di database
        const { data: existing } = await supabase
            .from('vocab_bank')
            .select('id')
            .eq('kanji', kanji)
            .single();

        if (existing) {
            console.log("Vocab udah ada bro!");
            return; // Udah ada, gak usah di-save lagi
        }

        // 2. Kalau belum ada, langsung masukin ke Brankas Vocab!
        const { error } = await supabase
            .from('vocab_bank')
            .insert([{ kanji, reading, meaning }]);

        if (error) {
            console.error("Gagal nyimpen Vocab:", error);
            alert("Gagal nyimpen vocab ke database bro!");
        } else {
            console.log(`✅ [${kanji}] berhasil masuk ke Flashcard Bank!`);
            // Opsional: Bikin toast notification kecil di pojok kanan bawah
        }
    }, []);

    // --- MESIN SNIPPET AUTO-EXPAND ---
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === ' ' || e.key === 'Tab') {
            const el = e.currentTarget;
            const cursor = el.selectionStart;
            const textBefore = el.value.slice(0, cursor);
            const match = textBefore.match(/\/([a-zA-Z0-9_-]+)$/);

            if (match) {
                const trigger = match[1];
                let snippets: Record<string, string> = {};

                try {
                    // Cari isi snippets.json di state
                    const snippetNode = fileNodes.find(n => n.name === 'snippets.json');
                    snippets = JSON.parse(snippetNode?.content || '{}');
                } catch { }

                if (snippets[trigger]) {
                    e.preventDefault();
                    const snippetText = snippets[trigger];
                    const textAfter = el.value.slice(cursor);
                    const newTextBefore = textBefore.slice(0, match.index);
                    const newText = newTextBefore + snippetText + textAfter;

                    setActiveFileText(newText);

                    setTimeout(() => {
                        if (textAreaRef.current) {
                            const newCursorPos = newTextBefore.length + snippetText.length;
                            textAreaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                        }
                    }, 0);
                }
            }
        }
    };

    // helper function untuk dapetin konten file yg aktif
    const getActiveFileContent = () => {
        if (!activeFileId || activeFileId === 'settings') return '';
        const node = fileNodes.find(n => n.id === activeFileId);
        return node ? node.content : '';
    };

    const getActiveFileObject = () => {
        if (!activeFileId || activeFileId === 'settings') return null;
        return fileNodes.find(n => n.id === activeFileId) || null;
    }

    // 4. EXPORT SEMUA PROPERTY DAN METHOD
    return {
        fileNodes, setFileNodes,
        openTabs, setOpenTabs,
        activeFileId, setActiveFileId,
        getActiveFileContent,
        getActiveFileObject,
        bottomTab, setBottomTab,
        isLoaded,
        isCmdPaletteOpen, setIsCmdPaletteOpen,
        editorSettings, setEditorSettings,
        setActiveFileText,
        handleDeleteFile,
        handleRenameFile,
        handleSidebarClick,
        handleCloseTab,
        openSettingsTab,
        handleSaveVocab,
        textAreaRef, handleKeyDown,
        openVocabTab, bottomPanelHeight, setBottomPanelHeight, // <--- TAMBAHIN INI
        isBottomPanelOpen, setIsBottomPanelOpen, // <--- TAMBAHIN INI
    };
}