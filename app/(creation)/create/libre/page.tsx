'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function FreeWriteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const context = searchParams?.get('context') || 'funeral';

    const [formData, setFormData] = useState({
        name: '',
        dates: '',
        content: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Load draft
    useEffect(() => {
        const saved = localStorage.getItem(`freewrite-${context}`);
        if (saved) {
            try {
                setFormData(JSON.parse(saved));
            } catch (e) { console.error(e); }
        }
    }, [context]);

    // Auto-save logic
    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem(`freewrite-${context}`, JSON.stringify(formData));
            setLastSaved(new Date());
            setIsSaving(false);
        }, 1000); // 1s debounce

        return () => clearTimeout(timer);
    }, [formData, context]);

    const handleChange = (field: string, value: string) => {
        setIsSaving(true);
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getLabelName = () => {
        if (context === 'object_memory') return "Nom de l'objet";
        if (context === 'heritage') return "Nom de la personne ou de l'objet";
        return "Prénom ou Nom complet";
    };

    const getPlaceholderContent = () => {
        if (context === 'celebration') return "Racontez une anecdote joyeuse, un souvenir marquant...";
        if (context === 'heritage') return "Décrivez l'origine de cet objet, ou l'histoire de cet ancêtre...";
        return "Il/Elle était...";
    };

    return (
        <div className="min-h-screen bg-memoir-bg py-12 px-6 font-sans">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href={`/create?context=${context}`} className="flex items-center text-memoir-blue/40 hover:text-memoir-blue transition-colors text-xs font-bold uppercase tracking-widest">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Changer de méthode
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-memoir-blue/40">
                        {isSaving ? <span className="animate-pulse">Sauvegarde...</span> : (lastSaved && <span>Sauvegardé à {lastSaved.toLocaleTimeString()}</span>)}
                    </div>
                </div>

                <div className="bg-white rounded-[32px] shadow-xl p-8 md:p-12 border border-memoir-blue/5">
                    <div className="text-center mb-10">
                        <div className="w-12 h-12 bg-memoir-blue/5 text-memoir-blue rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-xl">✍️</span>
                        </div>
                        <h1 className="text-3xl font-serif italic text-memoir-blue mb-2">Racontez à votre façon</h1>
                        <p className="text-memoir-blue/60 text-sm">Prenez le temps qu'il vous faut. Votre texte est sauvegardé automatiquement.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-memoir-blue/60 mb-2">
                                    {getLabelName()}
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="w-full p-4 bg-memoir-bg/30 rounded-xl border border-memoir-blue/5 focus:ring-2 focus:ring-memoir-blue/20 outline-none font-serif text-lg text-memoir-blue placeholder:text-memoir-blue/20"
                                    placeholder="Ex. : Jean Dupont"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-memoir-blue/60 mb-2">
                                    Dates (optionnel)
                                </label>
                                <input
                                    type="text"
                                    value={formData.dates}
                                    onChange={(e) => handleChange('dates', e.target.value)}
                                    className="w-full p-4 bg-memoir-bg/30 rounded-xl border border-memoir-blue/5 focus:ring-2 focus:ring-memoir-blue/20 outline-none font-serif text-lg text-memoir-blue placeholder:text-memoir-blue/20"
                                    placeholder="Ex. : 1950 - 2023"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-memoir-blue/60 mb-2">
                                Votre récit
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => handleChange('content', e.target.value)}
                                className="w-full h-[60vh] p-6 bg-white rounded-xl border-2 border-dashed border-memoir-blue/10 focus:border-memoir-blue/30 outline-none text-lg leading-relaxed text-memoir-blue placeholder:text-memoir-blue/20 resize-none font-serif"
                                placeholder={getPlaceholderContent()}
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={() => router.push('/medias')} // Placeholder redirect
                            className="bg-memoir-blue text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-memoir-blue/90 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <span>Enregistrer et continuer</span>
                            <Save className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function FreeWritePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-memoir-bg">Chargement...</div>}>
            <FreeWriteContent />
        </Suspense>
    );
}
