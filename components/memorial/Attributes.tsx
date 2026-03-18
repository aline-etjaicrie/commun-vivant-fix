'use client';

import { Music, MapPin, Quote, Coffee, Sun } from 'lucide-react';

export default function MemorialAttributes({ gouts, attributes }: { gouts: any, attributes: any }) {
    if (!gouts && !attributes) return null;

    const items = [
        { icon: Music, label: 'Musique', value: gouts?.musique || attributes.musique },
        { icon: Quote, label: 'Phrase', value: gouts?.phrase || attributes.phrase },
        { icon: MapPin, label: 'Lieu', value: gouts?.lieu || attributes.lieu },
        { icon: Coffee, label: 'Habitude', value: gouts?.habitude || attributes.habitude },
        { icon: Sun, label: 'Saison', value: gouts?.saison || attributes.saison },
    ].filter(item => item.value);

    if (items.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
            {items.map((item, index) => {
                const Icon = item.icon;
                return (
                    <div key={index} className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-[#D4AF37]/10 hover:shadow-md transition-all hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-full bg-[#FDFBF7] flex items-center justify-center mb-6">
                            <Icon className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
                        </div>
                        <span className="text-xs uppercase tracking-[0.2em] text-[#1A1A2E]/40 mb-3 font-semibold">{item.label}</span>
                        <p className="text-lg font-serif italic text-[#1A1A2E]/80 leading-relaxed">
                            "{item.value}"
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
