'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Box, Flame, ArrowLeft } from 'lucide-react';

export default function SelectionPage() {
    const cards = [
        {
            id: 'celebration',
            title: "Fêter",
            description: "Raconter l'histoire de quelqu'un pour célébrer une naissance, un anniversaire, un départ à la retraite...",
            image: "/bave-pictures-eQhaGaMBIg8-unsplash.jpg",
            icon: <Sparkles className="w-7 h-7" />,
            color: "gold",
            cta: "Créer un espace de célébration"
        },
        {
            id: 'heritage',
            title: "Transmettre",
            description: "Créer son espace biographique, raconter sa vie, ses objets, ses patrimoines à léguer.",
            image: "/sofatutor-4syO0fP1Bf0-unsplash.jpg",
            icon: <Box className="w-7 h-7" />,
            color: "neon",
            cta: "Raconter ses mémoires"
        },
        {
            id: 'funeral',
            title: "Honorer",
            description: "Rendre hommage à une personne disparue avec dignité et pudeur.",
            image: "/photo-roman-kraft-unsplash.jpg",
            icon: <Flame className="w-7 h-7" />,
            color: "blue",
            cta: "Créer un mémorial"
        }
    ];

    return (
        <div className="min-h-screen bg-memoir-blue/5 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-7xl">
                <div className="mb-12 text-center relative z-10">
                    <Link href="/dashboard" className="absolute left-0 top-1/2 -translate-y-1/2 text-memoir-blue/60 hover:text-memoir-blue transition-colors flex items-center gap-2">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden md:inline">Retour</span>
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-serif italic text-memoir-blue mb-4">Que souhaitez-vous créer ?</h1>
                    <p className="text-memoir-blue/60 text-lg">Choisissez le type de Commun qui correspond à votre intention.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {cards.map((card, index) => {
                        const borderColor = {
                            gold: "border-memoir-gold hover:border-memoir-gold/80",
                            neon: "border-memoir-neon hover:border-memoir-neon/80",
                            blue: "border-memoir-blue hover:border-memoir-blue/80"
                        }[card.color];

                        const textColor = {
                            gold: "text-memoir-gold hover:bg-memoir-gold hover:text-white",
                            neon: "text-memoir-neon hover:bg-memoir-neon hover:text-white",
                            blue: "text-memoir-blue hover:bg-memoir-blue hover:text-white"
                        }[card.color] || "text-memoir-blue hover:bg-memoir-blue hover:text-white";

                        const iconBgColor = {
                            gold: "text-memoir-gold",
                            neon: "text-memoir-neon",
                            blue: "text-memoir-blue"
                        }[card.color];


                        return (
                            <div
                                key={index}
                                className={`bg-white rounded-[32px] overflow-hidden shadow-lg ${borderColor} border-2 transition-all hover:shadow-xl group flex flex-col`}
                            >
                                <div className="relative h-64 overflow-hidden shrink-0">
                                    <Image
                                        src={card.image}
                                        alt={card.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                    <div className={`absolute top-4 right-4 bg-white/90 p-3 rounded-full shadow-lg ${iconBgColor}`}>
                                        {card.icon}
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-grow">
                                    <h3 className="text-2xl font-serif italic text-memoir-blue mb-4">{card.title}</h3>
                                    <p className="text-memoir-blue/80 mb-8 leading-relaxed flex-grow">{card.description}</p>
                                    <Link
                                        href={`/create/packs?context=${card.id}`}
                                        className={`block w-full py-4 text-center border-2 font-bold rounded-xl transition-all ${textColor}`}
                                    >
                                        {card.cta}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
