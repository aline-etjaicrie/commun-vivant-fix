'use client';

import { useState } from 'react';
import { Check, Layout, Palette, Image as ImageIcon, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface TemplateSelectorProps {
    memoryId: string;
    currentChoice?: string;
    onSave?: () => void;
}

export default function TemplateSelector({ memoryId, currentChoice = 'classique', onSave }: TemplateSelectorProps) {
    const supabase = createClient();
    const [selected, setSelected] = useState(currentChoice);
    const [saving, setSaving] = useState(false);

    const templates = [
        {
            id: 'classique',
            name: 'Classique',
            description: 'Sobre et élégant. Une mise en page traditionnelle centrée sur la lisibilité.',
            icon: BookOpen,
            color: 'bg-[#2B5F7D]',
            preview: (
                <div className="w-full h-32 bg-stone-50 border border-stone-200 p-2 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-stone-200 mt-2"></div>
                    <div className="w-20 h-2 bg-stone-300 rounded"></div>
                    <div className="w-full h-12 bg-white border border-stone-100 mt-1"></div>
                </div>
            )
        },
        {
            id: 'moderne',
            name: 'Moderne',
            description: 'Coloré et dynamique. Avec une barre latérale et une grille photo',
            icon: Layout,
            color: 'bg-[#FF6B6B]',
            preview: (
                <div className="w-full h-32 bg-white border border-stone-200 flex">
                    <div className="w-1/3 h-full bg-[#FF6B6B]/10 p-1 flex flex-col gap-1">
                        <div className="w-8 h-8 rounded-full bg-[#FF6B6B] mx-auto"></div>
                        <div className="w-full h-1 bg-[#FF6B6B]/20"></div>
                    </div>
                    <div className="w-2/3 p-2 flex flex-col gap-2">
                        <div className="w-full h-4 bg-stone-100"></div>
                        <div className="grid grid-cols-2 gap-1">
                            <div className="aspect-square bg-stone-200"></div>
                            <div className="aspect-square bg-stone-200"></div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'intime',
            name: 'Intime',
            description: 'Chaleureux. Style carnet de souvenirs et papier texturé.',
            icon: BookOpen, // Or similar
            color: 'bg-[#8B4513]',
            preview: (
                <div className="w-full h-32 bg-[#F5E6D3] border border-[#8B4513]/20 p-2 relative overflow-hidden">
                    <div className="absolute top-2 left-2 w-10 h-10 bg-white shadow rotate-[-5deg] p-1">
                        <div className="w-full h-full bg-stone-200"></div>
                    </div>
                    <div className="ml-14 mt-4 space-y-1">
                        <div className="w-full h-1 bg-[#8B4513]/20 rounded"></div>
                        <div className="w-3/4 h-1 bg-[#8B4513]/20 rounded"></div>
                    </div>
                </div>
            )
        },
        {
            id: 'galerie',
            name: 'Galerie',
            description: 'Immersif. Grand format pour mettre en valeur les photos.',
            icon: ImageIcon,
            color: 'bg-black',
            preview: (
                <div className="w-full h-32 bg-black flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
                    <h1 className="text-white text-xs font-bold z-20 uppercase tracking-widest">Titre</h1>
                </div>
            )
        }
    ];

    const handleSaveSelection = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('memories')
                .update({ template_choice: selected })
                .eq('id', memoryId);

            if (error) throw error;
            if (onSave) onSave();
        } catch (e) {
            console.error(e);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-stone-100">
            <h2 className="text-2xl font-serif text-[#1A1A2E] mb-2 text-center">Choisissez l'apparence</h2>
            <p className="text-center text-stone-500 mb-8">Quel style correspond le mieux à l'hommage que vous souhaitez rendre ?</p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {templates.map((t) => (
                    <div
                        key={t.id}
                        onClick={() => setSelected(t.id)}
                        className={`cursor-pointer group relative border-2 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${selected === t.id ? `border-[#D4AF37] ring-4 ring-[#D4AF37]/10` : 'border-transparent shadow-sm hover:shadow-md'}`}
                    >
                        {/* Selection Indicator */}
                        <div className={`absolute top-3 right-3 z-20 w-6 h-6 rounded-full flex items-center justify-center transition-all ${selected === t.id ? 'bg-[#D4AF37] text-white' : 'bg-white/50 text-transparent border border-stone-200'}`}>
                            <Check className="w-3 h-3" strokeWidth={3} />
                        </div>

                        {/* Preview Area */}
                        {t.preview}

                        {/* Info Area */}
                        <div className="p-4 bg-white flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${t.color} text-white bg-opacity-90`}>
                                <t.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#1A1A2E] flex items-center gap-2">
                                    {t.name}
                                </h3>
                                <p className="text-sm text-stone-500 mt-1 leading-snug">
                                    {t.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end border-t border-stone-100 pt-6">
                <button
                    onClick={handleSaveSelection}
                    disabled={saving}
                    className="px-8 py-3 bg-[#1A1A2E] text-white rounded-full font-bold shadow-lg hover:bg-[#1A1A2E]/90 transition-all flex items-center gap-2"
                >
                    {saving ? 'Sauvegarde...' : 'Confirmer le template'}
                </button>
            </div>
        </div>
    );
}
