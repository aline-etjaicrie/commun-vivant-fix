'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
    ChevronLeft, Save, Eye, Type, Flame, Palette as PaletteIcon,
    Layout, ChevronUp, ChevronDown, Check, HelpCircle,
    Music, Image as ImageIcon, MapPin
} from 'lucide-react';
import MemorialPreview from '@/components/MemorialPreview';
import ValidationModal from '@/components/ValidationModal';

const LucideIconPicker = dynamic(() => import('@/components/LucideIconPicker'), {
    loading: () => <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>,
    ssr: false
});

const ICON_MAP: Record<string, React.ElementType> = {
    Flame, Music, Image: ImageIcon, MapPin, HelpCircle
};

const TEMPLATES = [
    {
        id: 'classic',
        name: 'Classique',
        description: 'Un design sobre et élégant',
        icon: <div className="w-full h-8 border border-gray-300 rounded flex items-center justify-center font-serif text-[8px]">Mémorial</div>
    },
    {
        id: 'modern',
        name: 'Moderne',
        description: 'Lignes épurées et minimalistes',
        icon: <div className="w-full h-8 bg-gray-200 rounded flex items-center justify-center font-sans font-bold text-[8px]">MARIE D.</div>
    },
    {
        id: 'warm',
        name: 'Douceur',
        description: 'Tons chauds et arrondis',
        icon: <div className="w-full h-8 bg-orange-100 rounded-lg flex items-center justify-center font-serif text-[8px] italic">Souvenirs</div>
    },
    {
        id: 'magazine',
        name: 'Magazine',
        description: 'Mise en page éditoriale complexe',
        icon: <div className="w-full h-8 border-2 border-black rounded flex items-center justify-center font-serif font-black text-[8px]">EDITION</div>
    },
];

const FONTS = [
    { id: 'serif', name: 'Élégant', css: 'font-serif' },
    { id: 'sans', name: 'Moderne', css: 'font-sans' },
];

const COLOR_PALETTES = [
    { id: 'navy-gold', name: 'Original', primary: '#0F2A44', secondary: '#C9A24D', bg: '#F5F4F2' },
    { id: 'forest', name: 'Nature', primary: '#2C5F2D', secondary: '#97BC62', bg: '#FAF9F7' },
    { id: 'slate', name: 'Pierre', primary: '#334155', secondary: '#94a3b8', bg: '#f8fafc' },
];

const FILTER_OPTIONS = [
    { id: 'none', name: 'Naturel' },
    { id: 'sepia', name: 'Sépia' },
    { id: 'bw', name: 'Noir & Blanc' },
    { id: 'vintage', name: 'Vintage' },
];

const TEXT_STYLES = [
    { id: 'sobre', name: 'Sobre', desc: 'Concis et factuel' },
    { id: 'narratif', name: 'Narratif', desc: 'Raconte une histoire' },
    { id: 'poetique', name: 'Poétique', desc: 'Image et métaphorique' },
];

export default function PersonalizePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    // STATES
    const [selectedTemplate, setSelectedTemplate] = useState('magazine'); // Default to new template for demo
    const [selectedFont, setSelectedFont] = useState('serif');
    const [selectedFilter, setSelectedFilter] = useState('none');
    const [selectedTextStyle, setSelectedTextStyle] = useState<'sobre' | 'narratif' | 'poetique'>('narratif');
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

    // Palette State (supports custom)
    const [palette, setPalette] = useState(COLOR_PALETTES[0]);
    const [isCustomColorMode, setIsCustomColorMode] = useState(false);

    // Blocks Order State
    const [blocks, setBlocks] = useState([
        'header',
        'photo',
        'text',
        'music',
        'tree',
        'contact',
        'gallery',
        'free_text',
        'candle'
    ]);

    // Icons State
    const [blockIcons, setBlockIcons] = useState<Record<string, string>>({
        'candle': 'Flame',
        'music': 'Music',
        'gallery': 'Image',
        'contact': 'MapPin'
    });

    const [activeIconPicker, setActiveIconPicker] = useState<string | null>(null);

    // Dynamic Icon Renderer
    const BlockIcon = ({ name, id }: { name?: string, id: string }) => {
        const iconName = blockIcons[id] || name || 'HelpCircle';
        const IconComponent = ICON_MAP[iconName] || HelpCircle;
        return <IconComponent className="w-3 h-3" />;
    };

    // Handlers
    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...blocks];
        if (direction === 'up' && index > 0) {
            [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
        } else if (direction === 'down' && index < blocks.length - 1) {
            [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
        }
        setBlocks(newBlocks);
    };

    const handleColorChange = (type: 'primary' | 'secondary' | 'bg', value: string) => {
        setPalette(prev => ({ ...prev, [type]: value, id: 'custom' }));
        setIsCustomColorMode(true);
    };

    const getBlockLabel = (id: string) => {
        switch (id) {
            case 'header': return 'En-tête (Nom)';
            case 'photo': return 'Photo Principale';
            case 'text': return 'Texte Hommage';
            case 'gallery': return 'Galerie Photos';
            case 'candle': return 'Espace Bougies';
            case 'music': return 'Lecteur Musique';
            case 'tree': return 'Arbre Généalogique';
            case 'contact': return 'Contact Famille';
            case 'free_text': return 'Témoignage (Texte Libre)';
            default: return id;
        }
    };

    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirmPublish = (accessLevel: 'open' | 'restricted' | 'later') => {
        setIsProcessing(true);
        // TODO: persister accessLevel et les préférences de personnalisation
        router.push(`/dashboard/${id}/publish`);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shrink-0 z-30 shadow-sm">
                <Link href={`/dashboard/${id}`} className="flex items-center gap-2 text-gray-600 hover:text-[#0F2A44] text-sm">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Retour</span>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs animate-pulse">
                        <Eye className="w-3 h-3" />
                        <span>Aperçu en temps réel</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsPublishModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium bg-[#0F2A44] text-white rounded-lg hover:bg-[#0F2A44]/90 transition-colors flex items-center gap-2 shadow-lg"
                >
                    <Save className="w-4 h-4" />
                    Enregistrer et Publier
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden">

                {/* --- LEFT SIDEBAR (CONTROLS) --- */}
                <div className="w-[380px] bg-white border-r border-gray-200 overflow-y-auto z-20 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                    <div className="p-6 space-y-8">

                        {/* 1. LAYOUT & TEMPLATE */}
                        <section>
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2 text-[#C9A24D]">
                                <Layout className="w-4 h-4" />
                                Mise en forme
                            </h3>

                            {/* Templates Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                                {TEMPLATES.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTemplate(t.id)}
                                        className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${selectedTemplate === t.id ? 'border-[#0F2A44] bg-[#0F2A44]/5' : 'border-gray-100 hover:border-gray-300'}`}
                                    >
                                        <div className="w-full aspect-video bg-white shadow-sm border border-gray-100 rounded flex items-center justify-center p-1">
                                            {t.icon}
                                        </div>
                                        <span className="text-[9px] font-medium text-center leading-tight">{t.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Blocks Reordering */}
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <p className="text-[10px] uppercase text-gray-500 font-semibold mb-2">Organisation de la page</p>
                                <div className="space-y-1">
                                    {blocks.map((blockId, index) => (
                                        <div key={blockId} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 text-xs group hover:border-[#C9A24D]/50 transition-colors">
                                            <div className="flex items-center gap-2">
                                                {['candle', 'music', 'gallery', 'contact'].includes(blockId) && (
                                                    <button
                                                        onClick={() => setActiveIconPicker(blockId)}
                                                        className="p-1.5 bg-gray-50 hover:bg-[#C9A24D]/10 rounded border border-gray-100 text-[#C9A24D] transition-colors"
                                                        title="Changer l'icône"
                                                    >
                                                        <BlockIcon id={blockId} />
                                                    </button>
                                                )}
                                                <span className="font-medium text-gray-700">{getBlockLabel(blockId)}</span>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => moveBlock(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                                >
                                                    <ChevronUp className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => moveBlock(index, 'down')}
                                                    disabled={index === blocks.length - 1}
                                                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                                >
                                                    <ChevronDown className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* 2. STYLE & COLORS */}
                        <section>
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2 text-[#C9A24D]">
                                <PaletteIcon className="w-4 h-4" />
                                Apparence
                            </h3>

                            <div className="space-y-4">
                                {/* Color Presets */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-2 block">Thèmes prédéfinis</label>
                                    <div className="flex gap-2">
                                        {COLOR_PALETTES.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setPalette(p);
                                                    setIsCustomColorMode(false);
                                                }}
                                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all ${palette.id === p.id && !isCustomColorMode ? 'ring-2 ring-offset-2 ring-[#0F2A44] scale-110' : 'border-gray-200'}`}
                                                title={p.name}
                                            >
                                                <div className="w-full h-full flex transform -rotate-45 scale-150">
                                                    <div className="flex-1" style={{ backgroundColor: p.primary }} />
                                                    <div className="flex-1" style={{ backgroundColor: p.secondary }} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Colors */}
                                <div className="bg-[#0F2A44]/5 p-3 rounded-lg border border-[#0F2A44]/10">
                                    <label className="text-xs text-[#0F2A44] font-medium mb-3 block flex items-center justify-between">
                                        Personnalisation avancée
                                        {isCustomColorMode && <span className="text-[10px] px-2 py-0.5 bg-[#0F2A44] text-white rounded-full">Active</span>}
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <span className="text-[10px] text-gray-500 block mb-1">Principal</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={palette.primary}
                                                    onChange={(e) => handleColorChange('primary', e.target.value)}
                                                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                                />
                                                <span className="text-[10px] font-mono opacity-50">{palette.primary}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-500 block mb-1">Secondaire</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={palette.secondary}
                                                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                                                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                                />
                                                <span className="text-[10px] font-mono opacity-50">{palette.secondary}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-2 border-t border-gray-200 pt-2 mt-1">
                                            <span className="text-[10px] text-gray-500 block mb-1">Arrière-plan de la page</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={palette.bg}
                                                    onChange={(e) => handleColorChange('bg', e.target.value)}
                                                    className="w-full h-8 rounded cursor-pointer border-0 p-0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Fonts */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-2 block">Typographie</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {FONTS.map(f => (
                                            <button
                                                key={f.id}
                                                onClick={() => setSelectedFont(f.id)}
                                                className={`px-3 py-2 text-sm border rounded-lg transition-all text-center ${selectedFont === f.id ? 'bg-[#0F2A44] text-white border-[#0F2A44]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                                            >
                                                <span className={f.css}>Abc</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* 3. CONTENT & FILTERS */}
                        <section>
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2 text-[#C9A24D]">
                                <Type className="w-4 h-4" />
                                Contenu
                            </h3>

                            {/* Text Style */}
                            <div className="mb-6">
                                <label className="text-xs text-gray-500 mb-2 block">Style du texte</label>
                                <div className="space-y-2">
                                    {TEXT_STYLES.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setSelectedTextStyle(s.id as any)}
                                            className={`w-full text-left px-3 py-2 rounded-lg border transition-all flex items-center justify-between ${selectedTextStyle === s.id ? 'border-[#C9A24D] bg-[#C9A24D]/10 text-[#0F2A44]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <span className="text-sm font-medium">{s.name}</span>
                                            {selectedTextStyle === s.id && <Check className="w-3 h-3" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Photo Filter */}
                            <div>
                                <label className="text-xs text-gray-500 mb-2 block">Filtre Photo</label>
                                <select
                                    value={selectedFilter}
                                    onChange={(e) => setSelectedFilter(e.target.value)}
                                    className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#C9A24D]"
                                >
                                    {FILTER_OPTIONS.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                        </section>

                    </div>
                </div>

                {/* --- MAIN PREVIEW --- */}
                <div className="flex-1 bg-gray-100/50 overflow-y-auto relative scrollbar-hide">
                    <div className="min-h-full py-12 px-4 md:px-12 flex justify-center items-start">
                        {/* The Renderer */}
                        <MemorialPreview
                            templateId={selectedTemplate}
                            palette={palette}
                            fontId={selectedFont}
                            filterId={selectedFilter}
                            blocks={blocks} // The sorted blocks
                            textStyle={selectedTextStyle}
                            blockIcons={blockIcons}
                        />
                    </div>
                </div>

            </div>

            {/* Icon Picker Modal */}
            {activeIconPicker && (
                <LucideIconPicker
                    currentIcon={blockIcons[activeIconPicker]}
                    onSelect={(iconName) => {
                        setBlockIcons(prev => ({ ...prev, [activeIconPicker]: iconName }));
                        setActiveIconPicker(null);
                    }}
                    onClose={() => setActiveIconPicker(null)}
                />
            )}

            {/* Validation Modal */}
            <ValidationModal
                isOpen={isPublishModalOpen}
                onClose={() => setIsPublishModalOpen(false)}
                onConfirm={handleConfirmPublish}
                isProcessing={isProcessing}
            />
        </div>
    );
}
