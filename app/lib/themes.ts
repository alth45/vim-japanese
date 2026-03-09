// src/lib/themes.ts
import React from "react";

// 1. SINGLE SOURCE OF TRUTH
export const THEME_REGISTRY = {
    'custom-json': {
        name: '⚙️ Custom (Edit theme.json)',
        styles: {} // Kosongin aja, nanti kita injek langsung dari file JSON!
    },
    'vscode-dark': {
        name: 'VSCode Classic',
        styles: {
            '--bg-main': '#1e1e1e', '--bg-panel': '#252526', '--bg-sidebar': '#333333',
            '--border': '#3c3c3c', '--text-main': '#d4d4d4', '--text-muted': '#858585',
            '--accent': '#22c55e', '--glass-blur': '0px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'dracula': {
        name: 'Dracula (VIMers)',
        styles: {
            '--bg-main': '#282a36', '--bg-panel': '#44475a', '--bg-sidebar': '#21222c',
            '--border': '#6272a4', '--text-main': '#f8f8f2', '--text-muted': '#6272a4',
            '--accent': '#ff79c6', '--glass-blur': '0px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'glass-cyan': {
        name: 'Glassmorphism Cyan',
        styles: {
            '--bg-main': 'rgba(10, 15, 25, 0.4)', '--bg-panel': 'rgba(20, 25, 40, 0.5)', '--bg-sidebar': 'rgba(5, 10, 15, 0.6)',
            '--border': 'rgba(0, 240, 255, 0.2)', '--text-main': '#e0ffff', '--text-muted': '#60a0a0',
            '--accent': '#00f0ff', '--glass-blur': '12px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'itachi-akatsuki': {
        name: 'Itachi Akatsuki',
        styles: {
            '--bg-main': 'rgba(20, 10, 15, 0.4)', '--bg-panel': 'rgba(40, 15, 20, 0.5)', '--bg-sidebar': 'rgba(15, 5, 8, 0.6)',
            '--border': 'rgba(180, 0, 0, 0.3)', '--text-main': '#ffcccc', '--text-muted': '#a55a5a',
            '--accent': '#ff3333', '--glass-blur': '12px',
            // Pakai server Giphy (Anti 404)
            '--canvas-bg': 'url("https://media.giphy.com/media/1n7DPJsqQG2K4/giphy.gif")', // Mata Mangekyou
            '--canvas-opacity': '0.15',
            '--mascot-img': 'url("https://media.giphy.com/media/J1QcNGubdXEw8/giphy.gif")' // Itachi Gagak
        } as React.CSSProperties
    },
    'gojo-infinite': {
        name: 'Gojo Infinite Void',
        styles: {
            '--bg-main': 'rgba(25, 30, 45, 0.4)', '--bg-panel': 'rgba(35, 45, 65, 0.5)', '--bg-sidebar': 'rgba(15, 20, 35, 0.6)',
            '--border': 'rgba(160, 220, 255, 0.3)', '--text-main': '#ffffff', '--text-muted': '#aac0d0',
            '--accent': '#6aa9ff', '--glass-blur': '12px',
            '--canvas-bg': 'url("https://media.tenor.com/images/3a79d50116ddbd3cc2d1eeb2b3af5da3/tenor.gif")',
            '--canvas-opacity': '0.08',
            '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'levi-surveycorps': {
        name: 'Levi Survey Corps',
        styles: {
            '--bg-main': 'rgba(30, 35, 35, 0.45)', '--bg-panel': 'rgba(45, 50, 50, 0.55)', '--bg-sidebar': 'rgba(20, 25, 25, 0.65)',
            '--border': 'rgba(210, 180, 140, 0.25)', '--text-main': '#e5e5e5', '--text-muted': '#8a9a9a',
            '--accent': '#d4af37', '--glass-blur': '10px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'theme-deathnote': {
        name: 'Death Note',
        styles: {
            '--bg-main': 'rgba(10, 10, 10, 0.5)', '--bg-panel': 'rgba(20, 20, 20, 0.6)', '--bg-sidebar': 'rgba(5, 5, 5, 0.7)',
            '--border': 'rgba(255, 255, 255, 0.15)', '--text-main': '#f0f0f0', '--text-muted': '#808080',
            '--accent': '#ffffff', '--glass-blur': '8px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'kakashi-hatake': {
        name: 'Kakashi Hatake',
        styles: {
            '--bg-main': 'rgba(35, 35, 40, 0.45)', '--bg-panel': 'rgba(50, 50, 60, 0.55)', '--bg-sidebar': 'rgba(25, 25, 30, 0.65)',
            '--border': 'rgba(160, 160, 170, 0.2)', '--text-main': '#e8e8ec', '--text-muted': '#8e8e9a',
            '--accent': '#b0b0c0', '--glass-blur': '10px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'tanjiro-hinokami': {
        name: 'Tanjiro Hinokami',
        styles: {
            '--bg-main': 'rgba(30, 15, 15, 0.4)', '--bg-panel': 'rgba(50, 25, 25, 0.5)', '--bg-sidebar': 'rgba(20, 10, 10, 0.6)',
            '--border': 'rgba(255, 80, 40, 0.25)', '--text-main': '#ffe4d5', '--text-muted': '#b77e6a',
            '--accent': '#ff5028', '--glass-blur': '12px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'nezuko-pink': {
        name: 'Nezuko Pink',
        styles: {
            '--bg-main': 'rgba(40, 20, 30, 0.35)', '--bg-panel': 'rgba(60, 30, 45, 0.45)', '--bg-sidebar': 'rgba(30, 15, 25, 0.55)',
            '--border': 'rgba(255, 150, 200, 0.25)', '--text-main': '#ffe0f0', '--text-muted': '#c47a9e',
            '--accent': '#ff9acb', '--glass-blur': '12px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'roy-mustang': {
        name: 'Roy Mustang',
        styles: {
            '--bg-main': 'rgba(30, 20, 10, 0.4)', '--bg-panel': 'rgba(50, 35, 20, 0.5)', '--bg-sidebar': 'rgba(20, 15, 5, 0.6)',
            '--border': 'rgba(255, 100, 0, 0.3)', '--text-main': '#ffecd9', '--text-muted': '#b3895c',
            '--accent': '#ff6400', '--glass-blur': '12px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'killua-godspeed': {
        name: 'Killua Godspeed',
        styles: {
            '--bg-main': 'rgba(15, 20, 35, 0.4)', '--bg-panel': 'rgba(25, 30, 50, 0.5)', '--bg-sidebar': 'rgba(10, 15, 25, 0.6)',
            '--border': 'rgba(100, 200, 255, 0.3)', '--text-main': '#e0f0ff', '--text-muted': '#6a8fb0',
            '--accent': '#46c3ff', '--glass-blur': '12px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'kagura-yato': {
        name: 'Kagura Yato',
        styles: {
            '--bg-main': 'rgba(45, 40, 55, 0.4)', '--bg-panel': 'rgba(60, 50, 70, 0.5)', '--bg-sidebar': 'rgba(35, 30, 45, 0.6)',
            '--border': 'rgba(255, 215, 0, 0.25)', '--text-main': '#fff5e6', '--text-muted': '#b39e7c',
            '--accent': '#ffd700', '--glass-blur': '12px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'sakura-cardcaptor': {
        name: 'Sakura Cardcaptor',
        styles: {
            '--bg-main': 'rgba(45, 25, 35, 0.3)', '--bg-panel': 'rgba(65, 35, 50, 0.4)', '--bg-sidebar': 'rgba(35, 20, 30, 0.5)',
            '--border': 'rgba(255, 130, 200, 0.25)', '--text-main': '#fff0fa', '--text-muted': '#c28fb0',
            '--accent': '#ff82c8', '--glass-blur': '15px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'asuka-evangelion': {
        name: 'Asuka Evangelion',
        styles: {
            '--bg-main': 'rgba(50, 20, 20, 0.4)', '--bg-panel': 'rgba(75, 30, 30, 0.5)', '--bg-sidebar': 'rgba(40, 15, 15, 0.6)',
            '--border': 'rgba(255, 80, 50, 0.3)', '--text-main': '#ffe6e6', '--text-muted': '#b57a7a',
            '--accent': '#ff5032', '--glass-blur': '12px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'rem-rinascita': {
        name: 'Rem Rinascita',
        styles: {
            '--bg-main': 'rgba(20, 30, 45, 0.4)', '--bg-panel': 'rgba(30, 45, 65, 0.5)', '--bg-sidebar': 'rgba(15, 25, 35, 0.6)',
            '--border': 'rgba(100, 180, 255, 0.25)', '--text-main': '#e5f0ff', '--text-muted': '#7e9ec0',
            '--accent': '#64b4ff', '--glass-blur': '12px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'violet-evergarden': {
        name: 'Violet Evergarden',
        styles: {
            '--bg-main': 'rgba(35, 25, 45, 0.35)', '--bg-panel': 'rgba(55, 40, 70, 0.45)', '--bg-sidebar': 'rgba(25, 15, 35, 0.55)',
            '--border': 'rgba(210, 180, 140, 0.25)', '--text-main': '#f5ebe0', '--text-muted': '#b29e80',
            '--accent': '#d4af37', '--glass-blur': '14px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'saitama-one-punch': {
        name: 'Saitama One Punch',
        styles: {
            '--bg-main': 'rgba(45, 40, 30, 0.4)', '--bg-panel': 'rgba(65, 60, 45, 0.5)', '--bg-sidebar': 'rgba(35, 30, 20, 0.6)',
            '--border': 'rgba(255, 200, 50, 0.25)', '--text-main': '#ffffe0', '--text-muted': '#b5a87c',
            '--accent': '#ffc832', '--glass-blur': '10px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'kawaii-miku': {
        name: 'Hatsune Miku',
        styles: {
            '--bg-main': 'rgba(20, 40, 45, 0.3)', '--bg-panel': 'rgba(30, 60, 70, 0.4)', '--bg-sidebar': 'rgba(15, 30, 35, 0.5)',
            '--border': 'rgba(0, 240, 200, 0.25)', '--text-main': '#e6fffe', '--text-muted': '#79b5b0',
            '--accent': '#39c5bb', '--glass-blur': '15px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'zero-two': {
        name: 'Zero Two',
        styles: {
            '--bg-main': 'rgba(40, 15, 30, 0.4)', '--bg-panel': 'rgba(60, 20, 45, 0.5)', '--bg-sidebar': 'rgba(30, 10, 20, 0.6)',
            '--border': 'rgba(255, 70, 120, 0.3)', '--text-main': '#ffe6f0', '--text-muted': '#c47395',
            '--accent': '#ff4678', '--glass-blur': '12px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'luffy-gear5': {
        name: 'Luffy Gear 5',
        styles: {
            '--bg-main': 'rgba(45, 25, 25, 0.4)', '--bg-panel': 'rgba(70, 35, 35, 0.5)', '--bg-sidebar': 'rgba(35, 15, 15, 0.6)',
            '--border': 'rgba(255, 255, 255, 0.3)', '--text-main': '#fff0e6', '--text-muted': '#c09880',
            '--accent': '#ffffff', '--glass-blur': '12px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'megumin-explosion': {
        name: 'Megumin Explosion',
        styles: {
            '--bg-main': 'rgba(25, 15, 30, 0.45)', '--bg-panel': 'rgba(40, 20, 50, 0.55)', '--bg-sidebar': 'rgba(15, 8, 20, 0.65)',
            '--border': 'rgba(200, 50, 200, 0.25)', '--text-main': '#f0e0ff', '--text-muted': '#a77cc2',
            '--accent': '#c832c8', '--glass-blur': '10px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'kawaii-kitty': {
        name: 'Hello Kitty',
        styles: {
            '--bg-main': 'rgba(50, 30, 40, 0.25)', '--bg-panel': 'rgba(75, 45, 60, 0.35)', '--bg-sidebar': 'rgba(40, 20, 30, 0.45)',
            '--border': 'rgba(255, 150, 200, 0.2)', '--text-main': '#fff5fa', '--text-muted': '#d9a0b9',
            '--accent': '#ff96c8', '--glass-blur': '20px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
    'original-cyber': {
        name: 'Original Cyber',
        styles: {
            '--bg-main': 'rgba(8, 12, 20, 0.45)', '--bg-panel': 'rgba(16, 22, 35, 0.55)', '--bg-sidebar': 'rgba(4, 8, 15, 0.65)',
            '--border': 'rgba(0, 255, 200, 0.2)', '--text-main': '#ccffff', '--text-muted': '#5a9e9e',
            '--accent': '#00ffcc', '--glass-blur': '12px',
            '--canvas-bg': 'none', '--canvas-opacity': '1', '--mascot-img': 'none'
        } as React.CSSProperties
    },
};

// 2. TYPESCRIPT MAGIC
export type ThemeId = keyof typeof THEME_REGISTRY;

// 3. EXPORT THEMES
export const THEMES = Object.keys(THEME_REGISTRY).reduce((acc, key) => {
    acc[key as ThemeId] = THEME_REGISTRY[key as ThemeId].styles;
    return acc;
}, {} as Record<ThemeId, React.CSSProperties>);

// 4. EXPORT OPTIONS
export const THEME_OPTIONS = Object.keys(THEME_REGISTRY).map(key => ({
    id: key as ThemeId,
    name: THEME_REGISTRY[key as ThemeId].name
}));