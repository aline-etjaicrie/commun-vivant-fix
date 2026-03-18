'use client';

import { useState } from 'react';
import { Shield, X, AlertCircle } from 'lucide-react';

interface ValidationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isProcessing: boolean;
}

export default function ValidationModal({ isOpen, onClose, onConfirm, isProcessing }: ValidationModalProps) {
    const [agreements, setAgreements] = useState({
        rights: false,
        illegal: false,
        online: false,
        modify: false,
    });

    if (!isOpen) return null;

    const allChecked = Object.values(agreements).every(Boolean);

    const toggleAgreement = (key: keyof typeof agreements) => {
        setAgreements(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-start gap-4 bg-gray-50/50 rounded-t-2xl">
                    <div className="p-3 bg-memoir-blue/5 rounded-full">
                        <Shield className="w-6 h-6 text-memoir-blue" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-serif text-memoir-blue font-bold mb-1">
                            Avant de publier votre Commun
                        </h2>
                        <p className="text-sm text-gray-500">
                            Quelques règles importantes à respecter pour protéger la mémoire de chacun.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Checklist */}
                    <div className="space-y-4">

                        {/* 1. Droits */}
                        <div
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${agreements.rights ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
                            onClick={() => toggleAgreement('rights')}
                        >
                            <div className="flex gap-4">
                                <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${agreements.rights ? 'bg-green-600 border-green-600' : 'border-gray-300 bg-white'}`}>
                                    {agreements.rights && <span className="text-white text-xs">✓</span>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-memoir-blue text-sm mb-1">Je confirme avoir le droit de publier ce contenu</h3>
                                    <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                                        <li>Les photos, vidéos et textes m'appartiennent ou j'ai l'autorisation</li>
                                        <li>Je respecte le droit à l'image des personnes représentées</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* 2. Contenu illégal */}
                        <div
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${agreements.illegal ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
                            onClick={() => toggleAgreement('illegal')}
                        >
                            <div className="flex gap-4">
                                <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${agreements.illegal ? 'bg-green-600 border-green-600' : 'border-gray-300 bg-white'}`}>
                                    {agreements.illegal && <span className="text-white text-xs">✓</span>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-memoir-blue text-sm mb-1">Je m'engage à ne pas diffuser de contenu illégal ou diffamatoire</h3>
                                    <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                                        <li>Pas de propos injurieux, racistes, discriminatoires</li>
                                        <li>Pas d'atteinte à la vie privée de tiers</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* 3. Accessibilité */}
                        <div
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${agreements.online ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
                            onClick={() => toggleAgreement('online')}
                        >
                            <div className="flex gap-4">
                                <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${agreements.online ? 'bg-green-600 border-green-600' : 'border-gray-300 bg-white'}`}>
                                    {agreements.online && <span className="text-white text-xs">✓</span>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-memoir-blue text-sm mb-1">Je comprends que ce contenu sera accessible en ligne</h3>
                                    <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                                        <li>Selon mes choix de confidentialité (privé ou public)</li>
                                        <li>Pour une durée de 5 ans (renouvelable)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* 4. Modification */}
                        <div
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${agreements.modify ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
                            onClick={() => toggleAgreement('modify')}
                        >
                            <div className="flex gap-4">
                                <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${agreements.modify ? 'bg-green-600 border-green-600' : 'border-gray-300 bg-white'}`}>
                                    {agreements.modify && <span className="text-white text-xs">✓</span>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-memoir-blue text-sm mb-1">Je peux modifier ou supprimer ce Commun à tout moment</h3>
                                    <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                                        <li>Depuis mon tableau de bord</li>
                                        <li>Ou en exerçant mon droit à l'oubli</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                    </div>

                    <p className="text-[10px] text-gray-400 text-center leading-relaxed px-4">
                        En publiant ce Commun, vous acceptez nos Conditions Générales d'Utilisation et notre Politique de Confidentialité.
                        Commun Vivant se réserve le droit de modérer ou supprimer tout contenu ne respectant pas ces règles.
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50/50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!allChecked || isProcessing}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-all shadow-sm flex items-center justify-center gap-2 ${allChecked && !isProcessing
                                ? 'bg-memoir-blue hover:bg-memoir-blue/90'
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        {isProcessing ? 'Validation...' : 'J\'ai compris, publier'}
                    </button>
                </div>
            </div>
        </div>
    );
}
