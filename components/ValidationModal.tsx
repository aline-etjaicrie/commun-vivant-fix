'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

type AccessLevel = 'open' | 'restricted' | 'later';

interface ValidationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (accessLevel: AccessLevel) => void;
    isProcessing?: boolean;
}

const ACCESS_OPTIONS: { id: AccessLevel; label: string; description: string }[] = [
    {
        id: 'open',
        label: 'Ouvert',
        description: 'Toute personne avec le lien, le QR code ou la puce NFC peut accéder au mémorial.',
    },
    {
        id: 'restricted',
        label: 'Restreint',
        description: 'Seules les personnes que vous autorisez peuvent consulter ce mémorial.',
    },
    {
        id: 'later',
        label: 'À définir plus tard',
        description: 'Le mémorial est publié mais non accessible publiquement pour l'instant.',
    },
];

export default function ValidationModal({
    isOpen,
    onClose,
    onConfirm,
    isProcessing = false,
}: ValidationModalProps) {
    const [confirmed, setConfirmed] = useState(false);
    const [accessLevel, setAccessLevel] = useState<AccessLevel>('open');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!confirmed || isProcessing) return;
        onConfirm(accessLevel);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-6">
                    <h2 className="text-2xl font-serif text-[#0F2A44]">Avant de publier</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Fermer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 pb-6 overflow-y-auto space-y-8">

                    {/* Texte explicatif */}
                    <p className="text-gray-600 leading-relaxed text-sm">
                        Publier un mémorial engage votre responsabilité envers la mémoire de cette personne,
                        ses proches et les droits liés aux contenus partagés — textes, photos, sons.
                        Prenez un instant pour vous assurer que ce que vous publiez est fait avec soin.
                    </p>

                    {/* Checkbox unique */}
                    <div
                        className="flex items-start gap-4 cursor-pointer group"
                        onClick={() => setConfirmed(prev => !prev)}
                    >
                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${confirmed ? 'bg-[#0F2A44] border-[#0F2A44]' : 'border-gray-300 group-hover:border-[#0F2A44]'}`}>
                            {confirmed && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed select-none">
                            Je confirme pouvoir publier ce contenu de manière responsable.
                        </span>
                    </div>

                    {/* Choix d'accès */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Qui peut accéder au mémorial ?
                        </p>
                        <div className="space-y-2">
                            {ACCESS_OPTIONS.map(option => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setAccessLevel(option.id)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${accessLevel === option.id
                                        ? 'border-[#0F2A44] bg-[#0F2A44]/5'
                                        : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                                        }`}
                                >
                                    <span className={`block text-sm font-semibold mb-0.5 ${accessLevel === option.id ? 'text-[#0F2A44]' : 'text-gray-800'}`}>
                                        {option.label}
                                    </span>
                                    <span className="block text-xs text-gray-500 leading-relaxed">
                                        {option.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!confirmed || isProcessing}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all ${confirmed && !isProcessing
                            ? 'bg-[#0F2A44] hover:bg-[#0F2A44]/90'
                            : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        {isProcessing ? 'Publication…' : 'Publier'}
                    </button>
                </div>
            </div>
        </div>
    );
}
