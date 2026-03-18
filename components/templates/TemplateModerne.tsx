'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Share2, Printer, MapPin, Music, Calendar } from 'lucide-react';
import { exportToPDF } from '@/utils/exportPdf';
import MemorialCandles from '@/components/memorial/Candles';
import MemorialGuestbook from '@/components/memorial/Guestbook';

interface TemplateProps {
    memory: any;
}

export default function TemplateModerne({ memory }: TemplateProps) {
    const { identite, repereBio, photoProfil, medias, gouts, bio } = memory.data || {};
    const [palette, setPalette] = useState<string[]>([]);
    const [icons, setIcons] = useState<Record<string, string>>({});

    // 1. Fetch Palette
    useEffect(() => {
        // Random seed for variety or derived from name/photo in real app
        const seeds = ['FF6B6B', '4ECDC4', '9D4EDD', 'FF9F1C', '2EC4B6'];
        const seed = seeds[Math.floor(Math.random() * seeds.length)];

        fetch(`/api/get-palette?hex=${seed}`).then(r => r.json()).then(data => {
            if (data.colors && data.colors.length >= 5) {
                setPalette(data.colors);
            }
        });
    }, []);

    // 2. CSS Variables for Palette
    const style = {
        '--color-primary': palette[0] || '#FF6B6B',
        '--color-secondary': palette[1] || '#4ECDC4',
        '--color-accent': palette[2] || '#FFE66D',
        '--color-text': palette[3] || '#1A535C',
        '--color-bg': palette[4] || '#F7FFF7',
    } as React.CSSProperties;

    const handleExport = () => {
        exportToPDF('modern-memorial', `memoire-${identite?.nom}-moderne`);
    };

    return (
        <div id="modern-memorial" className="font-sans min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col md:flex-row overflow-x-hidden" style={style}>

            <style jsx global>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    #modern-memorial { display: block !important; } /* Un-flex for print */
                    .sidebar { position: relative !important; width: 100% !important; height: auto !important; padding: 2cm !important; }
                    .content { width: 100% !important; padding: 2cm !important; }
                    .masonry-item { break-inside: avoid; }
                }
            `}</style>

            {/* SIDEBAR (Fixed / Left) */}
            <aside className="sidebar md:w-[30%] md:h-screen md:fixed md:left-0 md:top-0 bg-[var(--color-text)] text-white p-8 md:p-12 flex flex-col justify-between z-10 overflow-hidden relative">

                {/* Decorative Blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)] rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>

                <div className="relative z-10">
                    <div className="card-photo w-40 h-40 md:w-56 md:h-56 mx-auto md:mx-0 rounded-full border-8 border-[var(--color-secondary)] overflow-hidden shadow-xl mb-8 transform rotate-3 hover:rotate-0 transition-all duration-500">
                        <Image
                            src={photoProfil?.url || '/placeholder-portrait.jpg'}
                            alt={identite?.prenom}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight leading-none">
                        {identite?.prenom}<br />
                        <span className="text-[var(--color-secondary)]">{identite?.nom}</span>
                    </h1>

                    <p className="text-xl opacity-60 font-medium mb-12 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {repereBio?.dateNaissance} — {repereBio?.dateDeces}
                    </p>

                    {/* Character Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {(memory.data?.valeurs?.adjectifs || ['Généreux', 'Passionné']).map((adj: string, i: number) => (
                            <span key={i} className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-bold uppercase tracking-wider border border-white/20">
                                {adj}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 no-print">
                    <button onClick={handleExport} className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity">
                        <Printer className="w-4 h-4" /> Imprimer ce mémorial
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT (Scrollable / Right) */}
            <main className="content md:w-[70%] md:ml-[30%] p-8 md:p-20 relative">

                {/* Citation Hero */}
                {gouts?.phrase && (
                    <div className="mb-20 pt-10">
                        <blockquote className="text-3xl md:text-5xl font-bold leading-tight text-[var(--color-primary)] opacity-90">
                            "{gouts.phrase}"
                        </blockquote>
                    </div>
                )}

                {/* Récit */}
                <section className="mb-24 prose prose-xl max-w-none prose-headings:font-bold prose-headings:text-[var(--color-text)]">
                    <div className="columns-1 md:columns-2 gap-12 space-y-8 text-lg md:text-xl leading-relaxed text-[var(--color-text)]/80">
                        {memory.bio ? (
                            memory.bio.split('\n').map((p: string, i: number) => (
                                <p key={i} className={`mb-6 ${i === 0 ? 'first-letter:text-6xl first-letter:font-black first-letter:text-[var(--color-secondary)] first-letter:float-left first-letter:mr-4' : ''}`}>
                                    {p}
                                </p>
                            ))
                        ) : <p>Récit en attente...</p>}
                    </div>
                </section>

                {/* Masonry Gallery */}
                {medias && medias.length > 0 && (
                    <section className="mb-24">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
                            <span className="w-8 h-8 rounded-lg bg-[var(--color-accent)]"></span>
                            Souvenirs en images
                        </h2>

                        <div className="columns-2 md:columns-3 gap-4 space-y-4">
                            {medias.map((media: any, i: number) => (
                                <div key={i} className="masonry-item break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                                    <Image
                                        src={media.url}
                                        alt="Souvenir"
                                        width={500}
                                        height={500} // Aspect ratio is handled by w-full but height needs specific logic or style. Using standard Image with w-full h-auto via CSS is tricky in Next.js Image component without fill.
                                        className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        style={{ height: 'auto', position: 'relative' }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Timeline / Attributes */}
                <section className="mb-24 print:break-inside-avoid">
                    <h2 className="text-3xl font-bold mb-12 flex items-center gap-4">
                        <span className="w-8 h-8 rounded-lg bg-[var(--color-primary)]"></span>
                        Ce qui l'animait
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Box 1 */}
                        <div className="p-8 rounded-3xl bg-white shadow-lg border-l-8 border-[var(--color-secondary)] hover:-translate-y-2 transition-transform">
                            <div className="flex items-center gap-4 mb-4 text-[var(--color-text)]/50 font-bold uppercase tracking-widest text-sm">
                                <Music className="w-5 h-5" /> Musique
                            </div>
                            <p className="text-2xl font-bold">{gouts?.musique || '...'}</p>
                        </div>

                        {/* Box 2 */}
                        <div className="p-8 rounded-3xl bg-white shadow-lg border-l-8 border-[var(--color-primary)] hover:-translate-y-2 transition-transform">
                            <div className="flex items-center gap-4 mb-4 text-[var(--color-text)]/50 font-bold uppercase tracking-widest text-sm">
                                <MapPin className="w-5 h-5" /> Lieu
                            </div>
                            <p className="text-2xl font-bold">{gouts?.lieu || '...'}</p>
                        </div>
                    </div>
                </section>

                {/* Candles & Messages */}
                <div className="no-print grid md:grid-cols-2 gap-12">
                    <div className="bg-[var(--color-text)] text-white p-12 rounded-[2rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                        <h3 className="text-2xl font-bold mb-8">Allumer une bougie</h3>
                        <MemorialCandles memoryId={memory.id} />
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold mb-8">Livre d'or</h3>
                        <MemorialGuestbook memoryId={memory.id} />
                    </div>
                </div>

                {/* Footer simple for print */}
                <div className="hidden print:block mt-20 pt-8 border-t border-[var(--color-text)]/20 text-center text-sm opacity-50">
                    Mémorial créé sur Commun Vivant
                </div>

            </main>
        </div>
    );
}
