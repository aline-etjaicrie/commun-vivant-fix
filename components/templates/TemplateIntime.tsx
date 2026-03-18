'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Share2, Printer, MapPin, Music } from 'lucide-react';
import { exportToPDF } from '@/utils/exportPdf';
import MemorialCandles from '@/components/memorial/Candles';
import MemorialGuestbook from '@/components/memorial/Guestbook';
import RawImage from '@/components/RawImage';

interface TemplateProps {
    memory: any;
}

export default function TemplateIntime({ memory }: TemplateProps) {
    const { identite, repereBio, photoProfil, medias, gouts, bio } = memory.data || {};
    const [icons, setIcons] = useState<Record<string, string>>({});

    // Colors
    const paperColor = '#F5E6D3';
    const inkColor = '#4A3426'; // Dark Brown
    const accentColor = '#8B4513'; // Saddle Brown

    // Fetch Hand-drawn Icons
    useEffect(() => {
        const fetchIcon = async (keyword: string, key: string) => {
            try {
                // Appending "sketch" or "hand drawn" to query for style
                const res = await fetch(`/api/get-icon?keyword=${keyword} sketch`);
                const data = await res.json();
                if (data.iconUrl) {
                    setIcons(prev => ({ ...prev, [key]: data.iconUrl }));
                }
            } catch (e) {
                console.error('Icon fetch failed', e);
            }
        };
        fetchIcon('music note', 'music');
        fetchIcon('location pin', 'place');
        fetchIcon('sun', 'season');
    }, []);

    const handleExport = () => {
        exportToPDF('intime-memorial', `memoire-${identite?.nom}-intime`);
    };

    return (
        <div
            id="intime-memorial"
            className="font-serif min-h-screen relative overflow-hidden"
            style={{
                backgroundColor: paperColor,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
                color: inkColor
            }}
        >
            <style jsx global>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: #F5E6D3 !important; }
                    .no-print { display: none !important; }
                    .page-break { page-break-after: always; }
                    /* Remove rotation for better readability on print? Or keep for style. Keeping for style. */
                }
                .polaroid {
                    background: white;
                    padding: 12px 12px 40px 12px;
                    box-shadow: 2px 4px 8px rgba(0,0,0,0.2);
                    transition: transform 0.3s ease;
                }
                .polaroid:hover {
                    transform: scale(1.02) rotate(0deg) !important;
                    z-index: 10;
                }
                .tape {
                    background-color: rgba(255,255,255,0.4);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    position: absolute;
                    height: 30px;
                    width: 100px;
                    top: -10px;
                    left: 50%;
                    transform: translateX(-50%) rotate(-2deg);
                    z-index: 20;
                    backdrop-filter: blur(2px);
                }
            `}</style>

            <div className="max-w-4xl mx-auto p-8 md:p-16 relative">

                {/* Header Scrapbook */}
                <header className="mb-24 flex flex-col md:flex-row items-center gap-12 relative">

                    {/* Polaroid Photo */}
                    <div className="polaroid rotate-[-3deg] w-72 md:w-80 flex-shrink-0 relative">
                        <div className="tape"></div>
                        <div className="relative aspect-[4/5] bg-stone-200 overflow-hidden filter sepia-[0.2]">
                            <Image
                                src={photoProfil?.url || '/placeholder-portrait.jpg'}
                                alt={identite?.prenom}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <p className="font-calli italic text-center mt-4 text-2xl opacity-80" style={{ color: inkColor }}>
                            {identite?.prenom}, {repereBio?.dateNaissance?.split(' ').pop()}
                        </p>
                    </div>

                    <div className="text-center md:text-left z-10">
                        <h1 className="font-calli italic text-6xl md:text-8xl mb-6 text-[#6B4423]" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.05)' }}>
                            {identite?.prenom} {identite?.nom}
                        </h1>
                        <div className="inline-block border-y-2 border-[#8B4513]/20 py-2 px-8">
                            <p className="text-xl md:text-2xl font-serif italic text-[#8B4513]">
                                {repereBio?.dateNaissance} — {repereBio?.dateDeces}
                            </p>
                        </div>
                    </div>

                </header>

                {/* Recit Background "Old Paper" */}
                {bio && (
                    <section className="mb-24 relative p-8 md:p-16 bg-[#FFF9F0] shadow-sm rotate-[1deg] mx-4 md:mx-0 border border-[#E8DCC5]">
                        {/* Paper texture overlay */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg cursor='default' width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238B4513' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")` }}></div>

                        {/* Pin */}
                        <div className="absolute -top-3 left-1/2 w-6 h-6 rounded-full bg-red-800 shadow-md border-2 border-white/50"></div>

                        <div className="prose prose-xl prose-stone max-w-none font-serif leading-loose text-justify text-[#5D4037]">
                            {bio.split('\n').map((p: string, i: number) => (
                                <p key={i} className="mb-6">{p}</p>
                            ))}
                        </div>
                    </section>
                )}

                {/* Gallery Scrapbook */}
                {medias && medias.length > 0 && (
                    <section className="mb-24">
                        <h2 className="font-calli italic text-5xl text-center mb-16 text-[#8B4513]">Souvenirs precieux</h2>

                        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                            {medias.map((media: any, i: number) => {
                                // Random rotation between -6 and 6
                                const rot = (i % 2 === 0 ? 3 : -2) * ((i % 3) + 1);
                                return (
                                    <div key={i} className="polaroid w-64 md:w-72" style={{ transform: `rotate(${rot}deg)` }}>
                                        <div className="relative aspect-square bg-stone-200 overflow-hidden filter sepia-[0.3]">
                                            <Image src={media.url} alt="Souvenir" fill className="object-cover" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Post-it Notes Attributes */}
                <section className="mb-24 grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 relative px-4">
                    {gouts?.musique && (
                        <div className="bg-[#FEF9C3] p-6 shadow-md rotate-[-2deg] transform transition-transform hover:scale-105 relative">
                            <div className="tape"></div>
                            <div className="w-10 h-10 mb-2 opacity-60">
                                {/* Icon */}
                                {icons.music && <RawImage src={icons.music} className="w-full" alt="music" style={{ filter: 'sepia(1)' }} />}
                            </div>
                            <h3 className="font-calli italic text-2xl mb-2 text-stone-600">Sa musique...</h3>
                            <p className="font-serif text-lg leading-relaxed">{gouts.musique}</p>
                        </div>
                    )}

                    {gouts?.lieu && (
                        <div className="bg-[#E0F2FE] p-6 shadow-md rotate-[1deg] transform transition-transform hover:scale-105 relative">
                            <div className="tape"></div>
                            <div className="w-10 h-10 mb-2 opacity-60">
                                {icons.place && <RawImage src={icons.place} className="w-full" alt="place" style={{ filter: 'sepia(1)' }} />}
                            </div>
                            <h3 className="font-calli italic text-2xl mb-2 text-stone-600">Son lieu...</h3>
                            <p className="font-serif text-lg leading-relaxed">{gouts.lieu}</p>
                        </div>
                    )}
                </section>

                {/* Envelope / Messages */}
                <div className="no-print bg-[#FDFBF7] p-8 md:p-12 rounded-lg shadow-inner border border-[#E8DCC5]">
                    <div className="text-center mb-12">
                        <h2 className="font-calli italic text-4xl mb-4 text-[#8B4513]">Livre d'Or</h2>
                        <p className="italic text-[#8B4513]/60">Laissez un petit mot doux...</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <MemorialCandles memoryId={memory.id} />
                            <div className="mt-8">
                                <MemorialGuestbook memoryId={memory.id} />
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            {/* Decorative envelope visual */}
                            <div className="w-64 h-48 bg-[#FFF] border-2 border-[#E8DCC5] relative flex items-center justify-center shadow-lg rotate-3">
                                <div className="absolute inset-0 border-t-[100px] border-x-[128px] border-b-[0px] border-transparent border-t-[#F5F5F5] origin-top"></div>
                                <span className="font-calli italic text-2xl text-stone-400 z-10 relative mt-20">Pour {identite?.prenom}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-20 text-center no-print pb-12">
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-3 px-8 py-3 bg-[#6B4423] text-[#F5E6D3] rounded shadow-md hover:bg-[#5D3A1E] transition-colors font-serif uppercase tracking-widest text-sm"
                    >
                        <Printer className="w-4 h-4" /> Imprimer le carnet
                    </button>
                </footer>

            </div>
        </div>
    );
}
