// src/components/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import { FileNode } from '@/hooks/useWorkspace';
import { supabase } from '@/lib/supabase';

interface SidebarProps {
    fileNodes: FileNode[];
    setFileNodes: React.Dispatch<React.SetStateAction<FileNode[]>>;
    activeFileId: string | null;
    setActiveFile: (node: FileNode) => void;
    onDeleteFile: (id: string) => void;
    onRenameFile: (id: string, newName: string) => void;
    onOpenSettings: () => void;
}

export default function Sidebar(props: SidebarProps) {
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
    const [isRefreshing, setIsRefreshing] = useState(false);

    // State buat Klik Kanan (Context Menu)
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, node: FileNode | null } | null>(null);
    const [clipboard, setClipboard] = useState<{ type: 'cut' | 'copy', node: FileNode } | null>(null);

    useEffect(() => {
        const handleClickOutside = () => setContextMenu(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleFolder = (id: string) => {
        setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleContextMenu = (e: React.MouseEvent, node: FileNode | null) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, node });
    };

    // const handleRefresh = async () => {
    //     setIsRefreshing(true);
    //     const { data } = await supabase.from('file_system').select('*').order('type', { ascending: false }).order('name', { ascending: true });
    //     if (data) props.setFileNodes(data);
    //     setTimeout(() => setIsRefreshing(false), 500);
    // };
    const handleRefresh = async () => {
        setIsRefreshing(true);
        // TAMBAHIN .is('deleted_at', null) DI SINI BRO!
        const { data } = await supabase.from('file_system').select('*').is('deleted_at', null).order('type', { ascending: false }).order('name', { ascending: true });
        if (data) props.setFileNodes(data);
        setTimeout(() => setIsRefreshing(false), 500);
    };

    // --- UPDATE: BIKIN FILE OTOMATIS GABUNG SAMA NAMA FOLDERNYA ---
    const createNode = async (type: 'file' | 'folder', parentNode: FileNode | null = null) => {
        const defaultName = type === 'file' ? 'new_file.jp' : 'New Folder';
        const displayName = prompt(`Nama ${type} baru:`, defaultName);
        if (!displayName) return;

        // Kalau dibikin di dalem folder, kita tempelin path foldernya di depan
        const name = parentNode ? `${parentNode.name}/${displayName}` : displayName;

        const { data, error } = await supabase
            .from('file_system')
            .insert([{ name, type, content: type === 'file' ? '' : null }])
            .select()
            .single();

        if (data && !error) {
            props.setFileNodes(prev => [...prev, data]);
            if (parentNode) setExpandedFolders(prev => ({ ...prev, [parentNode.id]: true }));
        }
    };

    const actionRename = () => {
        if (!contextMenu?.node) return;

        // Pecah array buat misahin nama folder dan nama file
        const parts = contextMenu.node.name.split('/');
        const oldDisplayName = parts.pop();
        const basePath = parts.length > 0 ? parts.join('/') + '/' : '';

        const newDisplayName = prompt("Rename jadi apa bro?", oldDisplayName);
        if (newDisplayName && newDisplayName !== oldDisplayName) {
            const newFullName = basePath + newDisplayName;
            props.onRenameFile(contextMenu.node.id, newFullName);
        }
    };

    const actionPaste = async () => {
        if (!clipboard || !contextMenu?.node) return;

        // Cari folder target buat naruh file
        const targetFolder = contextMenu.node.type === 'folder'
            ? contextMenu.node
            : props.fileNodes.find(n => n.name === contextMenu.node!.name.split('/').slice(0, -1).join('/'));

        if (clipboard.type === 'cut') {
            const oldParts = clipboard.node.name.split('/');
            const fileName = oldParts[oldParts.length - 1];

            // Nama barunya ngikutin folder target
            const newName = targetFolder ? `${targetFolder.name}/${fileName}` : fileName;

            await supabase.from('file_system').update({ name: newName }).eq('id', clipboard.node.id);
            props.setFileNodes(prev => prev.map(n => n.id === clipboard.node.id ? { ...n, name: newName } : n));
            setClipboard(null);
        }
    };

    // --- SIHIR PARSING: UBAH FLAT STRING JADI VIRTUAL TREE ---
    const buildTree = () => {
        const root: any[] = [];
        const map: any = {};

        // 1. Pecah nama jadi array dan ambil index terakhirnya buat dipajang (displayName)
        props.fileNodes.forEach(node => {
            const parts = node.name.split('/');
            map[node.name] = {
                ...node,
                displayName: parts[parts.length - 1],
                children: []
            };
        });

        // 2. Hubungin anak ke bapaknya sesuai path
        props.fileNodes.forEach(node => {
            const parts = node.name.split('/');
            if (parts.length > 1) {
                const parentPath = parts.slice(0, -1).join('/');
                if (map[parentPath]) {
                    map[parentPath].children.push(map[node.name]);
                } else {
                    root.push(map[node.name]); // Kalau foldernya gak ada, taruh luar
                }
            } else {
                root.push(map[node.name]);
            }
        });

        // 3. Sorting (Folder di atas, File di bawah)
        const sortNodes = (nodes: any[]) => {
            nodes.sort((a, b) => {
                if (a.type === 'folder' && b.type === 'file') return -1;
                if (a.type === 'file' && b.type === 'folder') return 1;
                return a.displayName.localeCompare(b.displayName);
            });
            nodes.forEach(n => sortNodes(n.children));
        };
        sortNodes(root);

        return root;
    };

    const tree = buildTree();

    // --- RECURSIVE RENDER ENGINE ---
    const renderNodes = (nodes: any[], depth = 0) => {
        return nodes.map(node => {
            const isFolder = node.type === 'folder';
            const isOpen = expandedFolders[node.id];
            const isActive = props.activeFileId === node.id;

            return (
                <div key={node.id}>
                    <div
                        onClick={() => isFolder ? toggleFolder(node.id) : props.setActiveFile(node)}
                        onContextMenu={(e) => handleContextMenu(e, node)}
                        className={`group flex items-center justify-between py-1 cursor-pointer transition-colors text-sm whitespace-nowrap overflow-hidden hover:bg-white/10`}
                        style={{
                            paddingLeft: `${depth * 12 + 16}px`, paddingRight: '16px',
                            backgroundColor: isActive && !isFolder ? 'var(--bg-main)' : 'transparent',
                            color: isActive && !isFolder ? 'var(--accent)' : 'var(--text-main)',
                        }}
                    >
                        <div className="flex items-center gap-1.5 truncate">
                            <div className="w-4 flex justify-center items-center">
                                {isFolder ? (
                                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                ) : <span className="w-3.5"></span>}
                            </div>
                            {/* <span className={`${isFolder ? 'text-yellow-400 opacity-80' : node.displayName.endsWith('.jp') ? 'text-green-400' : node.displayName.endsWith('.json') ? 'text-yellow-200' : 'text-blue-400'} text-base drop-shadow-md`}>
                                {isFolder ? (isOpen ? '📂' : '📁') : (node.displayName.endsWith('.jp') ? '📄' : '📝')}
                            </span> */}
                            {/* LOGIKA IKON CERDAS */}
                            <span className={`${isFolder
                                ? (node.displayName === 'publish' ? 'text-purple-400 shadow-purple-500/50' : 'text-yellow-400 opacity-80')
                                : node.displayName.endsWith('.jp') ? 'text-green-400'
                                    : node.displayName.endsWith('.jbook') ? 'text-purple-300' // File hasil compile warnanya ungu!
                                        : node.displayName.endsWith('.json') ? 'text-yellow-200'
                                            : 'text-blue-400'
                                } text-base drop-shadow-md`}>
                                {isFolder
                                    ? (node.displayName === 'publish' ? (isOpen ? '📦' : '📦') : (isOpen ? '📂' : '📁'))
                                    : (node.displayName.endsWith('.jp') ? '📄'
                                        : node.displayName.endsWith('.jbook') ? '📕' // Ikon buku merah buat hasil compile
                                            : '📝')}
                            </span>
                            {/* --- TAMPILIN DISPLAY NAME AJA BIAR BERSIH --- */}
                            <span className={`truncate ${isActive ? 'font-bold' : ''}`}>{node.displayName}</span>
                        </div>
                    </div>

                    {/* Rekursi: Panggil diri sendiri kalau foldernya lagi kebuka */}
                    {isFolder && isOpen && renderNodes(node.children, depth + 1)}
                </div>
            );
        });
    };

    return (
        <div className="flex h-full relative">
            {/* ACTIVITY BAR */}
            <div className="w-12 flex flex-col items-center py-2 justify-between z-20" style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}>
                <div className="flex flex-col gap-4 w-full items-center">
                    <button className="w-full flex justify-center py-2 opacity-100 transition-colors" style={{ borderLeft: '2px solid var(--accent)', color: 'var(--text-main)' }}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                    </button>
                </div>
                <div className="flex flex-col gap-4 w-full items-center mb-2">
                    <button onClick={props.onOpenSettings} className="w-full flex justify-center py-2 opacity-50 hover:opacity-100 transition-opacity" title="Settings" style={{ borderLeft: '2px solid transparent', color: 'var(--text-main)' }}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                    <button
                        onClick={async () => {
                            if (confirm('Yakin mau keluar?')) {
                                await import('@/lib/supabase').then(m => m.supabase.auth.signOut());
                                window.location.reload();
                            }
                        }}
                        className="w-full flex justify-center py-2 opacity-50 hover:opacity-100 hover:text-red-400 transition-all"
                        title="Logout"
                        style={{ borderLeft: '2px solid transparent', color: 'var(--text-main)' }}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                </div>
            </div>

            {/* EXPLORER PANEL */}
            <div className="w-64 flex flex-col hidden md:flex z-10" onContextMenu={(e) => handleContextMenu(e, null)} style={{ backgroundColor: 'var(--bg-panel)', borderRight: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Explorer</span>
                    <div className="flex gap-2" style={{ color: 'var(--text-muted)' }}>
                        <button onClick={() => createNode('file')} className="hover:text-white transition-colors" title="New Root File"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></button>
                        <button onClick={() => createNode('folder')} className="hover:text-white transition-colors" title="New Root Folder"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg></button>
                        <button onClick={handleRefresh} className={`hover:text-white transition-colors ${isRefreshing ? 'animate-spin' : ''}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                    </div>
                </div>

                <div className="px-2 py-1 flex items-center gap-1 cursor-pointer text-sm font-bold hover:bg-white/5 transition-colors" style={{ color: 'var(--text-main)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    JAPANESE-PROJECT
                </div>

                <div className="flex-1 overflow-y-auto mt-1 no-scrollbar pb-20 font-sans tracking-wide">
                    {props.fileNodes.length === 0 ? (
                        <div className="text-center text-xs opacity-50 mt-10">Database Kosong...</div>
                    ) : (
                        renderNodes(tree)
                    )}
                </div>
            </div>

            {/* CONTEXT MENU (Klik Kanan) */}
            {contextMenu && (
                <div className="fixed shadow-2xl py-1 w-48 z-50 rounded text-xs font-sans"
                    style={{ top: contextMenu.y, left: contextMenu.x, backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.node?.type === 'folder' && (
                        <>
                            <button onClick={() => { createNode('file', contextMenu.node!); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center justify-between transition-colors">
                                <span>New File in Folder</span>
                            </button>
                            <button onClick={() => { createNode('folder', contextMenu.node!); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center justify-between transition-colors">
                                <span>New Folder in Folder</span>
                            </button>
                            <div className="my-1" style={{ borderBottom: '1px solid var(--border)' }}></div>
                        </>
                    )}

                    {contextMenu.node && (
                        <>
                            <button onClick={() => { setClipboard({ type: 'cut', node: contextMenu.node! }); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center justify-between transition-colors"><span>Cut</span></button>
                            <button onClick={() => { actionPaste(); setContextMenu(null); }} className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors ${!clipboard || contextMenu.node.type !== 'folder' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`} disabled={!clipboard || contextMenu.node.type !== 'folder'}><span>Paste Here</span></button>

                            <div className="my-1" style={{ borderBottom: '1px solid var(--border)' }}></div>

                            <button onClick={() => { actionRename(); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center justify-between transition-colors"><span>Rename</span></button>
                            <button onClick={() => { props.onDeleteFile(contextMenu.node!.id); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-red-500 hover:text-white flex items-center justify-between transition-colors"><span>Delete</span></button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}