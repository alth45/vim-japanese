// src/components/Terminal.tsx
import React from 'react';
import { useTerminal } from '@/hooks/useTerminal';

interface TerminalProps {
    ws: any;
}

export default function Terminal({ ws }: TerminalProps) {
    // Tangkap 'cwd' dari useTerminal!
    const { history, input, setInput, handleCommand, endOfTerminalRef, cwd } = useTerminal(ws);

    return (
        <div className="w-full h-full p-4 font-mono text-sm overflow-y-auto flex flex-col transition-colors duration-300" style={{ backgroundColor: 'transparent' }}>
            <div className="flex-1">
                {history.map((line, idx) => {
                    let lineStyle: React.CSSProperties = { color: 'var(--text-main)' };
                    if (line.type === 'cmd') lineStyle = { color: 'var(--text-main)', fontWeight: 'bold', marginTop: '8px' };
                    if (line.type === 'error') lineStyle = { color: '#ef4444' };
                    if (line.type === 'success') lineStyle = { color: 'var(--accent)' };

                    return (
                        <div key={idx} className="whitespace-pre-wrap leading-relaxed" style={lineStyle}>
                            {line.text}
                        </div>
                    );
                })}
                <div ref={endOfTerminalRef} />
            </div>

            <div className="flex items-center mt-4">
                {/* TAMPILIN CWD DI SINI BRO! */}
                <span className="font-bold mr-2 text-xs whitespace-nowrap" style={{ color: 'var(--accent)' }}>
                    {cwd} $
                </span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleCommand}
                    className="flex-1 bg-transparent border-none outline-none font-bold"
                    style={{ color: 'var(--text-main)' }}
                    autoFocus
                    spellCheck="false"
                />
            </div>
        </div>
    );
}