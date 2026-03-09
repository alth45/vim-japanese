// src/hooks/useTerminal.ts
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type HistoryLine = { type: 'cmd' | 'output' | 'error' | 'success'; text: string };

export function useTerminal(ws: any) {
    const [history, setHistory] = useState<HistoryLine[]>([
        { type: 'success', text: 'Welcome to JAPAN LEARNER Terminal v6.0 (Virtual Directory Engine)' },
        { type: 'output', text: 'Ketik "help" untuk melihat daftar perintah yang tersedia.' }
    ]);
    const [input, setInput] = useState('');
    const [cwd, setCwd] = useState('~/jp-workspace');
    const endOfTerminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const print = (text: string, type: 'output' | 'error' | 'success' = 'output') => {
        setHistory(prev => [...prev, { type, text }]);
    };

    const handleCommand = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const cmd = input.trim();
            if (!cmd) return;

            setHistory(prev => [...prev, { type: 'cmd', text: `${cwd} $ ${cmd}` }]);

            const args = cmd.split(' ').filter(Boolean);
            const mainCmd = args[0].toLowerCase();

            // KUNCI UTAMA: Bikin "Jalur Murni" biar mesin tau kita lagi di folder mana
            // Contoh: Kalau cwd = '~/jp-workspace/sains', maka basePath = 'sains/'
            const basePath = cwd === '~/jp-workspace' ? '' : cwd.replace('~/jp-workspace/', '') + '/';

            switch (mainCmd) {
                case 'help':
                    print('Daftar Perintah Tersedia:');
                    print('  ls                 : Melihat isi folder saat ini');
                    print('  cd <folder>        : Pindah direktori (Cth: cd sains, cd ..)');
                    print('  pwd                : Cek lokasi folder saat ini');
                    print('  touch <file>       : Membuat file di folder ini');
                    print('  mkdir <folder>     : Membuat folder baru di folder ini');
                    print('  rm <file/folder>   : Menghapus file/folder');
                    print('  trash              : Lihat isi tempat sampah');
                    print('  restore <file>     : Mengembalikan file dari tempat sampah');
                    print('  mv <lama> <baru>   : Rename file/folder');
                    print('  write <file> <isi> : Tulis teks ke file');
                    print('  build <folder>     : Gabungin file di folder jadi 1 file .jbook siap cetak');
                    print('  cat <file>         : Membaca isi file');
                    print('  theme <nama>       : Ganti tema IDE');
                    print('  addword <hi> <kj> <id>: Simpan Vocab ke Flashcard Bank');
                    print('  quiz               : Mulai tebak-tebakan dari Vocab Bank');
                    print('  neofetch           : Menampilkan info sistem ala Linux');
                    print('  clear              : Bersihkan layar terminal');
                    break;

                case 'clear':
                    setHistory([]);
                    break;

                case 'pwd':
                    print(cwd, 'success');
                    break;

                // --- FITUR BARU: SHARE KE PUBLIK (CLOUD LINK 24 JAM) ---
                case 'share':
                    if (!args[1]) {
                        print('Error: Masukkan nama file .jbook (Cth: share publish/cerita.jbook)', 'error');
                        break;
                    }

                    const targetPathShare = basePath + args[1];
                    const targetShare = ws.fileNodes.find((n: any) => n.name === targetPathShare);

                    if (!targetShare || !targetShare.name.endsWith('.jbook')) {
                        print(`Error: File ${args[1]} nggak ketemu atau bukan format .jbook!`, 'error');
                        break;
                    }

                    print('🌐 Mengubah status buku menjadi Public (Aktif 24 Jam)...', 'output');

                    // SIHIR WAKTU: Waktu sekarang ditambah 24 Jam
                    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

                    // Tembak ke Supabase buat update is_public dan pasang bom waktu (expiresAt)
                    const { error: shareErr } = await supabase.from('file_system').update({
                        is_public: true,
                        share_token_expires_at: expiresAt
                    }).eq('id', targetShare.id);

                    if (shareErr) {
                        print(`Gagal: ${shareErr.message}`, 'error');
                    } else {
                        // Update state lokal
                        ws.setFileNodes(ws.fileNodes.map((n: any) => n.id === targetShare.id ? { ...n, is_public: true, share_token_expires_at: expiresAt } : n));

                        // Bikin Link!
                        const shareUrl = `${window.location.origin}/read/${targetShare.id}`;
                        print(`✅ BERHASIL! Buku lu LIVE di internet selama 24 JAM.`, 'success');
                        print(`🔗 Link URL: ${shareUrl}`, 'success');
                        print(`(Link ini otomatis kadaluarsa besok pada jam yang sama!)`, 'output');
                    }
                    break;

                // --- FITUR BARU: UN-SHARE (BIAR JADI PRIVATE LAGI) ---
                case 'unshare':
                    if (!args[1]) break;
                    const targetUnshare = ws.fileNodes.find((n: any) => n.name === basePath + args[1]);
                    if (targetUnshare) {
                        // Kalau di-unshare, matiin is_public dan hapus token waktunya
                        await supabase.from('file_system').update({ is_public: false, share_token_expires_at: null }).eq('id', targetUnshare.id);
                        ws.setFileNodes(ws.fileNodes.map((n: any) => n.id === targetUnshare.id ? { ...n, is_public: false, share_token_expires_at: null } : n));
                        print(`🔒 Buku ${args[1]} ditarik dari publik. Link tidak lagi aktif.`, 'success');
                    }
                    break;
                // --- FITUR BARU: SAPUJAGAT (HAPUS SEMUA FILE KOSONG) ---
                case 'clean':
                    print('🧹 Mencari dan menyapu file-file kosong di workspace...', 'output');

                    // Filter: Cari yang tipenya 'file' dan kontennya kosong (atau cuma spasi/enter)
                    const emptyFiles = ws.fileNodes.filter((n: any) =>
                        n.type === 'file' && (!n.content || n.content.trim() === '')
                    );

                    if (emptyFiles.length === 0) {
                        print('✨ Workspace udah bersih mantap! Gak ada file kosong.', 'success');
                        break;
                    }

                    // Kumpulin ID dari file-file yang kosong
                    const emptyFileIds = emptyFiles.map((f: any) => f.id);

                    // Tembak ke Supabase pakai fungsi .in() biar nge-update massal sekaligus!
                    const { error: cleanErr } = await supabase
                        .from('file_system')
                        .update({ deleted_at: new Date().toISOString() }) // Masukin ke tong sampah
                        .in('id', emptyFileIds);

                    if (cleanErr) {
                        print(`❌ Gagal bersih-bersih: ${cleanErr.message}`, 'error');
                    } else {
                        // Bersihin dari tampilan UI Sidebar lu
                        ws.setFileNodes(ws.fileNodes.filter((n: any) => !emptyFileIds.includes(n.id)));

                        // Kalau kebetulan file yang lagi lu buka itu kosong dan ikut kehapus, tutup layarnya
                        if (emptyFileIds.includes(ws.activeFileId)) {
                            ws.setActiveFileId(null);
                        }

                        print(`🗑️ Berhasil menyapu ${emptyFiles.length} file kosong ke tempat sampah!`, 'success');
                        emptyFiles.forEach((f: any) => print(`  -> Dihapus: ${f.name}`, 'output'));
                        print(`Ketik "trash" untuk melihat file yang dihapus.`, 'output');
                    }
                    break;

                // --- FITUR LS LOKAL (CUMA NAMPILIN ISI FOLDER SAAT INI) ---
                case 'ls':
                    const filesInDir = ws.fileNodes.filter((n: any) => {
                        if (basePath === '') {
                            // Kalau di root, jangan nampilin yang ada '/' (berarti file di dalem folder)
                            return !n.name.includes('/');
                        } else {
                            // Harus berawalan folder saat ini, tapi nggak boleh masuk terlalu dalam
                            if (!n.name.startsWith(basePath)) return false;
                            const restOfName = n.name.slice(basePath.length);
                            return restOfName.length > 0 && !restOfName.includes('/');
                        }
                    });

                    if (filesInDir.length === 0) {
                        print('Folder kosong.', 'output');
                    } else {
                        // Pas dicetak, kita potong path-nya biar cuma nampil nama aslinya
                        const names = filesInDir.map((n: any) => {
                            const displayName = n.name.slice(basePath.length);
                            return n.type === 'folder' ? `📁 ${displayName}` : `📄 ${displayName}`;
                        }).join('   ');
                        print(names, 'success');
                    }
                    break;

                case 'cd':
                    const targetDir = args[1];
                    if (!targetDir || targetDir === '~') {
                        setCwd('~/jp-workspace');
                    } else if (targetDir === '..') {
                        if (cwd !== '~/jp-workspace') {
                            const parts = cwd.split('/');
                            parts.pop();
                            setCwd(parts.join('/'));
                        }
                    } else {
                        const targetFullPath = basePath + targetDir;
                        const folderExists = ws.fileNodes.find((n: any) => n.name === targetFullPath && n.type === 'folder');
                        if (folderExists) {
                            setCwd(`${cwd}/${targetDir}`);
                        } else {
                            print(`cd: ${targetDir}: Folder tidak ditemukan di direktori ini!`, 'error');
                        }
                    }
                    break;

                case 'touch':
                    if (!args[1]) print('Error: Masukkan nama file.', 'error');
                    else if (args[1].includes('/')) print('Error: Nama nggak boleh pakai karakter "/".', 'error');
                    else {
                        const newPath = basePath + args[1];
                        if (ws.fileNodes.find((n: any) => n.name === newPath)) print(`Error: File ${args[1]} sudah ada di folder ini.`, 'error');
                        else {
                            const { data, error } = await supabase.from('file_system').insert([{ name: newPath, type: 'file', content: '' }]).select().single();
                            if (error) print(`Error Database: ${error.message}`, 'error');
                            else {
                                ws.setFileNodes([...ws.fileNodes, data]);
                                ws.setActiveFileId(data.id);
                                print(`Berhasil membuat file: ${args[1]}`, 'success');
                            }
                        }
                    }
                    break;

                case 'mkdir':
                    if (!args[1]) print('Error: Masukkan nama folder.', 'error');
                    else if (args[1].includes('/')) print('Error: Nama nggak boleh pakai karakter "/".', 'error');
                    else {
                        const newPath = basePath + args[1];
                        if (ws.fileNodes.find((n: any) => n.name === newPath)) print(`Error: Folder ${args[1]} sudah ada di folder ini.`, 'error');
                        else {
                            const { data, error } = await supabase.from('file_system').insert([{ name: newPath, type: 'folder' }]).select().single();
                            if (error) print(`Error Database: ${error.message}`, 'error');
                            else {
                                ws.setFileNodes([...ws.fileNodes, data]);
                                print(`Berhasil membuat folder: ${args[1]}`, 'success');
                            }
                        }
                    }
                    break;


                case 'rm':
                    if (!args[1]) print('Error: Masukkan nama file/folder.', 'error');
                    else {
                        const targetPath = basePath + args[1];
                        const target = ws.fileNodes.find((n: any) => n.name === targetPath);
                        if (!target) print(`Error: ${args[1]} tidak ditemukan di sini.`, 'error');
                        else {
                            // Ganti .delete() jadi .update({ deleted_at })
                            const { error } = await supabase.from('file_system').update({ deleted_at: new Date().toISOString() }).eq('id', target.id);
                            if (error) print(`Gagal menghapus: ${error.message}`, 'error');
                            else {
                                ws.setFileNodes(ws.fileNodes.filter((n: any) => n.id !== target.id));
                                if (ws.activeFileId === target.id) ws.setActiveFileId(null);
                                print(`🗑️ Dipindah ke tempat sampah: ${args[1]} (Akan dihapus permanen dlm 24 jam)`, 'success');
                            }
                        }
                    }
                    break;

                // --- FITUR BARU: LIHAT ISI TONG SAMPAH ---
                case 'trash':
                    print('Mencari file di tempat sampah...', 'output');
                    const { data: trashData } = await supabase.from('file_system').select('*').not('deleted_at', 'is', null);

                    if (!trashData || trashData.length === 0) {
                        print('✨ Tempat sampah kosong bro!', 'success');
                    } else {
                        print('🗑️ ISI TEMPAT SAMPAH (Auto-delete 24 Jam):', 'error');
                        trashData.forEach((file: any) => {
                            // Hitung sisa waktu
                            const deletedTime = new Date(file.deleted_at).getTime();
                            const timeLimit = deletedTime + (24 * 60 * 60 * 1000);
                            const timeLeft = Math.max(0, Math.floor((timeLimit - Date.now()) / (1000 * 60 * 60))); // Sisa jam

                            print(`  [Sisa ${timeLeft} Jam] ${file.type === 'folder' ? '📂' : '📄'} ${file.name}`, 'output');
                        });
                        print('Ketik "restore <nama_file>" untuk mengembalikan.', 'success');
                    }
                    break;

                // --- FITUR BARU: KEMBALIKAN FILE DARI SAMPAH ---
                case 'restore':
                    if (!args[1]) {
                        print('Error: Masukkan nama file/folder yang mau dikembalikan. (Cth: restore publish/bab1.jp)', 'error');
                        break;
                    }

                    // Cari file di database yang namanya cocok dan lagi di tong sampah
                    const { data: fileToRestore, error: resErr } = await supabase
                        .from('file_system')
                        .select('*')
                        .eq('name', basePath + args[1])
                        .not('deleted_at', 'is', null)
                        .single();

                    if (resErr || !fileToRestore) {
                        print(`Error: File ${args[1]} nggak ada di tempat sampah.`, 'error');
                    } else {
                        // Restore: Kosongin lagi kolom deleted_at nya
                        const { error: updateErr } = await supabase.from('file_system').update({ deleted_at: null }).eq('id', fileToRestore.id);
                        if (!updateErr) {
                            // Masukin balik ke state UI lu
                            ws.setFileNodes((prev: any) => [...prev, fileToRestore]);
                            print(`♻️ Berhasil dikembalikan: ${args[1]}`, 'success');
                        } else {
                            print('Gagal mengembalikan file dari server.', 'error');
                        }
                    }
                    break;

                case 'mv':
                    if (args.length < 3) print('Error: Format salah. (Cth: mv lama.jp baru.jp)', 'error');
                    else if (args[2].includes('/')) print('Error: Nama baru nggak boleh pakai "/".', 'error');
                    else {
                        const oldPath = basePath + args[1];
                        const newPath = basePath + args[2];
                        const target = ws.fileNodes.find((n: any) => n.name === oldPath);

                        if (!target) print(`Error: ${args[1]} tidak ditemukan di folder ini.`, 'error');
                        else if (ws.fileNodes.find((n: any) => n.name === newPath)) print(`Error: Nama ${args[2]} udah terpakai.`, 'error');
                        else {
                            const { error } = await supabase.from('file_system').update({ name: newPath }).eq('id', target.id);
                            if (error) print(`Gagal rename: ${error.message}`, 'error');
                            else {
                                ws.setFileNodes(ws.fileNodes.map((n: any) => n.id === target.id ? { ...n, name: newPath } : n));
                                print(`Berhasil rename: ${args[1]} -> ${args[2]}`, 'success');
                            }
                        }
                    }
                    break;

                case 'write':
                    if (args.length < 3) print('Error: Format salah. (Cth: write catat.jp Halo!)', 'error');
                    else {
                        const targetPath = basePath + args[1];
                        const contentToAppend = args.slice(2).join(' ');
                        const target = ws.fileNodes.find((n: any) => n.name === targetPath);
                        if (!target) print(`Error: File ${args[1]} tidak ditemukan.`, 'error');
                        else if (target.type === 'folder') print(`Error: ${args[1]} itu folder!`, 'error');
                        else {
                            const { error } = await supabase.from('file_system').update({ content: contentToAppend }).eq('id', target.id);
                            if (error) print(`Gagal menulis: ${error.message}`, 'error');
                            else {
                                ws.setFileNodes(ws.fileNodes.map((n: any) => n.id === target.id ? { ...n, content: contentToAppend } : n));
                                print(`Berhasil menulis ke ${args[1]}`, 'success');
                            }
                        }
                    }
                    break;

                case 'cat':
                    if (!args[1]) print('Error: Masukkan nama file.', 'error');
                    else {
                        const targetPath = basePath + args[1];
                        const target = ws.fileNodes.find((n: any) => n.name === targetPath);
                        if (!target) print(`Error: File tidak ditemukan di folder ini.`, 'error');
                        else if (target.type === 'folder') print('Error: Itu folder bro!', 'error');
                        else {
                            print(`--- Isi dari ${args[1]} ---`, 'success');
                            print(target.content || '(Kosong)');
                            print('-------------------------', 'success');
                        }
                    }
                    break;

                // ------------------ PERINTAH UMUM GLOBAL ------------------
                // case 'theme':
                //     if (args.length < 2) {
                //         print('Tema: vscode-dark, tokyo-night, gruvbox, dracula, glass-cyan', 'output');
                //     } else {
                //         const rawInput = args.slice(1).join(' ');
                //         const parsedTheme = rawInput.trim().toLowerCase().replace(/\s+/g, '-');
                //         ws.setEditorSettings((prev: any) => ({ ...prev, theme: parsedTheme }));
                //         print(`Tema diubah ke: ${parsedTheme}`, 'success');
                //     }
                //     break;

                // --- FITUR BARU: BOOK COMPILER ---
                case 'build':
                    if (!args[1]) {
                        print('Error: Masukkan nama folder yang mau di-build. (Cth: build novel-ku)', 'error');
                        break;
                    }

                    const targetBuildDir = basePath + args[1];

                    // 1. Ambil semua file .jp di dalam folder target
                    const filesToMerge = ws.fileNodes.filter((n: any) => n.name.startsWith(targetBuildDir + '/') && n.name.endsWith('.jp'));

                    if (filesToMerge.length === 0) {
                        print(`Error: Folder ${args[1]} kosong atau tidak ada file .jp`, 'error');
                        break;
                    }

                    print(`⚙️ Memulai proses kompilasi folder: ${args[1]}...`, 'output');

                    // 2. Sorting otomatis berdasarkan ANGKA yang ada di nama file
                    // Misal: "1-bab.jp" akan dieksekusi sebelum "10-bab.jp"
                    const sortedFiles = filesToMerge.sort((a: any, b: any) => {
                        const numA = parseInt(a.name.match(/\d+/) || '0', 10);
                        const numB = parseInt(b.name.match(/\d+/) || '0', 10);
                        return numA - numB;
                    });

                    // 3. Gabungin kontennya
                    let mergedContent = '';
                    sortedFiles.forEach((f: any) => {
                        const cleanName = f.name.split('/').pop();
                        print(`  -> Menjahit: ${cleanName}`, 'output');
                        mergedContent += `\n\n=== [ ${cleanName?.toUpperCase()} ] ===\n\n`; // Penanda Bab
                        mergedContent += f.content;
                    });

                    // 4. Pastikan folder khusus "publish" ada di root database
                    let publishFolder = ws.fileNodes.find((n: any) => n.name === 'publish' && n.type === 'folder');
                    if (!publishFolder) {
                        const { data, error } = await supabase.from('file_system').insert([{ name: 'publish', type: 'folder' }]).select().single();
                        if (data && !error) {
                            publishFolder = data;
                            ws.setFileNodes((prev: any) => [...prev, data]);
                        }
                    }

                    // 5. Bikin File Master .jbook (Format Data JSON Tertutup)
                    const outputFileName = `publish/${args[1]}.jbook`;
                    const existingOutput = ws.fileNodes.find((n: any) => n.name === outputFileName);

                    // Kita simpen sebagai JSON string biar nanti gampang ditambahin Cover Image!
                    const jbookData = JSON.stringify({
                        title: args[1].toUpperCase(),
                        coverImage: null, // Nanti diisi pakai command 'cover'
                        compiledAt: new Date().toISOString(),
                        content: mergedContent
                    }, null, 2);

                    // 6. Tembak ke Supabase
                    if (existingOutput) {
                        const { error } = await supabase.from('file_system').update({ content: jbookData }).eq('id', existingOutput.id);
                        if (!error) {
                            ws.setFileNodes(ws.fileNodes.map((n: any) => n.id === existingOutput.id ? { ...n, content: jbookData } : n));
                            print(`✅ Selesai! File diupdate: ${outputFileName}`, 'success');
                        }
                    } else {
                        const { data, error } = await supabase.from('file_system').insert([{ name: outputFileName, type: 'file', content: jbookData }]).select().single();
                        if (!error) {
                            ws.setFileNodes((prev: any) => [...prev, data]);
                            print(`✅ Selesai! File baru dibuat: ${outputFileName}`, 'success');
                        }
                    }
                    break;
                // --- FITUR BARU: GUI PASANG COVER ---
                case 'cover':
                    if (!args[1]) {
                        print('Error: Masukkan nama file .jbook (Cth: cover publish/cerita.jbook)', 'error');
                        break;
                    }
                    const targetPathCover = basePath + args[1];
                    const targetCover = ws.fileNodes.find((n: any) => n.name === targetPathCover);

                    if (!targetCover || !targetCover.name.endsWith('.jbook')) {
                        print(`Error: File ${args[1]} tidak ditemukan atau bukan format .jbook!`, 'error');
                        break;
                    }

                    // Tembak sinyal ke React UI buat buka Modal!
                    window.dispatchEvent(new CustomEvent('open-cover-modal', { detail: { target: targetCover } }));
                    print(`🖼️ Membuka GUI Cover untuk ${args[1]}...`, 'success');
                    break;

                // --- FITUR BARU: EXPORT PDF ---
                case 'export':
                    if (!args[1]) {
                        print('Error: Masukkan nama file .jbook (Cth: export publish/cerita.jbook)', 'error');
                        break;
                    }
                    const targetPathExp = basePath + args[1];
                    const targetExp = ws.fileNodes.find((n: any) => n.name === targetPathExp);

                    if (!targetExp || !targetExp.name.endsWith('.jbook')) {
                        print(`Error: File ${args[1]} tidak ditemukan atau bukan format .jbook!`, 'error');
                        break;
                    }

                    // Tembak sinyal ke React UI buat buka Tab Export!
                    window.dispatchEvent(new CustomEvent('open-export-modal', { detail: { target: targetExp } }));
                    print(`🖨️ Menyiapkan dokumen ${args[1]} untuk di-export...`, 'success');
                    break;

                case 'theme':
                    const availableThemes = ['vscode-dark', 'tokyo-night', 'gruvbox', 'dracula', 'glass-cyan', 'custom-json'];

                    if (args.length < 2) {
                        print('🎨 Daftar Tema Tersedia:', 'success');

                        // Looping buat nampilin semua tema dan nandain mana yang aktif
                        availableThemes.forEach(t => {
                            const isActive = t === ws.editorSettings.theme;
                            print(`  ${isActive ? '👉' : '  '} ${t} ${isActive ? '(Aktif)' : ''}`, isActive ? 'success' : 'output');
                        });

                        print('Tips: Ketik "theme <nama_tema>" untuk mengganti (cth: theme tokyo night)', 'output');
                    } else {
                        const rawInput = args.slice(1).join(' ');
                        const parsedTheme = rawInput.trim().toLowerCase().replace(/\s+/g, '-');

                        // Validasi biar user gak masukin tema ngasal
                        if (availableThemes.includes(parsedTheme)) {
                            ws.setEditorSettings((prev: any) => ({ ...prev, theme: parsedTheme }));
                            print(`Sihir Parsing: "${rawInput}" -> "${parsedTheme}"`, 'output');
                            print(`Tema IDE berhasil diubah ke: ${parsedTheme}`, 'success');
                        } else {
                            print(`Error: Tema "${parsedTheme}" gak ada di daftar bro!`, 'error');
                            print('Ketik "theme" (tanpa nama) untuk liat daftar lengkapnya.', 'output');
                        }
                    }
                    break;

                case 'addword':
                    if (args.length < 4) print('Error: Format salah! (Cth: addword watashi 私 Saya)', 'error');
                    else {
                        const { error } = await supabase.from('vocab_bank').insert([{ reading: args[1], kanji: args[2], meaning: args.slice(3).join(' ') }]);
                        if (error) print(`Gagal: ${error.message}`, 'error');
                        else print(`Disimpan: ${args[2]} ke Vocab Bank!`, 'success');
                    }
                    break;

                case 'quiz':
                    const { data: vocabs, error: qErr } = await supabase.from('vocab_bank').select('*');
                    if (qErr || !vocabs || vocabs.length === 0) print('Vocab kosong bro.', 'error');
                    else {
                        const randomCard = vocabs[Math.floor(Math.random() * vocabs.length)];
                        print('🎯 QUIZ TIME! 🎯', 'success');
                        print(`Arti dari: ${randomCard.kanji} (${randomCard.reading}) ?`);
                        print(`(Jawaban: ${randomCard.meaning})`, 'output');
                    }
                    break;

                case 'neofetch':
                    const { data: { user } } = await supabase.auth.getUser();
                    let username = 'hacker';
                    if (user) username = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'hacker';
                    const cleanUsername = username.toLowerCase().replace(/\s+/g, '-');
                    const { count } = await supabase.from('vocab_bank').select('*', { count: 'exact', head: true });

                    const fetchOutput = `
      ___|___       ${cleanUsername}@japan-learner
      ___|___       -------------------------
        | |         OS     : Web Browser (V8 Engine)
        | |         Host   : Japan Learner IDE v6.0
       _|_|_        Theme  : ${ws.editorSettings.theme}
                    Vocab  : ${count || 0} words in memory
                    Files  : ${ws.fileNodes.length} files in cloud
                    Engine : JSPy Ready
                    `;
                    print(fetchOutput, 'success');
                    break;

                default:
                    print(`Command not found: ${mainCmd}. Ketik "help".`, 'error');
            }

            setInput('');
        }
    };

    return {
        history, input, setInput, handleCommand, endOfTerminalRef, cwd
    };
}