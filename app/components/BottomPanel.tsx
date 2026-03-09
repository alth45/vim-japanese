// src/components/BottomPanel.tsx
import React, { useRef } from 'react';
import Terminal from '@/components/Terminal';
import VirtualKeyboard from '@/components/VirtualKeyboard';

export default function BottomPanel({ ws, activeFileNode, ime }: any) {
    const isDraggingRef = useRef(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isDraggingRef.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'ns-resize';
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight >= 100 && newHeight <= window.innerHeight * 0.8) {
            ws.setBottomPanelHeight(newHeight);
        }
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
    };

    if (!ws.isBottomPanelOpen) return null;

    return (
        <>
            <div onMouseDown={handleMouseDown} className="h-1.5 w-full cursor-ns-resize z-30 transition-colors hover:bg-blue-400/50" style={{ backgroundColor: 'var(--border)' }} />

            <div className="flex flex-col shadow-2xl z-20 transition-all duration-75" style={{ height: `${ws.bottomPanelHeight}px`, backgroundColor: 'var(--bg-main)' }}>
                <div className="flex text-[11px] font-bold tracking-widest justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="flex">
                        <button onClick={() => ws.setBottomTab('keyboard')} className="px-4 py-2 transition-colors" style={{ backgroundColor: ws.bottomTab === 'keyboard' ? 'var(--bg-sidebar)' : 'transparent', borderTop: ws.bottomTab === 'keyboard' ? '2px solid var(--accent)' : '2px solid transparent', color: ws.bottomTab === 'keyboard' ? 'var(--text-main)' : 'var(--text-muted)' }}>VIRTUAL KEYBOARD</button>
                        <button onClick={() => ws.setBottomTab('terminal')} className="px-4 py-2 transition-colors" style={{ backgroundColor: ws.bottomTab === 'terminal' ? 'var(--bg-sidebar)' : 'transparent', borderTop: ws.bottomTab === 'terminal' ? '2px solid var(--accent)' : '2px solid transparent', color: ws.bottomTab === 'terminal' ? 'var(--text-main)' : 'var(--text-muted)' }}>TERMINAL</button>
                    </div>
                    <button onClick={() => ws.setIsBottomPanelOpen(false)} className="px-4 py-2 hover:bg-red-500/20 hover:text-red-400 transition-colors" style={{ color: 'var(--text-muted)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-hidden relative" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
                    <div className="absolute bottom-0 right-4 w-48 h-56 pointer-events-none bg-contain bg-no-repeat bg-bottom transition-all duration-700 drop-shadow-2xl" style={{ backgroundImage: 'var(--mascot-img)', opacity: 0.85, zIndex: 20 }}></div>

                    {ws.bottomTab === 'terminal' ? (
                        /* INI KUNCI FIX-NYA BRO: Cuma ngirim ws doang sekarang! */
                        <Terminal ws={ws} />
                    ) : (
                        <VirtualKeyboard activeFile={activeFileNode?.name || null} mode={ime.mode} setMode={ime.setMode} romajiBuffer={ime.romajiBuffer} smallMode={ime.smallMode} kanjiSuggestions={ime.kanjiSuggestions} typeKey={ime.typeKey} backspace={ime.backspace} onNumKey={ime.onNumKey} displayChar={ime.displayChar} autoKanjiMode={ime.autoKanjiMode} setAutoKanjiMode={ime.setAutoKanjiMode} />
                    )}

                </div>
            </div>
        </>
    );
}