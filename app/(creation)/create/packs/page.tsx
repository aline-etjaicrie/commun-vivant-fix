'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, HelpCircle } from 'lucide-react';
import Link from 'next/link';

function PacksContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const context = searchParams?.get('context');

    const handleSelectPack = (packId: string) => {
        router.push(`/create/pay?pack=${packId}&context=${context || ''}`);
    };

    const [selectedOptions, setSelectedOptions] = React.useState<number[]>([]);
    const basePrice = 79;
    const options = [
        { id: 0, label: 'Galerie photos illimitée', price: 15 },
        { id: 1, label: 'Message audio (3 min)', price: 10 },
        { id: 2, label: 'Extension hébergement à vie', price: 90 },
    ];

    const toggleOption = (id: number) => {
        if (selectedOptions.includes(id)) {
            setSelectedOptions(selectedOptions.filter(i => i !== id));
        } else {
            setSelectedOptions([...selectedOptions, id]);
        }
    };

    const calculateTotal = () => {
        const optionsTotal = options
            .filter(o => selectedOptions.includes(o.id))
            .reduce((sum, o) => sum + o.price, 0);
        return basePrice + optionsTotal;
    };

    const handleContinue = () => {
        // Pass selected options as comma-separated string
        const optionsParam = selectedOptions.join(',');
        router.push(`/create/pay?options=${optionsParam}&context=${context || ''}`);
    };

    return (
        <div className="max-w-7xl mx-auto">

            {/* Header with Back Button */}
            <div className="mb-12 relative">
                <button
                    onClick={() => router.back()}
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-memoir-blue/60 hover:text-memoir-blue transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="hidden md:inline">Retour</span>
                </button>
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-serif italic text-memoir-blue mb-4">Nos Offres</h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-memoir-gold to-memoir-neon rounded-full mx-auto" />
                </div>
            </div>

            {/* PRICING BUILDER SECTION */}
            <div className="max-w-4xl mx-auto mb-20">

                <div className="bg-white rounded-[32px] shadow-xl overflow-hidden border border-memoir-gold/20 flex flex-col md:flex-row">

                    {/* BASE OFFER */}
                    <div className="p-8 md:p-12 md:w-1/2 border-b md:border-b-0 md:border-r border-stone-100 bg-gradient-to-b from-stone-50/50 to-transparent">
                        <div className="mb-8">
                            <h2 className="text-2xl font-serif italic text-memoir-blue mb-2">L'Essentiel</h2>
                            <p className="text-memoir-blue/60 text-sm">Votre espace mémoriel complet</p>
                        </div>

                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-6xl font-serif font-bold text-memoir-blue">79€</span>
                            <span className="text-sm text-memoir-blue/40 font-light uppercase tracking-wider">/ espace</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {[
                                "Espace biographique complet",
                                "Hébergement sécurisé (5 ans)",
                                "Invités illimités",
                                "Modération des hommages",
                                "Pas de publicité"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-memoir-gold/10 flex items-center justify-center shrink-0 text-memoir-gold">
                                        <Check className="w-3 h-3" strokeWidth={3} />
                                    </div>
                                    <span className="text-memoir-blue/80 text-sm leading-tight">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* OPTIONS SELECTOR */}
                    <div className="p-8 md:p-12 md:w-1/2 bg-white flex flex-col">
                        <h3 className="text-lg font-bold text-memoir-blue mb-6 border-b border-stone-100 pb-4">Ajouter des options</h3>

                        <div className="space-y-4 flex-grow">
                            {options.map(option => (
                                <label
                                    key={option.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedOptions.includes(option.id) ? 'border-memoir-gold bg-memoir-gold/5' : 'border-stone-100 hover:border-memoir-gold/50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedOptions.includes(option.id) ? 'bg-memoir-gold border-memoir-gold' : 'border-stone-300 bg-white'}`}>
                                            {selectedOptions.includes(option.id) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                        </div>
                                        <span className={`text-sm font-medium ${selectedOptions.includes(option.id) ? 'text-memoir-blue' : 'text-memoir-blue/70'}`}>
                                            {option.label}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-memoir-blue">+{option.price}€</span>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedOptions.includes(option.id)}
                                        onChange={() => toggleOption(option.id)}
                                    />
                                </label>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-stone-100">
                            <div className="flex justify-between items-baseline mb-6">
                                <span className="text-memoir-blue/60 text-sm font-bold uppercase tracking-widest">Total</span>
                                <span className="text-3xl font-serif font-bold text-memoir-blue">{calculateTotal()}€</span>
                            </div>

                            <button
                                onClick={handleContinue}
                                className="w-full py-4 bg-memoir-blue text-white rounded-xl font-bold hover:bg-memoir-blue/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-memoir-blue/20"
                            >
                                Valider et payer
                            </button>
                            <p className="text-center text-xs text-memoir-blue/40 mt-4">
                                Paiement sécurisé via Stripe
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* POURQUOI C'EST PAYANT ? - Section rassurante */}
            <div className="max-w-4xl mx-auto bg-stone-100 rounded-3xl p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="shrink-0">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-memoir-gold">
                            <HelpCircle className="w-8 h-8" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-serif italic text-memoir-blue mb-4">Pourquoi ce service est-il payant ?</h3>
                        <div className="space-y-4 text-memoir-blue/70 leading-relaxed">
                            <p>
                                Chez <span className="font-bold">Commun Vivant</span>, nous avons fait le choix de l'indépendance et de l'éthique.
                                Contrairement aux réseaux sociaux gratuits, <strong>vous n'êtes pas le produit</strong>.
                            </p>
                            <p>
                                Votre contribution unique sert à financer :
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>L'hébergement sécurisé de vos données en France pour 30 ans.</li>
                                <li>Le développement d'une plateforme sans aucune publicité.</li>
                                <li>La garantie que vos données ne seront jamais revendues à des tiers.</li>
                            </ul>
                            <p className="pt-2 italic font-medium text-memoir-gold">
                                C'est le prix de votre tranquillité et de la pérennité de vos souvenirs.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default function PacksPage() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] py-16 px-4">
            <Suspense fallback={<div>Chargement...</div>}>
                <PacksContent />
            </Suspense>
        </div>
    );
}
