'use client';

import { useState } from 'react';
import { Flag, X, AlertTriangle } from 'lucide-react';

export default function ReportButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState<string>('');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const reasons = [
        { value: 'image_rights', label: "Droit à l'image non respecté" },
        { value: 'defamation', label: "Contenu diffamatoire ou injurieux" },
        { value: 'illegal', label: "Contenu illégal" },
        { value: 'other', label: "Autre raison" },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                setIsSuccess(false);
                setReason('');
                setMessage('');
                setEmail('');
            }, 3000);
        }, 1000);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors opacity-60 hover:opacity-100"
            >
                <Flag className="w-3 h-3" />
                <span>Signaler ce contenu</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {isSuccess ? (
                            <div className="bg-green-50 p-6 rounded-lg text-center">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Flag className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-green-800 mb-2">Signalement envoyé</h3>
                                <p className="text-sm text-green-600">
                                    Merci de votre vigilance. Nos équipes vont examiner ce contenu dans les plus brefs délais.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Signaler ce contenu</h3>
                                        <p className="text-xs text-gray-500">Aidez-nous à maintenir un espace respectueux.</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">Pourquoi signalez-vous ce Commun ? *</label>
                                    <div className="space-y-2">
                                        {reasons.map((r) => (
                                            <label key={r.value} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="reason"
                                                    value={r.value}
                                                    required
                                                    checked={reason === r.value}
                                                    onChange={(e) => setReason(e.target.value)}
                                                    className="text-[#C9A24D] focus:ring-[#C9A24D]"
                                                />
                                                <span className="text-sm text-gray-700">{r.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Précisions (optionnel)</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A24D] focus:outline-none text-sm"
                                        rows={3}
                                        placeholder="Dites-nous en plus..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Votre email (pour le suivi) *</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A24D] focus:outline-none text-sm"
                                        placeholder="votre@email.com"
                                    />
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !reason || !email}
                                        className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Envoi...' : 'Signaler'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
