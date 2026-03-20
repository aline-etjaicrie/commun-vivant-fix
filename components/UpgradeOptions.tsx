'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Star, Package, ArrowRight, Gift, Infinity } from 'lucide-react';
import Image from 'next/image';

interface UpgradeOptionsProps {
    context: 'celebration' | 'funeral' | 'heritage' | 'object_memory' | string;
    firstName?: string;
    onSelect?: (plan: any) => void;
}

export default function UpgradeOptions({ context, firstName = 'cette personne', onSelect }: UpgradeOptionsProps) {
    const router = useRouter();
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [extension, setExtension] = useState<string>('5ans');
    const [objectCount, setObjectCount] = useState<number>(1);

    // Normalize context
    const isCelebration = context === 'celebration' || context === 'living_story';
    const isHeritage = context === 'heritage' || context === 'object_memory';
    const isFuneral = context === 'funeral' || (!isCelebration && !isHeritage);

    // Base Prices
    const basePrice = isHeritage ? 49 : 79;

    // Object Bundle Pricing logic
    let bundlePrice = basePrice;
    if (isHeritage) {
        if (objectCount === 3) bundlePrice = 119;
        if (objectCount === 5) bundlePrice = 179;
        if (objectCount === 10) bundlePrice = 299;
    }

    const optionsList = [
        { id: 'photos', label: 'Galerie photos illimitée', price: 15 },
        { id: 'video', label: 'Vidéo intégrée (5 min)', price: 20 },
        { id: 'audio', label: 'Message audio (3 min)', price: 10, hidden: isHeritage },
        { id: 'theme', label: 'Thème premium personnalisé', price: 25 },
        { id: 'qr', label: 'QR code supplémentaire (x1)', price: 5 },
        { id: 'nfc', label: 'Puce NFC supplémentaire (x1)', price: 5 },
        { id: 'pdf', label: 'Export PDF du mémorial', price: 15 },
        { id: 'plaque', label: 'Plaque funéraire gravée', price: 79, hidden: !isFuneral },
    ].filter(o => !o.hidden);

    const extensionOptions = [
        { id: '5ans', label: 'Inclus (5 ans)', price: 0 },
        { id: '10ans', label: '+ 5 ans supplémentaires', price: 25 },
        { id: 'vie', label: 'Extension à vie (30 ans)', price: 90 },
    ];

    const handleOptionToggle = (id: string) => {
        setSelectedOptions(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const calculateTotal = () => {
        let total = bundlePrice;

        // Options
        selectedOptions.forEach(optId => {
            const opt = optionsList.find(o => o.id === optId);
            if (opt) total += opt.price;
        });

        // Extension
        const ext = extensionOptions.find(e => e.id === extension);
        if (ext) total += ext.price;

        return total;
    };

    const currentTotal = calculateTotal();

    const handlePayment = () => {
        // Logic for payment redirect
        // onSelect({ total: currentTotal, options: selectedOptions, extension, objectCount });
        alert(`Paiement de ${currentTotal}€ simulé. Redirection...`);
        // redirect to next step or stripe
        router.push('/medias');
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-[#D4AF37]/10 shadow-xl">

            <div className="text-center mb-10">
                <div className="inline-block px-4 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                    {isCelebration ? 'Hommage Vivant' : isHeritage ? 'Mémoire d\'objet' : 'Mémorial'}
                </div>
                <h2 className="text-3xl md:text-4xl font-serif text-[#1A1A2E] mb-3">
                    Votre récit est prêt à être finalisé
                </h2>
                <p className="text-[#1A1A2E]/60">
                    {isCelebration && `Nous avons détecté que vous racontez l'histoire de ${firstName}, une personne vivante.`}
                    {isFuneral && `Nous avons détecté que vous souhaitez honorer la mémoire de ${firstName}.`}
                    {isHeritage && `Nous avons détecté que vous racontez l'histoire d'un patrimoine.`}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* LEFT: BASE OFFER */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-[#D4AF37]/20 relative">
                    <div className="bg-[#1A1A2E] text-white p-6 text-center">
                        <h3 className="text-xl font-bold uppercase tracking-widest mb-1">
                            {isCelebration ? 'Hommage Vivant' : isHeritage ? 'Mémoire d\'Objet' : 'Mémorial en ligne'}
                        </h3>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-serif font-bold">{basePrice}€</span>
                            {isHeritage && objectCount > 1 && <span className="text-sm opacity-50 line-through">{basePrice * objectCount}€</span>}
                        </div>
                        <p className="text-xs opacity-60 mt-1 uppercase tracking-wide">Hébergement 5 ans inclus</p>
                    </div>

                    <div className="p-8 space-y-4">
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-sm text-[#1A1A2E]/80">
                                <Check className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                                Récit complet généré par IA (3 styles)
                            </li>
                            {isHeritage ? (
                                <>
                                    <li className="flex gap-3 text-sm text-[#1A1A2E]/80">
                                        <Check className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                                        Questionnaire "Objet" adapté
                                    </li>
                                    <li className="flex gap-3 text-sm text-[#1A1A2E]/80">
                                        <Check className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                                        Puce NFC incluse
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="flex gap-3 text-sm text-[#1A1A2E]/80">
                                        <Check className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                                        Galerie photos (15 incluses)
                                    </li>
                                    <li className="flex gap-3 text-sm text-[#1A1A2E]/80">
                                        <Check className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                                        Contributions illimitées
                                    </li>
                                    <li className="flex gap-3 text-sm text-[#1A1A2E]/80">
                                        <Check className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                                        Livre d'or {isFuneral ? '& bougies virtuelles' : ''}
                                    </li>
                                </>
                            )}
                            <li className="flex gap-3 text-sm text-[#1A1A2E]/80">
                                <Check className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                                QR code {isFuneral ? 'plaque élégante' : 'imprimable'}
                            </li>
                        </ul>

                        {isHeritage && (
                            <div className="mt-6 pt-6 border-t border-stone-100">
                                <p className="text-xs font-bold uppercase text-[#1A1A2E]/40 mb-3">Tarifs dégressifs</p>
                                <div className="space-y-2">
                                    <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${objectCount === 1 ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-stone-200 hover:border-[#D4AF37]/50'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" checked={objectCount === 1} onChange={() => setObjectCount(1)} className="accent-[#D4AF37]" />
                                            <span className="text-sm font-medium">1 Objet</span>
                                        </div>
                                        <span className="font-bold">49€</span>
                                    </label>
                                    <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${objectCount === 3 ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-stone-200 hover:border-[#D4AF37]/50'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" checked={objectCount === 3} onChange={() => setObjectCount(3)} className="accent-[#D4AF37]" />
                                            <span className="text-sm font-medium">3 Objets (-19%)</span>
                                        </div>
                                        <span className="font-bold">119€</span>
                                    </label>
                                    <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${objectCount === 5 ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-stone-200 hover:border-[#D4AF37]/50'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" checked={objectCount === 5} onChange={() => setObjectCount(5)} className="accent-[#D4AF37]" />
                                            <span className="text-sm font-medium">5 Objets (-27%)</span>
                                        </div>
                                        <span className="font-bold">179€</span>
                                    </label>
                                    <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${objectCount === 10 ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-stone-200 hover:border-[#D4AF37]/50'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" checked={objectCount === 10} onChange={() => setObjectCount(10)} className="accent-[#D4AF37]" />
                                            <span className="text-sm font-medium">10 Objets (-39%)</span>
                                        </div>
                                        <span className="font-bold">299€</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: OPTIONS */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                        <h4 className="flex items-center gap-2 text-[#1A1A2E] font-bold mb-4">
                            <Package className="w-4 h-4 text-[#D4AF37]" /> Options & Extensions
                        </h4>
                        <div className="space-y-3">
                            {optionsList.map(opt => (
                                <label key={opt.id} className="flex items-center justify-between p-3 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedOptions.includes(opt.id) ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-stone-300 group-hover:border-[#D4AF37]/50'}`}>
                                            {selectedOptions.includes(opt.id) && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="text-sm text-[#1A1A2E]/80">{opt.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-[#D4AF37]">+{opt.price}€</span>
                                    <input type="checkbox" className="hidden" checked={selectedOptions.includes(opt.id)} onChange={() => handleOptionToggle(opt.id)} />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                        <h4 className="flex items-center gap-2 text-[#1A1A2E] font-bold mb-4">
                            <Infinity className="w-4 h-4 text-[#D4AF37]" /> Durée d'hébergement
                        </h4>
                        <div className="space-y-2">
                            {extensionOptions.map(ext => (
                                <label key={ext.id} className="flex items-center justify-between p-3 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${extension === ext.id ? 'border-[#D4AF37]' : 'border-stone-300'}`}>
                                            {extension === ext.id && <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />}
                                        </div>
                                        <span className="text-sm text-[#1A1A2E]/80">{ext.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-[#D4AF37]">{ext.price > 0 ? `+${ext.price}€` : '0€'}</span>
                                    <input type="radio" className="hidden" checked={extension === ext.id} onChange={() => setExtension(ext.id)} />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* CROSS SELL SUGGESTIONS */}
                    <div className="bg-[#D4AF37]/5 p-6 rounded-2xl border border-[#D4AF37]/20">
                        <h4 className="flex items-center gap-2 text-[#8A7018] font-bold mb-2 text-sm uppercase tracking-wide">
                            <Gift className="w-4 h-4" />
                            {isHeritage ? 'Raconter aussi l\'histoire d\'une personne ?' : 'Raconter plusieurs histoires ?'}
                        </h4>
                        <p className="text-xs text-[#8A7018]/80 mb-3">
                            {isHeritage ? 'Ces objets ont une histoire familiale. Racontez également la personne liée à ces objets.' : 'Vous pensez créer d\'autres mémoires dans votre famille ? Économisez avec nos packs.'}
                        </p>
                        <button className="text-xs font-bold text-[#8A7018] hover:underline flex items-center gap-1">
                            Voir les packs {isHeritage ? 'transmission' : 'famille'} <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* BOTTOM ACTION BAR */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-[#D4AF37]/10">
                <div className="text-center md:text-left">
                    <p className="text-sm text-[#1A1A2E]/40 uppercase tracking-widest font-bold mb-1">Total à régler</p>
                    <p className="text-4xl font-serif font-bold text-[#1A1A2E]">{currentTotal}€</p>
                </div>

                <button
                    onClick={handlePayment}
                    className="w-full md:w-auto px-10 py-4 bg-[#1A1A2E] text-white rounded-full font-bold shadow-xl hover:bg-[#1A1A2E]/90 hover:scale-105 transition-all flex items-center justify-center gap-3"
                >
                    Finaliser et payer <ArrowRight className="w-4 h-4" />
                </button>
            </div>

        </div>
    );
}
