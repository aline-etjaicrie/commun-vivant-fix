'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, MapPin, Save, Search, Globe, Lock } from 'lucide-react';

const LOCATION_TYPES = [
    { id: 'cemetery', name: 'Cimetière', icon: '🪦' },
    { id: 'crematorium', name: 'Crématorium', icon: '🕯️' },
    { id: 'ceremony', name: 'Lieu de cérémonie', icon: '⛪' },
    { id: 'garden', name: 'Jardin du souvenir', icon: '🌳' },
];

function GeolocationContent() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [locationType, setLocationType] = useState('cemetery');
    const [address, setAddress] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [enableDelivery, setEnableDelivery] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSave = () => {
        // Save to memorialPreviewData to see it in preview
        const stored = localStorage.getItem('memorialPreviewData');
        if (stored) {
            const data = JSON.parse(stored);
            data.location = {
                type: locationType,
                address,
                isPublic,
                enableDelivery
            };
            localStorage.setItem('memorialPreviewData', JSON.stringify(data));
        }

        alert('Localisation sauvegardée avec succès !');
        router.push(`/dashboard/${id}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F5F4F2] to-white">
            {/* Header */}
            <header className="bg-white border-b border-[#C9A24D]/20 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[#0F2A44] hover:text-[#C9A24D] transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Retour</span>
                    </button>

                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-[#C9A24D] text-[#0F2A44] px-6 py-2 rounded-lg hover:bg-[#E1C97A] transition-colors font-medium shadow-sm"
                    >
                        <Save className="w-4 h-4" />
                        <span>Sauvegarder</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-[#C9A24D]/10 rounded-full flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-[#C9A24D]" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl text-[#0F2A44] mb-3 font-normal" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                        Lieu de recueillement
                    </h1>
                    <p className="text-lg text-gray-600 italic">
                        Indiquez l'emplacement de la sépulture ou du jardin du souvenir pour orienter les proches.
                    </p>
                </div>

                {/* Type de lieu */}
                <div className="bg-white rounded-2xl border border-[#C9A24D]/20 p-8 mb-6 shadow-sm">
                    <h2 className="text-xl text-[#0F2A44] font-medium mb-4">Nature du lieu</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {LOCATION_TYPES.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setLocationType(type.id)}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${locationType === type.id
                                    ? 'border-[#C9A24D] bg-[#0F2A44]/5 text-[#C9A24D]'
                                    : 'border-gray-100 hover:border-[#C9A24D]/30'
                                    }`}
                            >
                                <div className="text-2xl mb-2">{type.icon}</div>
                                <p className="text-sm font-medium text-[#0F2A44]">{type.name}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Adresse */}
                <div className="bg-white rounded-2xl border border-[#C9A24D]/20 p-8 mb-6 shadow-sm">
                    <h2 className="text-xl text-[#0F2A44] font-medium mb-4">Coordonnées</h2>

                    <div className="mb-6">
                        <label className="block text-sm text-gray-700 font-medium mb-2">
                            Rechercher le lieu (Cimetière, Église...)
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Commencez à taper..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                            />
                        </div>
                    </div>

                    {/* Carte placeholder améliorée */}
                    <div className="w-full h-80 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center mb-6 relative overflow-hidden group shadow-inner">
                        {/* Une vraie image de carte pour le visuel */}
                        <Image
                            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop"
                            className="object-cover opacity-20"
                            alt="Map preview"
                            fill
                        />
                        <div className="text-center z-10 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white">
                            <MapPin className="w-12 h-12 text-[#C9A24D] mx-auto mb-2 animate-bounce" />
                            <p className="text-[#0F2A44] font-medium">Sélection sur la carte</p>
                            <p className="text-xs text-gray-500 mt-1">Cliquez pour épingler le lieu exact</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-700 font-medium mb-2">
                                Adresse complète ou nom du lieu
                            </label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Ex: Cimetière de Passy, 2 Rue du Commandant Schloesing, 75016 Paris"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                            />
                        </div>
                    </div>
                </div>

                {/* Options */}
                <div className="bg-white rounded-2xl border border-[#C9A24D]/20 p-8 mb-10 shadow-sm">
                    <h2 className="text-xl text-[#0F2A44] font-medium mb-4">Paramètres d'affichage</h2>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#C9A24D]/30 transition-colors">
                            <input
                                type="checkbox"
                                id="isPublic"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="mt-1 w-5 h-5 text-[#C9A24D] border-gray-300 rounded focus:ring-[#C9A24D]"
                            />
                            <div className="flex-1 cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
                                <label className="font-medium text-[#0F2A44] flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-[#C9A24D]" />
                                    Afficher publiquement
                                </label>
                                <p className="text-sm text-gray-600 mt-1">
                                    Permet aux proches de lancer un itinéraire GPS vers le lieu depuis le mémorial.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#C9A24D]/30 transition-colors">
                            <input
                                type="checkbox"
                                id="enableDelivery"
                                checked={enableDelivery}
                                onChange={(e) => setEnableDelivery(e.target.checked)}
                                className="mt-1 w-5 h-5 text-[#C9A24D] border-gray-300 rounded focus:ring-[#C9A24D]"
                            />
                            <div className="flex-1 cursor-pointer" onClick={() => setEnableDelivery(!enableDelivery)}>
                                <label className="font-medium text-[#0F2A44] flex items-center gap-2">
                                    💐 Livraison de fleurs autorisée
                                </label>
                                <p className="text-sm text-gray-600 mt-1">
                                    Affiche un bouton permettant aux fleuristes partenaires de livrer sur place.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors font-medium"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-10 py-3 bg-[#0F2A44] text-white rounded-xl hover:bg-[#1a3b5c] transition-all font-medium text-lg shadow-lg"
                    >
                        Valider la localisation
                    </button>
                </div>
            </main>
        </div>
    );
}

export default function GeolocationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
            <GeolocationContent />
        </Suspense>
    );
}
