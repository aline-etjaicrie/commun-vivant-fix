'use client';

import {
    FileText, Image as ImageIcon, Music, MapPin, Flame, HelpCircle,
    Heart, Sparkles, Flower, Star, Sun, Moon, Cloud, Waves, Leaf,
    Mic, Headphones, Book, BookOpen, PenTool, PenLine, Palette,
    Camera, Video, Bird, Home, Compass, Globe, Clock, History, Gift,
    Trophy, Coffee, Utensils, GlassWater, Wine, Church, Infinity,
    Smile, Users, Baby, Crown, Diamond, Gem, Key, Lock, Lightbulb,
    Rocket, Plane, Bike, Car, Milestone, Award, TreeDeciduous,
    TreePine, Mountain, Anchor, Ship, Sailboat, Flower2, Cat, Dog
} from 'lucide-react';

const ICON_COMPONENTS: Record<string, React.ElementType> = {
    Heart, Sparkles, Flower, Flower2, Star, Sun, Moon, Cloud, Waves,
    Leaf, TreeDeciduous, TreePine, Mountain, Anchor, Ship, Sailboat,
    Music, Mic, Headphones, Book, BookOpen, PenTool, PenLine, Palette,
    Camera, Video, Image: ImageIcon, Flame, Bird, Cat, Dog,
    Home, MapPin, Compass, Globe, Clock, History, Gift, Trophy,
    Coffee, Utensils, GlassWater, Wine, Church, Infinity,
    Smile, Users, Baby, Crown, Diamond, Gem, Key, Lock, Lightbulb,
    Rocket, Plane, Bike, Car, Milestone, Award
};
import VirtualCandle from './VirtualCandle';
import Image from 'next/image';

interface MemorialPreviewProps {
    templateId: string;
    palette: any;
    fontId: string;
    filterId: string;
    blocks: string[]; // Order of block IDs
    textStyle: 'sobre' | 'narratif' | 'poetique';
    blockIcons?: Record<string, string>;
    customData?: {
        name?: string;
        birthDate?: string;
        deathDate?: string;
        bio?: string;
        photo?: string;
    }
}

// Contenus factices pour les 3 styles d'écriture
const TEXT_VARIANTS = {
    sobre: {
        title: "En mémoire de Marie",
        intro: "Marie Dubois nous a quittés le 15 janvier 2026.",
        body: "Elle aimait la simplicité, les repas en famille et ses promenades quotidiennes. Femme de caractère et de cœur, elle laisse derrière elle ses enfants, ses petits-enfants et de nombreux amis qui ne l'oublieront pas."
    },
    narratif: {
        title: "Le livre de sa vie",
        intro: "C'était un matin d'hiver, calme comme elle les aimait.",
        body: "Marie a traversé la vie comme on traverse un jardin : en prenant le temps d'admirer chaque saison. De son enfance en Bretagne à ses années d'enseignement, elle a marqué chacun de nous par sa capacité à écouter. Elle disait souvent que le bonheur se cachait dans les détails."
    },
    poetique: {
        title: "L'éclat d'une étoile",
        intro: "Elle est partie rejoindre la lumière qu'elle portait en elle.",
        body: "Comme une mélodie douce qui reste suspendue dans l'air après la dernière note, Marie continue de vibrer en nous. Sa générosité était un océan, son rire un phare dans la nuit. Elle chemine désormais sur d'autres rives, apaisée et éternelle."
    }
};

export default function MemorialPreview({ templateId, palette, fontId, filterId, blocks, textStyle, blockIcons, customData }: MemorialPreviewProps) {

    const defaultContent = TEXT_VARIANTS[textStyle] || TEXT_VARIANTS['sobre'];

    // Override text content if customData is present
    const textContent = {
        title: customData?.name ? `En mémoire de ${customData.name}` : defaultContent.title,
        intro: customData?.bio ? "Une vie, une histoire..." : defaultContent.intro,
        body: customData?.bio || defaultContent.body
    };

    const name = customData?.name || "Marie Dubois";
    const dates = (customData?.birthDate && customData?.deathDate)
        ? `${new Date(customData.birthDate).getFullYear()} — ${new Date(customData.deathDate).getFullYear()}`
        : "1945 — 2026";

    // Fonction utilitaire pour le style des photos
    const getFilterStyle = () => {
        switch (filterId) {
            case 'sepia': return 'sepia(80%)';
            case 'bw': return 'grayscale(100%)';
            case 'vintage': return 'sepia(40%) contrast(1.2) brightness(0.9)'; // Fixed typo 'bightness'
            default: return 'none';
        }
    };

    const getFontFamily = () => {
        switch (fontId) {
            case 'serif': return 'font-serif';
            case 'sans': return 'font-sans';
            case 'calli': return 'font-calli italic'; // Use CSS var or class
            default: return 'font-serif';
        }
    };

    // --- RENDERERS POUR CHAQUE BLOC ---

    const renderHeader = () => (
        <div key="header" className={`text-center mb-12 animate-fade-in ${templateId === 'magazine' ? 'col-span-full mb-16' : ''}`}>
            {templateId === 'modern' ? (
                <div className="relative h-64 w-full mb-8 overflow-hidden rounded-b-3xl">
                    <div className={`absolute inset-0 opacity-40`} style={{ backgroundColor: palette.secondary }}></div>
                    <div className="absolute inset-0 flex items-end justify-center pb-8 z-10">
                        <h1 className={`text-5xl md:text-7xl font-bold text-white drop-shadow-lg ${getFontFamily()}`}>
                            {name}
                        </h1>
                    </div>
                </div>
            ) : templateId === 'magazine' ? (
                <div className="border-b-4 border-black pb-8 mb-8">
                    <div className="text-center uppercase tracking-[0.4em] text-xs font-bold mb-4" style={{ color: palette.secondary }}>Édition Spéciale — Mémoire & Transmission</div>
                    <h1 className={`text-7xl md:text-9xl font-black tracking-tighter leading-none mb-2 ${getFontFamily()}`} style={{ color: palette.primary }}>
                        {name.toUpperCase()}
                    </h1>
                    <div className="flex justify-between items-center border-t border-black pt-2 mt-4 text-xs font-serif italic">
                        <span>{dates}</span>
                        <span>Une vie, une histoire</span>
                        <span>N° 001</span>
                    </div>
                </div>
            ) : (
                <>
                    <p className="text-sm uppercase tracking-[0.2em] mb-4 opacity-60" style={{ color: palette.secondary }}>{dates}</p>
                    <h1 className={`text-5xl md:text-6xl mb-6 ${getFontFamily()}`} style={{ color: palette.primary }}>
                        {name}
                    </h1>
                    <div className="w-24 h-1 mx-auto" style={{ backgroundColor: palette.secondary }} />
                </>
            )}
        </div>
    );

    const renderPhoto = () => (
        <div key="photo" className={`mb-12 relative group animate-slide-up ${templateId === 'magazine' ? 'col-span-1 md:col-span-2' : ''}`}>
            <div className={`relative mx-auto aspect-square md:aspect-[4/3] w-full max-w-2xl overflow-hidden shadow-xl
        ${templateId === 'warm' ? 'rounded-[3rem] border-8 border-white' : ''}
        ${templateId === 'classic' ? 'rounded-sm border-4 border-double' : ''}
        ${templateId === 'modern' ? 'rounded-xl' : ''}
        ${templateId === 'magazine' ? 'aspect-[3/4] md:aspect-auto h-full grayscale hover:grayscale-0 transition-all duration-700' : ''}
      `}
                style={{ borderColor: templateId === 'classic' ? palette.secondary : 'white' }}
            >
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center text-gray-400">
                    {/* Placeholder img setup */}
                    <Image
                        src={customData?.photo || "/image-site2.png"}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        style={{ filter: getFilterStyle() }}
                    />
                </div>
            </div>
            {templateId === 'classic' && (
                <div className="text-center mt-4 text-xs italic opacity-60">
                    Souvenir heureux, Été 2024
                </div>
            )}
        </div>
    );

    const renderText = () => (
        <div key="text" className={`mb-12 mx-auto px-6 animate-slide-up-delay ${templateId === 'magazine' ? 'col-span-1 md:col-span-1 text-justify' : 'max-w-3xl'}`}>
            <div className={`p-8 md:p-12
        ${templateId === 'warm' ? 'bg-white/60 rounded-3xl shadow-sm backdrop-blur-sm' : ''}
        ${templateId === 'modern' ? 'border-l-4 pl-8' : ''}
        ${templateId === 'magazine' ? 'p-0' : ''}
      `}
                style={{ borderColor: templateId === 'modern' ? palette.secondary : 'transparent' }}
            >
                <h2 className={`text-2xl mb-6 ${getFontFamily()} ${templateId === 'magazine' ? 'font-bold uppercase tracking-tight text-4xl' : ''}`} style={{ color: palette.primary }}>
                    {textContent.title}
                </h2>
                <p className={`text-lg leading-relaxed mb-4 font-medium opacity-80 ${templateId === 'magazine' ? 'first-letter:text-7xl first-letter:float-left first-letter:mr-3 first-letter:font-serif' : ''}`} style={{ color: palette.primary }}>
                    {textContent.intro}
                </p>
                <p className="text-lg leading-relaxed opacity-70 whitespace-pre-wrap" style={{ color: palette.primary }}>
                    {textContent.body}
                </p>
            </div>
        </div>
    );

    const renderCandle = () => (
        <div key="candle" className={`mb-12 text-center animate-fade-in ${templateId === 'magazine' ? 'col-span-1 flex flex-col justify-center bg-black/5 p-8' : ''}`}>
            <div className={`inline-block p-8 min-w-[300px]
          ${templateId === 'warm' ? 'bg-gradient-to-t from-orange-50 to-transparent rounded-full' : ''}
        `}>
                <div className="flex justify-center mb-6">
                    <DynamicIcon
                        name={blockIcons?.candle}
                        className="w-8 h-8 opacity-40"
                        fallback={Flame}
                    />
                </div>
                <VirtualCandle />
                <p className="mt-4 text-sm font-medium tracking-wide opacity-50" style={{ color: palette.primary }}>
                    Déposer une flamme
                </p>
            </div>
        </div>
    );

    const renderGallery = () => (
        <div key="gallery" className={`mb-12 px-4 ${templateId === 'magazine' ? 'col-span-full border-t-2 border-black pt-8' : ''}`}>
            <h3 className="text-center text-sm uppercase tracking-widest mb-8 opacity-50 flex items-center justify-center gap-2">
                <DynamicIcon name={blockIcons?.gallery} className="w-4 h-4" fallback={ImageIcon} />
                Galerie Souvenir
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {[1, 2, 3].map((i) => (
                    <div key={i} className={`aspect-square relative overflow-hidden bg-gray-100 ${templateId === 'warm' ? 'rounded-2xl' : ''}`}>
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                            <ImageIcon className="w-8 h-8 opacity-50" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderMusic = () => (
        <div key="music" className={`mb-12 animate-fade-in ${templateId === 'magazine' ? 'col-span-1 row-span-1' : 'max-w-md mx-auto'}`}>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center animate-spin-slow`} style={{ backgroundColor: palette.secondary }}>
                    <DynamicIcon name={blockIcons?.music} className="w-6 h-6 text-white" fallback={Music} />
                </div>
                <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider opacity-60">Morceau favori</p>
                    <p className="font-medium text-lg leading-none mt-1">La Bohème</p>
                    <p className="text-sm opacity-60">Charles Aznavour</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-black text-white text-xs">03:45</div>
            </div>
        </div>
    );

    const renderContact = () => (
        <div key="contact" className={`mb-12 animate-fade-in ${templateId === 'magazine' ? 'col-span-1 bg-white p-8 border border-gray-200' : 'max-w-md mx-auto text-center'}`}>
            <h3 className={`uppercase tracking-widest text-xs font-bold mb-4 flex items-center gap-2 ${templateId === 'magazine' ? 'text-left' : 'justify-center text-center'}`} style={{ color: palette.secondary }}>
                <DynamicIcon name={blockIcons?.contact} className="w-4 h-4" fallback={MapPin} />
                Contact Famille
            </h3>
            <div className={`space-y-2 text-sm ${templateId === 'magazine' ? 'text-left' : 'text-center'}`}>
                <p className="font-medium">Jean Dubois (Fils)</p>
                <p className="opacity-70">jean.dubois@email.com</p>
                <p className="opacity-70">+33 6 12 34 56 78</p>
                <button className="mt-4 px-4 py-2 bg-black text-white text-xs uppercase tracking-widest hover:bg-gray-800 transition">Envoyer un message</button>
            </div>
        </div>
    );

    const renderTree = () => (
        <div key="tree" className={`mb-12 animate-fade-in ${templateId === 'magazine' ? 'col-span-full py-12 bg-stone-50' : 'max-w-4xl mx-auto'}`}>
            <h3 className="text-center uppercase tracking-widest text-xs font-bold mb-8" style={{ color: palette.secondary }}>Arbre Généalogique</h3>
            <div className="flex flex-col items-center gap-8 opacity-80">
                {/* Mock Tree Visual */}
                <div className="flex gap-16">
                    <div className="text-center"><div className="w-16 h-16 rounded-full bg-gray-200 mb-2 mx-auto"></div><span className="text-xs font-bold">Pierre</span></div>
                    <div className="text-center"><div className="w-16 h-16 rounded-full bg-gray-200 mb-2 mx-auto"></div><span className="text-xs font-bold">Jeanne</span></div>
                </div>
                <div className="w-0.5 h-8 bg-gray-300"></div>
                <div className="p-4 border-2 border-double border-gray-300 rounded-xl bg-white relative">
                    <div className="text-center font-bold text-xl">Marie Dubois</div>
                    <div className="text-center text-xs opacity-60">1945 - 2026</div>
                </div>
                <div className="w-0.5 h-8 bg-gray-300"></div>
                <div className="flex gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-gray-300"></div>)}
                </div>
            </div>
        </div>
    );

    const renderFreeText = () => (
        <div key="free_text" className={`mb-12 animate-fade-in ${templateId === 'magazine' ? 'col-span-1 bg-yellow-50 p-6 rotate-1' : 'max-w-2xl mx-auto px-6'}`}>
            <div className="relative">
                <span className="absolute -top-4 -left-2 text-6xl opacity-10 font-serif">"</span>
                <p className="text-lg italic leading-relaxed text-gray-800 font-serif text-center">
                    Merci d'avoir été cette lumière dans nos vies. Ton jardin restera toujours le plus beau des refuges.
                </p>
                <p className="text-right text-xs font-bold mt-4 uppercase">— Les Voisins de la rue des Lilas</p>
            </div>
        </div>
    );

    // Map des renderers
    const renderers: Record<string, () => JSX.Element> = {
        'header': renderHeader,
        'photo': renderPhoto,
        'text': renderText,
        'candle': renderCandle,
        'gallery': renderGallery,
        'music': renderMusic,
        'contact': renderContact,
        'tree': renderTree,
        'free_text': renderFreeText
    };

    // Helper for dynamic icons
    const DynamicIcon = ({ name, className, fallback: Fallback }: { name?: string, className?: string, fallback: any }) => {
        const iconToUse = name ? ICON_COMPONENTS[name] : null;
        if (!iconToUse) return <Fallback className={className} />;
        const IconComponent = iconToUse;
        return <IconComponent className={className} />;
    };

    return (
        <div
            className={`min-h-[1000px] w-full transition-colors duration-500 shadow-2xl relative overflow-hidden
        ${templateId === 'classic' ? 'max-w-4xl mx-auto my-8 bg-white' : ''}
        ${templateId === 'modern' ? 'max-w-full bg-white' : ''}
        ${templateId === 'warm' ? 'max-w-5xl mx-auto my-8 rounded-[3rem]' : ''}
        ${templateId === 'magazine' ? 'max-w-[1400px] mx-auto bg-white' : ''}
      `}
            style={{ backgroundColor: palette.bg }}
        >
            {/* Texture de fond subtile pour le style Warm */}
            {templateId === 'warm' && (
                <div className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{ backgroundImage: `radial-gradient(${palette.secondary} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
                />
            )}

            {/* Contenu dynamique dans l'ordre défini */}
            <div className={`py-12 md:py-20 relative z-10 
         ${templateId === 'magazine' ? 'grid grid-cols-1 md:grid-cols-3 gap-8 px-8 md:px-16' : ''}
      `}>
                {blocks.map(blockId => renderers[blockId] ? renderers[blockId]() : null)}
            </div>

            {/* Footer simple */}
            <div className={`text-center pb-8 opacity-40 text-xs ${templateId === 'magazine' ? 'col-span-full border-t border-gray-200 mt-12 pt-8' : ''}`}>
                <p>Mémorial créé avec Et j'ai crié</p>
            </div>
        </div>
    );
}
