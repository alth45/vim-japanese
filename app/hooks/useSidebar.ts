// src/hooks/useSidebar.ts
import { useState, useEffect } from 'react';

// Interface buat nerima fungsi-fungsi dari page.tsx
interface UseSidebarProps {
    files: string[];
    setFiles: React.Dispatch<React.SetStateAction<string[]>>;
    activeFile: string;
    setActiveFile: (fileName: string) => void;
    onDeleteFile: (fileName: string) => void;
    onRenameFile: (oldName: string, newName: string) => void;
}

export function useSidebar({ files, setFiles, activeFile, setActiveFile, onDeleteFile, onRenameFile }: UseSidebarProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [openFolders, setOpenFolders] = useState<string[]>([]);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, file: string } | null>(null);
    const [clipboard, setClipboard] = useState<{ type: 'copy' | 'cut', file: string } | null>(null);

    // Efek buat nutup context menu kalau ngeklik di luar
    useEffect(() => {
        const handleClickOutside = () => setContextMenu(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleNewFile = () => {
        const fileName = prompt('Nama file baru (contoh: test.jp):', 'untitled.jp');
        if (fileName && !files.includes(fileName.trim())) {
            setFiles([...files, fileName.trim()]);
            setActiveFile(fileName.trim());
        }
    };

    const handleNewFolder = () => {
        const folderName = prompt('Nama folder baru:');
        if (folderName) {
            const formattedName = folderName.trim().endsWith('/') ? folderName.trim() : `${folderName.trim()}/`;
            if (!files.includes(formattedName)) {
                setFiles([...files, formattedName]);
                setOpenFolders([...openFolders, formattedName]);
            }
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 700);
    };

    const toggleFolder = (folderName: string) => {
        setOpenFolders(prev => prev.includes(folderName) ? prev.filter(f => f !== folderName) : [...prev, folderName]);
    };

    const handleContextMenu = (e: React.MouseEvent, file: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, file });
    };

    const actionDelete = () => {
        if (!contextMenu) return;
        const target = contextMenu.file;
        if (confirm(`Yakin mau hapus ${target}?`)) onDeleteFile(target);
    };

    const actionRename = () => {
        if (!contextMenu) return;
        const target = contextMenu.file;
        const isFolder = target.endsWith('/');
        const newName = prompt(`Rename ${isFolder ? 'folder' : 'file'}:`, target);

        if (newName && newName !== target) {
            const formatted = isFolder && !newName.endsWith('/') ? `${newName}/` : newName;
            if (!files.includes(formatted)) onRenameFile(target, formatted);
            else alert('Nama sudah dipakai bro!');
        }
    };

    const actionCopy = () => { if (contextMenu) setClipboard({ type: 'copy', file: contextMenu.file }); };
    const actionCut = () => { if (contextMenu) setClipboard({ type: 'cut', file: contextMenu.file }); };
    const actionPaste = () => {
        if (!clipboard || !contextMenu) return;
        const targetFolder = contextMenu.file.endsWith('/') ? contextMenu.file : '';
        const baseName = clipboard.file.replace(/\/$/, '');
        const newName = targetFolder + "copy_of_" + baseName + (clipboard.file.endsWith('/') ? '/' : '');

        if (!files.includes(newName)) {
            setFiles([...files, newName]);
            if (clipboard.type === 'cut') { onDeleteFile(clipboard.file); setClipboard(null); }
        } else { alert('Nama file udah ada bro, rename dulu manual!'); }
    };

    const actionNewFileInFolder = () => {
        if (!contextMenu || !contextMenu.file.endsWith('/')) return;
        const folder = contextMenu.file;
        const fileName = prompt(`File baru di dalam ${folder}:`, 'untitled.jp');
        if (fileName) {
            const fullPath = `${folder}${fileName}`;
            if (!files.includes(fullPath)) {
                setFiles([...files, fullPath]);
                setActiveFile(fullPath);
                if (!openFolders.includes(folder)) setOpenFolders([...openFolders, folder]);
            }
        }
    };

    // --- LOGIC SORTING ALGORITMA VSCODE ---
    const sortedFiles = [...files].sort((a, b) => {
        const aParts = a.split('/').filter(Boolean);
        const bParts = b.split('/').filter(Boolean);
        const minLen = Math.min(aParts.length, bParts.length);

        for (let i = 0; i < minLen; i++) {
            if (aParts[i] !== bParts[i]) {
                const aIsFolder = (i < aParts.length - 1) || a.endsWith('/');
                const bIsFolder = (i < bParts.length - 1) || b.endsWith('/');
                if (aIsFolder && !bIsFolder) return -1;
                if (!aIsFolder && bIsFolder) return 1;
                return aParts[i].localeCompare(bParts[i]);
            }
        }
        return aParts.length - bParts.length;
    });

    return {
        isRefreshing, openFolders, contextMenu, clipboard,
        handleNewFile, handleNewFolder, handleRefresh, toggleFolder, handleContextMenu,
        actionDelete, actionRename, actionCopy, actionCut, actionPaste, actionNewFileInFolder,
        setContextMenu, sortedFiles
    };
}