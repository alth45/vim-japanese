// src/components/CommandPalette.tsx
import React, { useState, useEffect, useRef } from 'react';

export interface CommandItem {
    id: string;
    name: string;
    category: string;
    shortcut?: string;
    action: () => void;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    commands: CommandItem[];
}

export default function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredCommands = commands.filter(cmd =>
        cmd.name.toLowerCase().includes(search.toLowerCase()) ||
        cmd.category.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands.length > 0) {
                filteredCommands[selectedIndex].action();
                onClose();
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <style>{`
                @keyframes fadeInBlur {
                    from { opacity: 0; backdrop-filter: blur(0px); }
                    to { opacity: 1; backdrop-filter: blur(8px); }
                }
                @keyframes slideDownFade {
                    from { opacity: 0; transform: translate(-50%, -20px) scale(0.98); }
                    to { opacity: 1; transform: translate(-50%, 0) scale(1); }
                }
                .animate-overlay {
                    animation: fadeInBlur 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-palette {
                    animation: slideDownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            {/* BACKGROUND OVERLAY */}
            <div
                className="fixed inset-0 z-[100] bg-black/40 animate-overlay"
                onClick={onClose}
            ></div>

            {/* BOX COMMAND PALETTE */}
            <div
                className="fixed top-20 left-1/2 w-[90%] max-w-[600px] rounded-xl shadow-[0_25px_70px_rgba(0,0,0,0.7)] z-[101] flex flex-col font-sans overflow-hidden animate-palette border"
                style={{
                    backgroundColor: 'var(--bg-panel)',
                    borderColor: 'var(--border)',
                    backdropFilter: 'var(--glass-blur) !== "0px" ? "blur(20px)" : "none"'
                }}
            >
                {/* SEARCH INPUT AREA */}
                <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="w-full bg-transparent outline-none px-4 py-2.5 text-sm rounded-lg transition-all border"
                        style={{
                            backgroundColor: 'var(--bg-main)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-main)',
                        }}
                        placeholder="Apa yang ingin Anda lakukan?..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    />
                </div>

                {/* COMMAND LIST */}
                <div className="max-h-[350px] overflow-y-auto py-2 no-scrollbar">
                    {filteredCommands.length === 0 ? (
                        <div className="px-4 py-10 text-xs text-center flex flex-col items-center gap-3" style={{ color: 'var(--text-muted)' }}>
                            <span className="text-3xl opacity-20">🚫</span>
                            Tidak ada perintah yang cocok dengan "{search}"
                        </div>
                    ) : (
                        filteredCommands.map((cmd, idx) => (
                            <div
                                key={cmd.id}
                                onClick={() => {
                                    cmd.action();
                                    onClose();
                                }}
                                onMouseEnter={() => setSelectedIndex(idx)}
                                className={`flex items-center justify-between px-4 py-3 cursor-pointer text-sm transition-all duration-150 mx-2 rounded-lg mb-0.5`}
                                style={{
                                    backgroundColor: selectedIndex === idx ? 'var(--accent)' : 'transparent',
                                    color: selectedIndex === idx ? '#000' : 'var(--text-main)',
                                    fontWeight: selectedIndex === idx ? 'bold' : 'normal',
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="opacity-50 text-[10px] uppercase tracking-tighter" style={{ color: selectedIndex === idx ? '#000' : 'var(--text-muted)' }}>
                                        {cmd.category}
                                    </span>
                                    <span>{cmd.name}</span>
                                </div>
                                {cmd.shortcut && (
                                    <span
                                        className="text-[10px] px-2 py-0.5 rounded font-mono tracking-widest border"
                                        style={{
                                            backgroundColor: selectedIndex === idx ? 'rgba(0,0,0,0.2)' : 'var(--bg-main)',
                                            borderColor: selectedIndex === idx ? 'rgba(0,0,0,0.3)' : 'var(--border)',
                                            color: selectedIndex === idx ? '#000' : 'var(--text-muted)'
                                        }}
                                    >
                                        {cmd.shortcut}
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* FOOTER HINT */}
                <div className="px-4 py-2 border-t flex justify-between items-center" style={{ backgroundColor: 'rgba(0,0,0,0.1)', borderColor: 'var(--border)' }}>
                    <div className="flex gap-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <span><kbd className="border px-1 rounded" style={{ borderColor: 'var(--border)' }}>↑↓</kbd> Navigasi</span>
                        <span><kbd className="border px-1 rounded" style={{ borderColor: 'var(--border)' }}>↵</kbd> Pilih</span>
                        <span><kbd className="border px-1 rounded" style={{ borderColor: 'var(--border)' }}>esc</kbd> Tutup</span>
                    </div>
                    <div className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>
                        {filteredCommands.length} Commands
                    </div>
                </div>
            </div>
        </>
    );
}