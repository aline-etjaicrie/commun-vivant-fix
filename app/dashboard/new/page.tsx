'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LITERARY_STYLES = [
    {
        id: 'sobre',
        name: 'Sobre',
        description: 'Un style épuré et direct, qui va à l\'essentiel',
        example: 'Marie aimait les matins calmes. Elle prenait son café en silence, observant le jardin. Ces moments simples étaient les siens.',
    },
    {
        id: 'narratif',
        name: 'Narratif',
        description: 'Une narration fluide qui raconte une histoire',
        example: 'Chaque matin, Marie se levait avec le soleil. Elle aimait voir le jardin s\'éveiller doucement, une tasse de café à la main. C\'était sa façon de commencer la journée, dans le calme et la contemplation.',
    },
    {
        id: 'poetique',
        name: 'Poétique',
        description: 'Un style imagé et évocateur, plein de douceur',
        example: 'Au lever du jour, Marie accueillait la lumière comme une vieille amie. Son café fumait doucement tandis que le jardin murmurait ses premiers secrets. Elle écoutait, et souriait.',
    },
];

function NewMemorialContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const context = searchParams?.get('context') || 'funeral'; // 'funeral', 'living_story', 'object_memory'

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', // Person name OR Object name
        birthDate: '',
        deathDate: '',
        objectType: '',
        objectOrigin: '',
        objectMaterial: '',
        photo: null as File | null,
        literaryStyle: '',
    });
    const [selectedStyle, setSelectedStyle] = useState('');

    const getContextTitle = () => {
        switch (context) {
            case 'living_story': return 'Transmettre une histoire';
            case 'object_memory': return 'Mémoire d\'objet';
            default: return 'Créer un mémorial';
        }
    };

    const getContextSubtitle = () => {
        switch (context) {
            case 'living_story': return 'Racontez votre histoire ou celle d\'un proche';
            case 'object_memory': return 'Donnez une voix à un objet qui compte';
            default: return 'Quelques informations pour commencer';
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (context === 'object_memory') {
                if (!formData.name || !formData.objectType) {
                    alert('Veuillez remplir le nom et le type d\'objet');
                    return;
                }
            } else if (context === 'living_story') {
                if (!formData.name || !formData.birthDate) {
                    alert('Veuillez remplir le nom et la date de naissance');
                    return;
                }
            } else {
                // Funeral default
                if (!formData.name || !formData.birthDate || !formData.deathDate) {
                    alert('Veuillez remplir tous les champs requis');
                    return;
                }
            }
        }
        if (step === 2) {
            if (!selectedStyle) {
                alert('Veuillez choisir un style littéraire');
                return;
            }
            setFormData({ ...formData, literaryStyle: selectedStyle });
        }
        setStep(step + 1);
    };

    const saveAndNavigate = (path: string) => {
        const nameParts = formData.name.trim().split(/\s+/);
        const prenom = nameParts[0] || '';
        const nom = nameParts.slice(1).join(' ') || '';

        const dataToSave = {
            ...formData,
            prenom,
            nom,
            style: selectedStyle,
            context
        };

        localStorage.setItem('questionnaireData', JSON.stringify(dataToSave));
        // Also save to 'onboarding_data' just in case other components use it
        localStorage.setItem('onboarding_data', JSON.stringify(dataToSave));

        router.push(`${path}?context=${context}`);
    };

    const handleStartQuestionnaire = () => {
        saveAndNavigate('/questionnaire');
    };

    const handleStartAlma = () => {
        saveAndNavigate('/alma');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F5F4F2] to-white">
            {/* Header */}
            <header className="bg-white border-b border-[#C9A24D]/20">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-[#0F2A44] hover:text-[#C9A24D] transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                        <span>Retour au tableau de bord</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-12">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-2 rounded-full transition-all ${s <= step ? 'w-16 bg-[#C9A24D]' : 'w-8 bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                {/* Step 1: Basic Information */}
                {step === 1 && (
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl text-[#0F2A44] mb-4 font-normal text-center" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                                {getContextTitle()}
                            </h1>
                            <p className="text-center text-gray-600 italic text-lg">
                                {getContextSubtitle()}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-[#C9A24D]/20 p-8 space-y-6">

                            {/* Common Field: Name */}
                            <div>
                                <label className="block text-[#0F2A44] font-medium mb-2">
                                    {context === 'object_memory' ? "Nom de l'objet" : "Nom complet"} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={context === 'object_memory' ? "Ex: L'horloge du grand-père" : "Marie Dubois"}
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D] text-lg"
                                />
                            </div>

                            {/* Object Context Fields */}
                            {context === 'object_memory' && (
                                <>
                                    <div>
                                        <label className="block text-[#0F2A44] font-medium mb-2">
                                            Type d'objet <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.objectType}
                                            onChange={(e) => setFormData({ ...formData, objectType: e.target.value })}
                                            placeholder="Meuble, Bijou, Maison..."
                                            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[#0F2A44] font-medium mb-2">
                                                Origine (Lieu/Époque)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.objectOrigin}
                                                onChange={(e) => setFormData({ ...formData, objectOrigin: e.target.value })}
                                                placeholder="Ex: Bretagne, 1920"
                                                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[#0F2A44] font-medium mb-2">
                                                Matière principale
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.objectMaterial}
                                                onChange={(e) => setFormData({ ...formData, objectMaterial: e.target.value })}
                                                placeholder="Ex: Chêne massif, Or"
                                                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Person Context Fields */}
                            {context !== 'object_memory' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[#0F2A44] font-medium mb-2">
                                            Date de naissance <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.birthDate}
                                            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                                        />
                                    </div>

                                    {/* Funeral Only */}
                                    {context === 'funeral' && (
                                        <div>
                                            <label className="block text-[#0F2A44] font-medium mb-2">
                                                Date de décès <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.deathDate}
                                                onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                                                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-[#0F2A44] font-medium mb-2">
                                    Photo principale (optionnel)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, photo: e.target.files?.[0] || null })}
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                                />
                                <p className="text-sm text-gray-500 mt-2 italic">Vous pourrez ajouter d'autres photos plus tard</p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 bg-[#C9A24D] text-[#0F2A44] px-8 py-4 rounded-xl hover:bg-[#E1C97A] transition-all text-lg font-medium"
                            >
                                <span>Continuer</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Literary Style */}
                {step === 2 && (
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl text-[#0F2A44] mb-4 font-normal text-center" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                                Choisissez un style
                            </h1>
                            <p className="text-center text-gray-600 italic text-lg max-w-2xl mx-auto">
                                Ce style guidera l'écriture du récit {context === 'object_memory' ? "de cet objet" : "de vie"}.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {LITERARY_STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${selectedStyle === style.id
                                        ? 'border-[#C9A24D] bg-[#C9A24D]/5 shadow-lg'
                                        : 'border-gray-200 hover:border-[#C9A24D]/50 bg-white'
                                        }`}
                                >
                                    <h3 className="text-2xl text-[#0F2A44] font-medium mb-2" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                                        {style.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">{style.description}</p>
                                    <div className="bg-[#0F2A44]/5 p-4 rounded-lg italic text-gray-700 leading-relaxed">
                                        "{style.example}"
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="flex items-center gap-2 text-[#0F2A44] hover:text-[#C9A24D] transition-colors px-6 py-3"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                <span>Retour</span>
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 bg-[#C9A24D] text-[#0F2A44] px-8 py-4 rounded-xl hover:bg-[#E1C97A] transition-all text-lg font-medium"
                            >
                                <span>Continuer</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Choose Creation Mode */}
                {step === 3 && (
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl text-[#0F2A44] mb-4 font-normal text-center" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                                Comment souhaitez-vous créer {context === 'object_memory' ? "cette mémoire" : "ce mémorial"} ?
                            </h1>
                            <p className="text-center text-gray-600 italic text-lg">
                                Choisissez la méthode qui vous convient le mieux
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Alma */}
                            <button
                                onClick={handleStartAlma}
                                className="bg-white border-2 border-[#C9A24D]/30 rounded-2xl p-8 hover:border-[#C9A24D] hover:shadow-xl transition-all text-left group"
                            >
                                <div className="flex items-center justify-center mb-6">
                                    <Image src="/alma-icon-transparent.png" alt="Alma" width={96} height={96} className="opacity-90 group-hover:opacity-100 transition-opacity object-contain" />
                                </div>
                                <h3 className="text-2xl text-[#0F2A44] font-medium mb-3 text-center" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                                    Avec Alma
                                </h3>
                                <p className="text-gray-600 italic text-center leading-relaxed">
                                    Une conversation douce et bienveillante qui vous guide pas à pas {context === 'object_memory' ? "pour révéler l'histoire de l'objet" : "dans vos souvenirs"}.
                                </p>
                            </button>

                            {/* Questionnaire */}
                            <button
                                onClick={handleStartQuestionnaire}
                                className="bg-white border-2 border-[#C9A24D]/30 rounded-2xl p-8 hover:border-[#C9A24D] hover:shadow-xl transition-all text-left group"
                            >
                                <div className="flex items-center justify-center mb-6">
                                    <Image src="/questionnaire-icon-transparent.png" alt="Questionnaire" width={96} height={96} className="opacity-90 group-hover:opacity-100 transition-opacity object-contain" />
                                </div>
                                <h3 className="text-2xl text-[#0F2A44] font-medium mb-3 text-center" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                                    Questionnaire
                                </h3>
                                <p className="text-gray-600 italic text-center leading-relaxed">
                                    Un formulaire structuré pour créer {context === 'object_memory' ? "la fiche mémoire" : "votre mémorial"} à votre propre rythme.
                                </p>
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => setStep(2)}
                                className="flex items-center gap-2 text-[#0F2A44] hover:text-[#C9A24D] transition-colors px-6 py-3"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                <span>Retour</span>
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function NewMemorialPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
            <NewMemorialContent />
        </Suspense>
    );
}
