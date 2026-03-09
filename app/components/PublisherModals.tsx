// src/components/PublisherModals.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function PublisherModals({ ws }: { ws: any }) {
    const [coverModal, setCoverModal] = useState<any>(null);

    useEffect(() => {
        const handleCover = (e: any) => setCoverModal(e.detail.target);
        const handleExport = (e: any) => handleExportPDF(e.detail.target);

        window.addEventListener('open-cover-modal', handleCover);
        window.addEventListener('open-export-modal', handleExport);
        return () => {
            window.removeEventListener('open-cover-modal', handleCover);
            window.removeEventListener('open-export-modal', handleExport);
        };
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result;
            try {
                const bookData = JSON.parse(coverModal.content);
                bookData.coverImage = base64;
                const newContent = JSON.stringify(bookData, null, 2);

                await supabase.from('file_system').update({ content: newContent }).eq('id', coverModal.id);
                ws.setFileNodes((prev: any) => prev.map((n: any) => n.id === coverModal.id ? { ...n, content: newContent } : n));

                alert('✅ Cover berhasil dipasang ke dalam file .jbook!');
                setCoverModal(null);
            } catch (err) {
                alert('Error: Gagal memproses file .jbook');
            }
        };
        reader.readAsDataURL(file);
    };

    // --- LOGIKA 2: ENGINE EXPORT PDF (DIUPGRADE ANTI KEPOTONG!) ---
    const handleExportPDF = (target: any) => {
        try {
            const book = JSON.parse(target.content);
            const printWindow = window.open('', '_blank');
            if (!printWindow) { alert('Pop-up diblokir browser! Izinkan pop-up dulu bro.'); return; }

            // SIHIR CSS: Maksa Root HTML jadi Vertical, tapi Cover dikasih Horizontal.
            const html = `
                <!DOCTYPE html>
                <html lang="ja" style="writing-mode: vertical-rl;">
                <head>
                    <meta charset="UTF-8">
                    <title>Export - ${book.title}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap');
                        
                        body { 
                            font-family: 'Noto Serif JP', serif; 
                            color: #000; 
                            background: #fff; 
                            margin: 0; 
                            padding: 0; 
                        }
                        
                        /* Tombol Print (Dikembaliin ke Horizontal biar bisa dibaca) */
                        .no-print { 
                            writing-mode: horizontal-tb;
                            position: fixed; 
                            top: 20px; 
                            left: 20px; 
                            z-index: 1000; 
                        }
                        
                        /* Cover Buku (Horizontal & Rata Tengah) */
                        .cover { 
                            writing-mode: horizontal-tb; 
                            width: 100vw; 
                            height: 100vh; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            flex-direction: column; 
                        }
                        .cover img { 
                            max-width: 80%; 
                            max-height: 75vh; 
                            object-fit: contain; 
                            box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
                        }
                        
                        .page-break { 
                            page-break-before: always; 
                            break-before: page; 
                        }
                        
                        /* Konten Tategaki */
                        .tategaki-content { 
                            padding: 40px; 
                            font-size: 18px; 
                            line-height: 2.2; 
                            white-space: pre-wrap; /* PENTING: Biar paragraf/enter gak ancur! */
                            text-orientation: upright;
                        }
                        
                        /* Logika Print Kertas */
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                            .no-print { display: none; }
                            /* Otomatis set kertas ke A4 Landscape biar Vertikalnya luas */
                            @page { size: A4 landscape; margin: 15mm; }
                        }
                    </style>
                </head>
                <body>
                    <div class="no-print">
                        <button onclick="window.print()" style="padding: 12px 24px; font-size: 16px; background: #9333ea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">🖨️ Cetak / Save PDF</button>
                    </div>
                    
                    ${book.coverImage ? `
                    <div class="cover">
                        <img src="${book.coverImage}" alt="Cover Buku">
                        <h1 style="margin-top: 30px; font-size: 28px; letter-spacing: 5px; font-family: sans-serif;">${book.title}</h1>
                    </div>
                    <div class="page-break"></div>
                    ` : ''}
                    
                    <div class="tategaki-content">${book.content || 'Konten kosong.'}</div>
                </body>
                </html>
            `;
            printWindow.document.write(html);
            printWindow.document.close();
        } catch (err) {
            alert('Format file .jbook rusak atau tidak valid!');
        }
    };

    if (!coverModal) return null;

    return (
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm flex items-center justify-center font-sans">
            <div className="bg-[#1e1e1e] border border-gray-700 p-8 rounded-2xl w-96 shadow-2xl flex flex-col items-center animate-in zoom-in-95">
                <h2 className="text-2xl font-bold text-white mb-2">Pasang Cover Buku</h2>
                <p className="text-xs text-gray-400 mb-6 text-center">Pilih gambar untuk file <br /><span className="text-purple-400 font-mono tracking-widest">{coverModal.name}</span></p>

                {(() => {
                    try {
                        const current = JSON.parse(coverModal.content).coverImage;
                        if (current) return <img src={current} alt="Current Cover" className="w-40 h-56 object-cover rounded shadow-[0_0_20px_rgba(147,51,234,0.3)] mb-6 border border-gray-600" />;
                    } catch (e) { }
                    return <div className="w-40 h-56 bg-gray-800 rounded flex items-center justify-center text-5xl mb-6 border border-gray-700 shadow-inner">📕</div>;
                })()}

                <label className="w-full cursor-pointer bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded text-center transition-colors mb-4 shadow-lg">
                    🖼️ Upload Gambar (JPG/PNG)
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>

                <button onClick={() => setCoverModal(null)} className="text-gray-400 hover:text-white text-sm transition-colors border-b border-transparent hover:border-white">
                    Tutup
                </button>
            </div>
        </div>
    );
}