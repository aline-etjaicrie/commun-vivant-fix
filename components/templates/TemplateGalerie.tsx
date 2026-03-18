'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Share2, Printer, ChevronDown } from 'lucide-react';
import { exportToPDF } from '@/utils/exportPdf';
import MemorialCandles from '@/components/memorial/Candles';
import MemorialGuestbook from '@/components/memorial/Guestbook';
import RawImage from '@/components/RawImage';

interface TemplateProps {
    memory: any;
}

export default function TemplateGalerie({ memory }: TemplateProps) {
    const { identite, repereBio, photoProfil, medias, gouts, bio } = memory.data || {};
    const [icons, setIcons] = useState<Record<string, string>>({});

    // Colors
    const bgDark = '#0F0F0F';
    const textLight = '#F5F5F5';
    const accent = '#E63946'; // Red accent

    useEffect(() => {
        const fetchIcon = async (keyword: string, key: string) => {
            try {
                const res = await fetch(`/api/get-icon?keyword=${keyword} solid`);
                const data = await res.json();
                if (data.iconUrl) setIcons(prev => ({ ...prev, [key]: data.iconUrl }));
            } catch (e) {
                console.error(e);
            }
        };
        fetchIcon('music', 'music');
        fetchIcon('location', 'place');
        fetchIcon('season', 'season');
    }, []);

    const handleExport = () => {
        exportToPDF('galerie-memorial', `memoire-${identite?.nom}-galerie`);
    };

    return (
        <div id="galerie-memorial" className="font-sans bg-black text-white h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">

            <style jsx global>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; color: black !important; }
                    #galerie-memorial { height: auto !important; overflow: visible !important; display: block !important; }
                    .snap-start { height: auto !important; min-height: 0 !important; scroll-snap-align: none !important; page-break-inside: avoid; border-bottom: 1px solid #ccc; padding: 2cm 0 !important; }
                    .no-print { display: none !important; }
                    .print-invert { filter: invert(1); } /* Invert white text/icons to black for print */
                    .bg-black { background-color: white !important; color: black !important; }
                    .text-white { color: black !important; }
                    img { max-height: 500px !important; object-fit: contain !important; }
                }
                /* Hide scrollbar for immersive feel */
                #galerie-memorial::-webkit-scrollbar { display: none; }
                .text-stroke { -webkit-text-stroke: 1px rgba(255,255,255,0.2); color: transparent; }
            `}</style>

            {/* HERO SECTION */}
            <section className="snap-start w-full h-screen relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={photoProfil?.url || '/placeholder-portrait.jpg'}
                        alt={identite?.prenom}
                        fill
                        className="object-cover opacity-60 grayscale md:grayscale-0 transition-all duration-1000 hover:grayscale-0 hover:scale-105"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90"></div>
                </div>

                <div className="relative z-10 text-center p-8">
                    <h1 className="font-sans text-[15vw] font-black uppercase leading-none text-white opacity-90 drop-shadow-2xl tracking-tight">
                        {identite?.prenom}
                    </h1>
                    <h2 className="font-sans text-4xl md:text-6xl font-black uppercase tracking-[0.3em] mt-[-2vw] mb-8" style={{ color: accent }}>
                        {identite?.nom}
                    </h2>
                    <p className="text-xl md:text-2xl font-light tracking-[0.3em] uppercase opacity-70 border-t border-white/20 pt-8 inline-block">
                        {repereBio?.dateNaissance} — {repereBio?.dateDeces}
                    </p>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50 no-print">
                    <ChevronDown className="w-8 h-8" />
                </div>
            </section>

            {/* RECIT / QUOTE SECTION */}
            <section className="snap-start w-full min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-8 md:p-24 relative">
                <div className="max-w-4xl mx-auto text-center">
                    {gouts?.phrase && (
                        <blockquote className="font-sans text-5xl md:text-7xl font-black uppercase mb-16 text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-500 leading-tight tracking-tight">
                            "{gouts.phrase}"
                        </blockquote>
                    )}

                    <div className="columns-1 md:columns-2 gap-12 text-left text-lg md:text-xl text-stone-400 leading-relaxed font-light">
                        {bio?.split('\n').map((p: string, i: number) => (
                            <p key={i} className="mb-6">{p}</p>
                        ))}
                    </div>
                </div>
            </section>

            {/* FULLSCREEN GALLERY CAROUSEL */}
            {medias && medias.length > 0 && (
                <section className="snap-start w-full h-screen bg-black relative flex items-center no-print">
                    <div className="flex overflow-x-scroll snap-x snap-mandatory w-full h-full no-scrollbar">
                        {medias.map((media: any, i: number) => (
                            <div key={i} className="snap-center w-screen h-screen flex-shrink-0 relative bg-black flex items-center justify-center">
                                <div className="absolute inset-0 z-0 opacity-30 blur-3xl scale-110">
                                    <Image src={media.url} fill className="object-cover" alt="bg" />
                                </div>
                                <div className="relative w-full h-full md:w-[80%] md:h-[90%] z-10">
                                    <Image
                                        src={media.url}
                                        alt={`Souvenir ${i + 1}`}
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                    />
                                </div>
                                <div className="absolute bottom-10 left-10 z-20 bg-black/50 backdrop-blur-md px-4 py-2 rounded text-xs font-bold uppercase tracking-widest text-white/70 border border-white/10">
                                    Souvenir {i + 1} / {medias.length}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="absolute top-10 left-10 z-20 mix-blend-difference pointer-events-none">
                        <h2 className="font-sans text-6xl font-black uppercase text-white tracking-wide">GALERIE</h2>
                    </div>
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 z-20 text-white/20 animate-pulse pointer-events-none">
                        <span className="block rotate-90 tracking-widest text-xs uppercase">Scroll →</span>
                    </div>
                </section>
            )}

            {/* DETAILS & ATTRIBUTES GRID */}
            <section className="snap-start w-full min-h-screen bg-[#111] grid grid-cols-1 md:grid-cols-2">
                <div className="flex flex-col justify-center p-12 md:p-24 border-b md:border-b-0 md:border-r border-white/10 hover:bg-white/5 transition-colors group">
                    <div className="w-16 h-16 mb-8 filter invert opacity-50 group-hover:opacity-100 transition-opacity">
                        {icons.music && <RawImage src={icons.music} className="w-full" alt="Music" />}
                    </div>
                    <h3 className="font-sans text-4xl font-black uppercase mb-4 tracking-wide" style={{ color: accent }}>La Bande Son</h3>
                    <p className="text-2xl md:text-3xl font-light">{gouts?.musique || 'Silence...'}</p>
                </div>

                <div className="flex flex-col justify-center p-12 md:p-24 hover:bg-white/5 transition-colors group">
                    <div className="w-16 h-16 mb-8 filter invert opacity-50 group-hover:opacity-100 transition-opacity">
                        {icons.place && <RawImage src={icons.place} className="w-full" alt="Place" />}
                    </div>
                    <h3 className="font-sans text-4xl font-black uppercase mb-4 tracking-wide" style={{ color: accent }}>Le Refuge</h3>
                    <p className="text-2xl md:text-3xl font-light">{gouts?.lieu || 'Partout...'}</p>
                </div>
            </section>

            {/* MESSAGES & FOOTER */}
            <section className="snap-start w-full min-h-screen bg-black flex flex-col justify-between p-8 md:p-24">
                <div className="grid md:grid-cols-2 gap-16 md:gap-32 w-full max-w-7xl mx-auto flex-grow items-center">
                    <div className="no-print">
                        <h2 className="font-sans text-[6rem] font-black uppercase leading-[0.8] mb-12 text-white tracking-tight">
                            DERNIER<br /><span className="text-stroke">HOMMAGE</span>
                        </h2>
                        <MemorialCandles memoryId={memory.id} />
                    </div>
                    <div className="no-print bg-[#1A1A1A] p-8 md:p-12 rounded-3xl border border-white/5">
                        <MemorialGuestbook memoryId={memory.id} />
                    </div>
                </div>

                <footer className="w-full text-center border-t border-white/10 pt-12 mt-12 no-print">
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-[${accent}] hover:text-white transition-colors"
                    >
                        <Printer className="w-4 h-4" /> &nbsp; Version Papier
                    </button>
                </footer>
            </section>

        </div>
    );
}
