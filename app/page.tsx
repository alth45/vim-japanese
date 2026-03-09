// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useJapaneseIME } from '@/hooks/useJapaneseIME';
import { supabase } from '@/lib/supabase';
import { THEMES } from '@/lib/themes';
import PublisherModals from '@/components/PublisherModals';

import Sidebar from '@/components/Sidebar';
import CommandPalette, { CommandItem } from '@/components/CommandPalette';
import SettingsTab from '@/components/SettingsTab';
import VocabBank from '@/components/VocabBank';
import Auth from '@/components/Auth';
import EditorArea from '@/components/EditorArea';
import BottomPanel from '@/components/BottomPanel';
import StatusBar from '@/components/StatusBar'; // IMPORT KOMPONEN BARU DI SINI
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const ws = useWorkspace();
  const currentText = ws.getActiveFileContent();
  const activeFileNode = ws.getActiveFileObject();
  const ime = useJapaneseIME(currentText, ws.setActiveFileText);

  const [vimMode, setVimMode] = useState<'NORMAL' | 'INSERT'>('INSERT');
  const [isBookMode, setIsBookMode] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const isJsonFile = activeFileNode?.name.endsWith('.json');
  const isVertical = ws.editorSettings.writingMode === 'vertical-rl';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isJsonFile && ime.autoKanjiMode) ime.setAutoKanjiMode(false);
  }, [isJsonFile, ime]);

  useEffect(() => {
    const handleVimToggle = (e: KeyboardEvent) => {
      // Abaikan kalau lagi ngetik di input/textarea lain, kecuali pencet Escape
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement && e.key !== 'Escape') return;

      if (e.key === 'Escape') {
        setVimMode('NORMAL');
      }
      // FITUR BARU: Masuk INSERT mode pakai Ctrl + Q
      else if (vimMode === 'NORMAL' && e.ctrlKey && e.key.toLowerCase() === 'q') {
        e.preventDefault(); // Berdoa biar browser gak nutup tab lu 😂
        setVimMode('INSERT');
      }
    };
    window.addEventListener('keydown', handleVimToggle);
    return () => window.removeEventListener('keydown', handleVimToggle);
  }, [vimMode]);

  const myCommands: CommandItem[] = [
    { id: 'open-settings', category: 'Preferences', name: 'Buka Settings Editor', shortcut: 'Ctrl+,', action: ws.openSettingsTab },
    { id: 'open-vocab', category: 'Preferences', name: 'Buka Vocab Bank / Flashcard', action: ws.openVocabTab },
    { id: 'toggle-tategaki', category: 'View', name: `Ganti Mode Nulis`, action: () => ws.setEditorSettings(prev => ({ ...prev, writingMode: isVertical ? 'horizontal-tb' : 'vertical-rl' })) },
    { id: 'toggle-book', category: 'View', name: `Ganti Mode Buku (Split 2 Halaman)`, shortcut: 'Ctrl+B', action: () => setIsBookMode(!isBookMode) },
    { id: 'toggle-panel', category: 'View', name: `Toggle Bottom Panel`, shortcut: 'Ctrl+`', action: () => ws.setIsBottomPanelOpen(!ws.isBottomPanelOpen) },
    { id: 'toggle-kanji', category: 'Japanese IME', name: `Toggle Auto Kanji`, action: () => ime.setAutoKanjiMode(!ime.autoKanjiMode) },
  ];

  // if (isAuthChecking) return <div className="flex h-screen items-center justify-center font-mono bg-black text-white">Authenticating...</div>;
  // if (!session) return <Auth />;
  // if (!ws.isLoaded) return <div className="flex h-screen items-center justify-center font-mono" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--accent)' }}>Sinkronisasi Database...</div>;

  if (isAuthChecking) return <div className="flex h-screen items-center justify-center font-mono bg-black text-white">Authenticating...</div>;

  // --- LOGIKA LANDING PAGE & LOGIN ---
  if (!session) {
    // Kalau user udah klik "Login", tampilkan Form Auth bawaan lu
    if (showAuth) {
      return (
        <div className="relative h-screen bg-black">
          {/* Tombol Back biar user bisa balik ke Landing Page */}
          <button
            onClick={() => setShowAuth(false)}
            className="absolute top-6 left-6 z-50 text-white hover:text-purple-400 font-mono text-sm"
          >
            ← Kembali ke Home
          </button>
          <Auth />
        </div>
      );
    }
    // Kalau belum klik apa-apa, tampilkan Landing Page keren!
    return <LandingPage onLoginClick={() => setShowAuth(true)} />;
  }

  if (!ws.isLoaded) return <div className="flex h-screen items-center justify-center font-mono" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--accent)' }}>Sinkronisasi Database...</div>;
  const getFontFamily = (fontType: string) => {
    switch (fontType) {
      case 'klee-one': return '"Klee One", cursive';
      case 'yuji-syuku': return '"Yuji Syuku", serif';
      case 'dot-gothic': return '"DotGothic16", sans-serif';
      case 'sans-serif': return '"Noto Sans JP", ui-sans-serif, system-ui, sans-serif';
      case 'monospace': return '"Share Tech Mono", ui-monospace, monospace';
      case 'serif': default: return '"Noto Serif JP", ui-serif, Georgia, serif';
    }
  };

  const dynamicEditorStyle: React.CSSProperties = {
    fontFamily: getFontFamily(ws.editorSettings.fontFamily),
    fontSize: `${ws.editorSettings.fontSize}px`,
    lineHeight: ws.editorSettings.lineHeight,
    writingMode: ws.editorSettings.writingMode || 'horizontal-tb',
  };

  let activeThemeVariables = { ...(THEMES[ws.editorSettings.theme] || THEMES['vscode-dark']) };
  if (ws.editorSettings.theme === 'custom-json') {
    try {
      const themeNode = ws.fileNodes.find(n => n.name === 'theme.json');
      if (themeNode && themeNode.content) {
        activeThemeVariables = { ...activeThemeVariables, ...JSON.parse(themeNode.content).colors, ...JSON.parse(themeNode.content).images };
      }
    } catch (err) { activeThemeVariables = THEMES['vscode-dark']; }
  }

  return (
    <div className="flex h-screen font-mono overflow-hidden transition-colors duration-300 relative" style={{ ...activeThemeVariables, backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {ws.editorSettings.theme === 'glass-cyan' && <div className="absolute inset-0 z-[-1] bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]"></div>}

      <CommandPalette isOpen={ws.isCmdPaletteOpen} onClose={() => ws.setIsCmdPaletteOpen(false)} commands={myCommands} />

      <Sidebar fileNodes={ws.fileNodes} setFileNodes={ws.setFileNodes} activeFileId={ws.activeFileId} setActiveFile={ws.handleSidebarClick} onDeleteFile={ws.handleDeleteFile} onRenameFile={ws.handleRenameFile} onOpenSettings={ws.openSettingsTab} />

      <div className="flex-1 flex flex-col relative overflow-hidden transition-all duration-300" style={{ backdropFilter: 'blur(var(--glass-blur))', backgroundColor: ws.editorSettings.theme === 'glass-cyan' ? 'transparent' : 'var(--bg-main)' }}>

        {/* TABS HEADER */}
        <div className="h-10 flex items-end overflow-x-auto no-scrollbar shrink-0" style={{ backgroundColor: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}>
          {ws.openTabs.map((tab) => (
            <div key={tab.id} onClick={() => ws.setActiveFileId(tab.id)} className="group flex items-center gap-2 px-3 py-2 cursor-pointer min-w-[120px] max-w-[200px] select-none"
              style={{
                backgroundColor: ws.activeFileId === tab.id ? (ws.editorSettings.theme === 'glass-cyan' ? 'rgba(0,0,0,0.3)' : 'var(--bg-main)') : 'transparent',
                color: ws.activeFileId === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                borderTop: ws.activeFileId === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                borderRight: '1px solid var(--border)',
                borderBottom: ws.activeFileId === tab.id ? '2px solid transparent' : '2px solid var(--border)'
              }}>
              <span className="truncate text-xs flex-1">{tab.name}</span>
              <button onClick={(e) => ws.handleCloseTab(e, tab.id)} className="p-0.5 rounded-md hover:text-white" style={{ color: ws.activeFileId === tab.id ? 'var(--text-muted)' : 'transparent' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>

        {/* KONTEN UTAMA */}
        {!ws.activeFileId ? (
          <div className="flex-1 flex flex-col items-center justify-center select-none shadow-inner" style={{ backgroundColor: ws.editorSettings.theme === 'glass-cyan' ? 'transparent' : 'var(--bg-main)' }}>
            <div className="text-[120px] opacity-10 mb-4 font-serif">🎌</div>
            <h1 className="text-3xl font-bold tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>JAPAN LEARNER</h1>
          </div>
        ) : ws.activeFileId === 'settings' ? (
          <SettingsTab autoKanjiMode={ime.autoKanjiMode} setAutoKanjiMode={ime.setAutoKanjiMode} editorSettings={ws.editorSettings} setEditorSettings={ws.setEditorSettings} onExport={() => { }} onReset={() => { }} />
        ) : ws.activeFileId === 'vocab' ? (
          <VocabBank />
        ) : (
          <EditorArea ws={ws} ime={ime} currentText={currentText} isJsonFile={isJsonFile} isVertical={isVertical} vimMode={vimMode} isBookMode={isBookMode} dynamicEditorStyle={dynamicEditorStyle} />
        )}

        {/* PANEL BAWAH */}
        <BottomPanel ws={ws} activeFileNode={activeFileNode} ime={ime} />

        {/* STATUS BAR VSCODE VIBES NANGKRING DI BAWAH SINI! */}
        <StatusBar text={currentText || ''} vimMode={vimMode} theme={ws.editorSettings.theme} isJsonFile={!!isJsonFile} />

        <PublisherModals ws={ws} />

      </div>
    </div>
  );
}