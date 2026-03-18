'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Share2, Download, PenLine, Printer } from 'lucide-react';
import { exportToPDF } from '@/utils/exportPdf';
import MemorialCandles from '@/components/memorial/Candles';
import MemorialGuestbook from '@/components/memorial/Guestbook';
import GalleryBlock from '@/components/memorial-blocks/GalleryBlock';
import RawImage from '@/components/RawImage';

interface TemplateProps {
    memory: any; // Using any for flexibility, optimally Memorial interface
    isPreview?: boolean;
}

export default function TemplateClassique({ memory, isPreview = false }: TemplateProps) {
    const { identite, repereBio, photoProfil, medias, gouts, bio } = memory.data || {};
    const [icons, setIcons] = useState<Record<string, string>>({});

    // Colors
    const primaryColor = '#2B5F7D'; // Accent blue
    const textColor = '#1A1A1A';
    const bgColor = '#FFFFFF';

    // Fetch Icons (Noun Project)
    useEffect(() => {
        if (isPreview) return; // Skip API calls in preview mode
        const fetchIcon = async (keyword: string, key: string) => {
            try {
                const res = await fetch(`/api/get-icon?keyword=${keyword}`);
                const data = await res.json();
                if (data.iconUrl) {
                    setIcons(prev => ({ ...prev, [key]: data.iconUrl }));
                }
            } catch (e) {
                console.error('Icon fetch failed', e);
            }
        };
        fetchIcon('music', 'music');
        fetchIcon('location', 'place');
        fetchIcon('spring', 'season'); // Defaulting to spring for example
    }, [isPreview]);

    const handleExport = () => {
        exportToPDF('memorial-content', `memoire-${identite?.nom || 'defunt'}`);
    };

    return (
        <div id="memorial-content" className="min-h-screen bg-white text-stone-900 font-serif">

            {/* Global Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { size: A4; margin: 2cm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .page-break { page-break-before: always; }
                    section { page-break-inside: avoid; }
                }
            `}</style>

            {/* HEADER */}
            <header className="max-w-[800px] mx-auto pt-16 pb-12 px-8 text-center">
                <div className="w-32 h-1 bg-[#2B5F7D] mx-auto mb-12"></div>

                {/* Photo */}
                <div className="mb-10 relative w-64 h-64 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-white ring-1 ring-stone-200">
                    <Image
                        src={photoProfil?.url || '/placeholder-portrait.jpg'}
                        alt={identite?.prenom}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <h1 className="text-5xl md:text-6xl font-serif text-[#1A1A1A] mb-4 tracking-tight">
                    {identite?.prenom} {identite?.nom}
                </h1>

                <p className="text-xl font-sans text-[#2B5F7D] uppercase tracking-widest mb-8">
                    {repereBio?.dateNaissance} — {repereBio?.dateDeces}
                </p>

                {gouts?.phrase && (
                    <blockquote className="text-2xl italic text-stone-500 max-w-lg mx-auto leading-relaxed border-t border-b border-stone-100 py-6 my-8">
                        "{gouts.phrase}"
                    </blockquote>
                )}
            </header>

            {/* RECIT */}
            <section className="max-w-[800px] mx-auto px-8 mb-24 print:mb-12">
                <div className="prose prose-lg prose-stone mx-auto text-justify leading-loose first-letter:text-5xl first-letter:text-[#2B5F7D] first-letter:font-bold first-letter:float-left first-letter:mr-3">
                    {memory.bio?.split('\n').map((p: string, i: number) => (
                        <p key={i} className="mb-6">{p}</p>
                    )) || <p className="text-stone-400 italic text-center">Récit en cours de rédaction...</p>}
                </div>
            </section>

            {/* GALERIE */}
            {medias && medias.length > 0 && (
                <section className="bg-stone-50 py-20 print:bg-white print:py-4">
                    <div className="max-w-[1000px] mx-auto px-8">
                        <h2 className="text-center text-sm font-sans font-bold text-[#2B5F7D] uppercase tracking-widest mb-12 flex items-center justify-center gap-4">
                            <span className="w-12 h-px bg-[#2B5F7D]/30"></span>
                            Galerie Souvenirs
                            <span className="w-12 h-px bg-[#2B5F7D]/30"></span>
                        </h2>
                        {/* Using GalleryBlock with specific classic template props */}
                        <GalleryBlock
                            medias={medias}
                            template={{ colors: { accent: '#2B5F7D', text: '#1A1A1A', bg: '#F5F5F4' } }}
                            isLightBg={true}
                            photoFilter="bw" // Classic uses B&W often? Or original. Let's stick to original or optional.
                        />
                    </div>
                </section>
            )}

            {/* ATTRIBUTS (Iconography) */}
            <section className="max-w-[800px] mx-auto px-8 py-20 print:page-break">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* CARD 1 */}
                    <div className="border border-stone-200 p-8 text-center rounded-sm">
                        <div className="w-12 h-12 mx-auto mb-4 opacity-80">
                            {icons.music ? (
                                <RawImage src={icons.music} alt="Music" className="w-full h-full" />
                            ) : (
                                <div className="w-full h-full bg-stone-100 rounded-full"></div> // Fallback or SVG
                            )}
                        </div>
                        <h3 className="text-xs font-sans font-bold uppercase text-stone-400 mb-2">Musique</h3>
                        <p className="font-serif text-lg">{gouts?.musique || 'Non renseigné'}</p>
                    </div>

                    {/* CARD 2 */}
                    <div className="border border-stone-200 p-8 text-center rounded-sm">
                        <div className="w-12 h-12 mx-auto mb-4 opacity-80">
                            {icons.place ? (
                                <RawImage src={icons.place} alt="Place" className="w-full h-full" />
                            ) : (
                                <div className="w-full h-full bg-stone-100 rounded-full"></div>
                            )}
                        </div>
                        <h3 className="text-xs font-sans font-bold uppercase text-stone-400 mb-2">Lieu</h3>
                        <p className="font-serif text-lg">{gouts?.lieu || 'Non renseigné'}</p>
                    </div>

                    {/* CARD 3 */}
                    <div className="border border-stone-200 p-8 text-center rounded-sm">
                        <div className="w-12 h-12 mx-auto mb-4 opacity-80">
                            {icons.season ? (
                                <RawImage src={icons.season} alt="Season" className="w-full h-full" />
                            ) : (
                                <div className="w-full h-full bg-stone-100 rounded-full"></div>
                            )}
                        </div>
                        <h3 className="text-xs font-sans font-bold uppercase text-stone-400 mb-2">Saison</h3>
                        <p className="font-serif text-lg">{gouts?.saison || 'Non renseigné'}</p>
                    </div>
                </div>
            </section>

            {/* BOUGIES & LIVRE D'OR (Non-print) */}
            <div className="no-print bg-[#2B5F7D]/5 py-24 border-t border-[#2B5F7D]/10">
                <section className="max-w-[800px] mx-auto px-8 mb-20 text-center">
                    <h2 className="text-[#2B5F7D] font-serif text-3xl mb-8">Une pensée, une lumière</h2>
                    <MemorialCandles memoryId={memory.id} />
                </section>

                <section className="max-w-[800px] mx-auto px-8">
                    <MemorialGuestbook memoryId={memory.id} />
                </section>
            </div>

            {/* FOOTER */}
            <footer className="bg-white border-t border-stone-100 py-12 text-center no-print">
                <div className="flex justify-center gap-6 mb-8">
                    <button className="flex items-center gap-2 px-6 py-3 border rounded-full hover:bg-stone-50 transition-colors text-sm font-sans uppercase tracking-widest">
                        <Share2 className="w-4 h-4" /> Partager
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-3 bg-[#2B5F7D] text-white rounded-full hover:bg-[#234e66] transition-colors text-sm font-sans uppercase tracking-widest"
                    >
                        <Printer className="w-4 h-4" /> Imprimer / PDF
                    </button>
                </div>
                <p className="text-xs text-stone-300 uppercase tracking-[0.2em]">Commun Vivant</p>
            </footer>

        </div>
    );
}
