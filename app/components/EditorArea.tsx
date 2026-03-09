// src/components/EditorArea.tsx
import React, { useRef } from 'react';
import HoverableText from '@/components/HoverableText';

export default function EditorArea({
    ws, ime, currentText, isJsonFile, isVertical,
    vimMode, isBookMode, dynamicEditorStyle
}: any) {
    const bookRef = useRef<HTMLDivElement>(null);

    // Navigasi Halaman Buku
    const turnPageNext = () => {
        if (bookRef.current) bookRef.current.scrollBy({ left: -bookRef.current.clientWidth, behavior: 'smooth' });
    };
    const turnPagePrev = () => {
        if (bookRef.current) bookRef.current.scrollBy({ left: bookRef.current.clientWidth, behavior: 'smooth' });
    };

    return (
        <div className="flex-1 p-8 relative flex flex-col min-h-0 overflow-hidden" style={{ backgroundColor: ws.editorSettings.theme === 'glass-cyan' ? 'transparent' : 'var(--bg-main)' }}>
            <div className="absolute inset-0 pointer-events-none bg-cover bg-center bg-no-repeat transition-opacity duration-1000" style={{ backgroundImage: 'var(--canvas-bg)', opacity: 'var(--canvas-opacity)', zIndex: 1 }}></div>

            <div className={`text-xs select-none absolute top-4 left-4 z-20 font-bold transition-colors`} style={{ color: vimMode === 'INSERT' ? 'var(--accent)' : 'var(--text-muted)' }}>
                {`// Vim-Mode: ${vimMode} -- ${isJsonFile ? 'JSON DEVELOPER' : `Japanese IME (${ime.mode.toUpperCase()})`}`}
                {vimMode === 'NORMAL' && <span className="ml-2 opacity-70 animate-pulse text-yellow-400">(Tekan 'Ctrl + Q' untuk Mulai Ngetik / Paste)</span>}
                {vimMode === 'INSERT' && <span className="ml-2 opacity-70">(Tekan 'ESC' untuk Liat Kamus & JLPT)</span>}
            </div>

            <div className={`relative z-10 w-full flex-1 min-h-0 ${isVertical ? 'mt-10' : 'mt-8'}`}>
                <div className="absolute inset-0">
                    {vimMode === 'NORMAL' && !isJsonFile ? (
                        <div className="relative w-full h-full group">
                            {isBookMode && isVertical ? (
                                <div ref={bookRef} className="w-full h-full overflow-hidden no-scrollbar transition-all duration-500" style={{ writingMode: 'horizontal-tb', direction: 'rtl', columnCount: 2, columnGap: '4rem', columnRule: '1px solid var(--border)' }}>
                                    <div className="h-full outline-none whitespace-pre-wrap break-all" style={{ ...dynamicEditorStyle, writingMode: 'vertical-rl', direction: 'ltr', color: 'var(--text-main)' }}>
                                        {currentText ? <HoverableText text={currentText} onSaveVocab={ws.handleSaveVocab} /> : <span style={{ color: 'var(--text-muted)' }}>kosong... tekan 'i' untuk ngetik.</span>}
                                    </div>
                                </div>
                            ) : (
                                <div ref={bookRef} className="w-full h-full outline-none whitespace-pre-wrap break-all overflow-auto no-scrollbar transition-all duration-500" style={{ ...dynamicEditorStyle, color: 'var(--text-main)' }}>
                                    {currentText ? <HoverableText text={currentText} onSaveVocab={ws.handleSaveVocab} /> : <span style={{ color: 'var(--text-muted)' }}>kosong... tekan 'i' untuk ngetik.</span>}
                                </div>
                            )}

                            {isBookMode && isVertical && (
                                <>
                                    <button onClick={turnPageNext} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-12 h-32 bg-black/40 hover:bg-black/80 text-white flex flex-col items-center justify-center rounded-l-2xl border border-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-30 shadow-2xl">
                                        <span>◀</span><span className="text-[10px] mt-2" style={{ writingMode: 'vertical-rl' }}>SELANJUTNYA</span>
                                    </button>
                                    <button onClick={turnPagePrev} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-12 h-32 bg-black/40 hover:bg-black/80 text-white flex flex-col items-center justify-center rounded-r-2xl border border-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-30 shadow-2xl">
                                        <span>▶</span><span className="text-[10px] mt-2" style={{ writingMode: 'vertical-rl' }}>SEBELUMNYA</span>
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <textarea ref={ws.textAreaRef} onKeyDown={ws.handleKeyDown} autoFocus className="w-full h-full bg-transparent resize-none outline-none overflow-auto no-scrollbar" style={{ ...dynamicEditorStyle, color: 'var(--text-main)', caretColor: 'var(--accent)' }} value={currentText} onChange={(e) => ws.setActiveFileText(e.target.value)} spellCheck={false} />
                    )}
                </div>
            </div>

            {!isJsonFile && vimMode === 'INSERT' && (
                <div className="absolute bottom-4 right-6 text-sm font-bold opacity-80 z-10" style={{ color: 'var(--accent)' }}>Buffer: [ {ime.romajiBuffer || '_'} ]</div>
            )}

            {!ws.isBottomPanelOpen && (
                <button onClick={() => ws.setIsBottomPanelOpen(true)} className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] tracking-widest font-bold border rounded-full bg-black/50 backdrop-blur-md hover:bg-white/10 transition-all z-20" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    ▲ TAMPILKAN PANEL
                </button>
            )}
        </div>
    );
}