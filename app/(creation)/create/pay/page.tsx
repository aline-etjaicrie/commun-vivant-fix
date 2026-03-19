'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ArrowRight, ShieldCheck, Mail, Edit } from 'lucide-react';
import FlowNotice from '@/components/create/FlowNotice';
import Title from '@/components/Title';


export default function PaymentRecap() {
    return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">Chargement...</div>}>
            <PaymentRecapContent />
        </React.Suspense>
    );
}

function PaymentRecapContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const memoryId = searchParams?.get('memoryId');
    const packId = searchParams?.get('pack');
    const optionsParam = searchParams?.get('options');

    // Example data (in real app, fetched from context/DB based on memoryId)
    const memoryPreview = {
        name: 'Jean Dupont',
        dates: '1958 - 2024',
        type: 'Mémorial en Ligne',
        style: 'Narratif et chaleureux',
    };

    const initialOptions = optionsParam ? optionsParam.split(',').map(Number).filter(n => !isNaN(n)) : [];
    const [selectedOptions, setSelectedOptions] = useState<number[]>(initialOptions);
    const [email, setEmail] = useState('');
    const [cgvAccepted, setCgvAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentError, setPaymentError] = useState('');

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

    const total = basePrice + options.filter(o => selectedOptions.includes(o.id)).reduce((sum, opt) => sum + opt.price, 0);

    const handlePayment = async () => {
        if (!cgvAccepted || !email) return;
        setLoading(true);
        setPaymentError('');

        // 1. Create Checkout Session
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memoryId,
                    packId,
                    email,
                    items: [
                        { name: 'Mémorial en Ligne', amount: basePrice * 100 }, // Centimes
                        ...options.filter(o => selectedOptions.includes(o.id)).map(o => ({ name: o.label, amount: o.price * 100 }))
                    ]
                }),
            });

            if (!response.ok) {
                const raw = await response.text();
                throw new Error(raw || 'Erreur session');
            }

            const { url } = await response.json();
            window.location.href = url; // Redirect to Stripe

        } catch (error) {
            console.error(error);
            setPaymentError("Le paiement n’a pas pu être préparé pour le moment. Rien n’est perdu dans votre commande, et vous pouvez réessayer dans un instant.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 md:px-8 max-w-4xl mx-auto">

            {/* Header */}
            <div className="text-center mb-12">
                <Title as="h1" className="text-3xl font-serif text-[#1A1A2E] mb-2">Récapitulatif de votre commande</Title>
                <p className="mt-4 max-w-2xl mx-auto text-sm text-[#1A1A2E]/60 leading-relaxed">
                    La création réelle de votre espace est payante. Ce règlement couvre l’hébergement, la mise en ligne,
                    le QR code et l’administration simple du projet.
                </p>
                <div className="w-16 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-start">

                {/* LEFT COLUMN: RECAP */}
                <div className="space-y-8">

                    {/* Memory Preview */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 relative group">
                        <button className="absolute top-4 right-4 text-stone-400 hover:text-[#D4AF37] transition-colors p-2" title="Modifier">
                            <Edit className="w-4 h-4" />
                        </button>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A1A2E]/40 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                            Mémoire en cours
                        </h3>
                        <div className="pl-4 border-l-2 border-[#D4AF37]/20">
                            <p className="font-serif text-xl font-bold text-[#1A1A2E] mb-1">{memoryPreview.name}</p>
                            <p className="text-sm font-medium text-[#1A1A2E]/60 mb-3">{memoryPreview.dates}</p>

                            <div className="flex flex-wrap gap-2 text-xs">
                                <span className="bg-stone-100 px-2 py-1 rounded text-stone-600">{memoryPreview.type}</span>
                                <span className="bg-stone-100 px-2 py-1 rounded text-stone-600">{memoryPreview.style}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A1A2E]/40 mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#1A1A2E]"></span>
                            Votre commande
                        </h3>

                        <div className="mb-6 rounded-2xl bg-stone-50 px-4 py-4 text-sm text-[#1A1A2E]/70">
                            <p className="font-medium text-[#1A1A2E]">Ce qui est inclus</p>
                            <ul className="mt-3 space-y-2">
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" /> Hébergement du site</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" /> QR code</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" /> Administration simple</li>
                                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" /> Mise en ligne par nos soins</li>
                            </ul>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-baseline text-[#1A1A2E]">
                                <span className="font-bold">Mémorial en Ligne (5 ans)</span>
                                <span>{basePrice}€</span>
                            </div>

                            {options.map((opt) => (
                                <div key={opt.id}
                                    className={`flex justify-between items-center text-[#1A1A2E]/80 text-sm pl-4 border-l-2 cursor-pointer py-2 hover:bg-stone-50 transition-colors ${selectedOptions.includes(opt.id) ? 'border-[#D4AF37] font-medium' : 'border-transparent'}`}
                                    onClick={() => toggleOption(opt.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedOptions.includes(opt.id) ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-stone-300'}`}>
                                            {selectedOptions.includes(opt.id) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                        </div>
                                        <span>{opt.label}</span>
                                    </div>
                                    <span>+{opt.price}€</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-stone-100 pt-4 flex justify-between items-end">
                            <span className="font-bold text-lg text-[#1A1A2E]">SOUS-TOTAL</span>
                            <span className="font-serif font-bold text-2xl text-[#1A1A2E]">{total}€</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#1A1A2E]/40 justify-center">
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> Paiement 100% sécurisé via Stripe
                    </div>

                </div>

                {/* RIGHT COLUMN: PAYMENT */}
                <div className="bg-[#1A1A2E] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[80px] pointer-events-none -mt-20 -mr-20"></div>

                    <h3 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                        <span className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#1A1A2E] flex items-center justify-center text-sm font-bold">€</span>
                        Paiement sécurisé
                    </h3>

                    <p className="relative z-10 mb-6 text-sm leading-relaxed text-white/65">
                        Vous finalisez ici un vrai projet, hébergé et prêt à être mis en ligne. Rien n’est prélevé avant
                        l’ouverture du checkout Stripe.
                    </p>

                    <div className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Email de confirmation</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="votre@email.com"
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-12 py-4 text-white placeholder-white/30 focus:border-[#D4AF37] outline-none transition-colors"
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                            </div>
                        </div>

                        {/* Integrated Stripe Element Container (Simplified for MVP) */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                            <p className="text-sm text-white/60 mb-4">Moyen de paiement</p>
                            <div className="flex justify-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all">
                                {/* Mock Logos */}
                                <div className="w-10 h-6 bg-white/20 rounded"></div>
                                <div className="w-10 h-6 bg-white/20 rounded"></div>
                                <div className="w-10 h-6 bg-white/20 rounded"></div>
                            </div>
                            <p className="text-xs text-white/30 mt-4">(Stripe Checkout s'ouvrira à l'étape suivante)</p>
                        </div>

                        <label className="flex items-start gap-4 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${cgvAccepted ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-white/30 group-hover:border-white/50'}`}>
                                {cgvAccepted && <Check className="w-3 h-3 text-[#1A1A2E]" strokeWidth={3} />}
                            </div>
                            <span className="text-xs text-white/60 leading-relaxed">
                                J'accepte les <Link href="/mentions-legales" className="underline hover:text-white">Conditions Générales de Vente</Link> et la <Link href="/confidentialite" className="underline hover:text-white">Politique de Confidentialité</Link>.
                            </span>
                            <input type="checkbox" className="hidden" checked={cgvAccepted} onChange={() => setCgvAccepted(!cgvAccepted)} />
                        </label>

                        {paymentError && (
                            <FlowNotice
                                variant="error"
                                title="Le paiement n’a pas encore pu démarrer"
                                message={paymentError}
                            />
                        )}

                        <button
                            onClick={handlePayment}
                            disabled={!cgvAccepted || !email || loading}
                            className={`w-full py-4 rounded-full font-bold shadow-lg transition-all flex items-center justify-center gap-3 mt-4 ${!cgvAccepted || !email || loading ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-[#D4AF37] text-[#1A1A2E] hover:bg-[#E5C558] hover:scale-105'}`}
                        >
                            {loading ? 'Redirection...' : `Valider le paiement : ${total}€`} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
