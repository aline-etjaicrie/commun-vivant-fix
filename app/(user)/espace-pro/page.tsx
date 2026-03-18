'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Smartphone, Users, ShieldCheck } from 'lucide-react';
import ProContactModal from '@/components/ProContactModal';

export default function EspaceProPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalSubject, setModalSubject] = useState("Demande Pro");

    const openContact = (subject: string) => {
        setModalSubject(subject);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <ProContactModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                subject={modalSubject}
            />

            {/* HERO SECTION */}
            {/* HERO SECTION */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/hero-pro.png"
                        alt="Espace Partenaires"
                        fill
                        className="object-cover"
                        priority
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-0 bg-gradient-to-b from-memoir-blue/80 to-transparent" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8 mt-16">
                    <div className="backdrop-blur-sm bg-white/10 rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl inline-block">
                        <div className="inline-flex items-center justify-center mb-6">
                            <div className="h-1 w-24 bg-gradient-to-r from-memoir-gold to-memoir-neon rounded-full" />
                        </div>

                        <div className="inline-block mb-4 px-4 py-1 bg-white/10 rounded-full border border-white/20">
                            <span className="uppercase tracking-[0.2em] text-xs font-bold text-white">Espace Partenaires</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight mb-8">
                            Donnez une dimension <br />
                            <span className="text-memoir-gold italic">mémorielle</span> à votre offre<span className="text-memoir-neon">.</span>
                        </h1>

                        <p className="text-lg md:text-xl font-light text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
                            Commun Vivant s’associe aux professionnels pour intégrer la mémoire numérique<span className="text-memoir-neon">.</span><br className="hidden md:block" />
                            Une technologie sobre, un partenariat clair, une valeur ajoutée humaine<span className="text-memoir-neon">.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button
                                onClick={() => openContact("Demande d'échange Pro")}
                                className="inline-flex items-center justify-center px-8 py-4 bg-memoir-gold text-white font-bold rounded-full hover:bg-[#b8941f] transition-all transform hover:scale-105 shadow-lg group text-lg"
                            >
                                Demander un échange
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => openContact("Candidature Pilote 2026")}
                                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all border border-white/30 backdrop-blur-sm text-lg"
                            >
                                Rejoindre le pilote
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: VALUE PROP */}
            <section className="py-24 px-6 md:px-12 bg-white border-b border-stone-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">

                        <div>
                            <h3 className="text-xl font-bold font-serif text-memoir-blue mb-3">Support Numérique Durable<span className="text-memoir-neon">.</span></h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                Un espace mémoriel accessible instantanément via QR code. Une extension naturelle de vos supports physiques, conçue pour durer des décennies sans obsolescence.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold font-serif text-memoir-blue mb-3">Dimension Humaine & Collective<span className="text-memoir-neon">.</span></h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                Offrez bien plus qu'une plaque : offrez un lieu de rassemblement. Permettez aux familles, amis et collègues de déposer témoignages, photos et souvenirs dans un espace apaisé.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold font-serif text-memoir-blue mb-3">Cadre Éthique & Souverain<span className="text-memoir-neon">.</span></h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                Une conception "Privacy by Design". Pas de publicité, pas de revente de données, un hébergement français. La garantie absolue de respect pour les familles et leurs défunts.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* SECTION 3: PARTNERS */}
            <section className="py-24 px-6 md:px-12 bg-[#FDFBF7]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-serif text-memoir-blue">Nos Partenaires</h2>
                        <div className="w-12 h-1 bg-memoir-gold mx-auto mt-4 rounded-full" />
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">

                        {/* 1. Pompes Funèbres */}
                        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center gap-2 mb-6 text-memoir-blue font-bold uppercase tracking-wider text-xs">
                                <span className="text-xl">🕊</span> Pompes Funèbres
                            </div>
                            <h3 className="text-2xl font-serif text-memoir-blue mb-4">Prolongez l’accompagnement au-delà des obsèques</h3>
                            <p className="text-slate-600 mb-6 text-sm">
                                Un mémorial numérique co-brandé, accessible depuis une plaque QR ou un lien direct.
                            </p>
                            <div className="space-y-4 mb-8">
                                <div>
                                    <strong className="text-memoir-gold text-xs uppercase tracking-wide block mb-2">Ce que nous apportons</strong>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        <li>• Génération automatique des QR codes</li>
                                        <li>• Interface co-brandée à votre image</li>
                                        <li>• Modèle de commission apporteur d'affaires</li>
                                    </ul>
                                </div>
                            </div>
                            <button onClick={() => openContact("Partenariat Pompes Funèbres")} className="text-memoir-blue font-bold text-sm border-b border-memoir-blue/20 hover:border-memoir-blue transition-colors pb-1">En savoir plus</button>
                        </div>

                        {/* 2. Assureurs */}
                        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center gap-2 mb-6 text-memoir-blue font-bold uppercase tracking-wider text-xs">
                                <span className="text-xl">🧾</span> Assureurs & Prévoyance
                            </div>
                            <h3 className="text-2xl font-serif text-memoir-blue mb-4">Une clause "Mémoire" dans vos contrats</h3>
                            <p className="text-slate-600 mb-6 text-sm">
                                Proposez une option de mémoire numérique activable par les bénéficiaires. La mémoire devient un service structuré.
                            </p>
                            <div className="space-y-4 mb-8">
                                <div>
                                    <strong className="text-memoir-blue text-xs uppercase tracking-wide block mb-2">Ce que nous apportons</strong>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        <li>• Licence adaptée au volume</li>
                                        <li>• Activation simple par le bénéficiaire</li>
                                        <li>• Service différenciant et émotionnel</li>
                                    </ul>
                                </div>
                            </div>
                            <button onClick={() => openContact("Partenariat Assurance")} className="text-memoir-blue font-bold text-sm border-b border-memoir-blue/20 hover:border-memoir-blue transition-colors pb-1">En savoir plus</button>
                        </div>

                        {/* 3. Collectivités */}
                        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center gap-2 mb-6 text-memoir-blue font-bold uppercase tracking-wider text-xs">
                                <span className="text-xl">🏘</span> Collectivités & Entreprises
                            </div>
                            <h3 className="text-2xl font-serif text-memoir-blue mb-4">Valorisez votre patrimoine immatériel</h3>
                            <p className="text-slate-600 mb-6 text-sm">
                                Raconter ce qui fait tenir un territoire : immeubles, quartiers, monuments, métiers.
                            </p>
                            <div className="space-y-4 mb-8">
                                <div>
                                    <strong className="text-memoir-neon text-xs uppercase tracking-wide block mb-2">Ce que nous apportons</strong>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        <li>• Parcours mémoriels urbains</li>
                                        <li>• Hommages aux collaborateurs/fondateurs</li>
                                        <li>• Accompagnement éditorial dédié</li>
                                    </ul>
                                </div>
                            </div>
                            <button onClick={() => openContact("Partenariat Collectivité")} className="text-memoir-blue font-bold text-sm border-b border-memoir-blue/20 hover:border-memoir-blue transition-colors pb-1">En savoir plus</button>
                        </div>

                        {/* 4. Artisans */}
                        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-memoir-gold/30 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-memoir-gold/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                            <div className="inline-flex items-center gap-2 mb-6 text-memoir-blue font-bold uppercase tracking-wider text-xs relative z-10">
                                <span className="text-xl">🪵</span> Artisans & Créateur·rices
                            </div>
                            <h3 className="text-2xl font-serif text-memoir-blue mb-4 relative z-10">Vous créez des objets. Et si ces objets portaient une mémoire ?</h3>
                            <p className="text-slate-600 mb-6 text-sm relative z-10">
                                Associez un QR ou un dispositif numérique à vos créations : meubles, plaques, bijoux, œuvres d'art.
                            </p>
                            <div className="space-y-6 relative z-10 mb-8">
                                <div>
                                    <strong className="text-memoir-gold text-xs uppercase tracking-wide block mb-2">Ce que nous proposons</strong>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        <li>• Génération de QR dédiés à vos créations</li>
                                        <li>• Hébergement des pages liées aux objets</li>
                                        <li>• Intégration possible dans un futur catalogue</li>
                                    </ul>
                                </div>
                                <div>
                                    <strong className="text-memoir-gold text-xs uppercase tracking-wide block mb-2">Ce que cela vous apporte</strong>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        <li>• Une valeur ajoutée narrative à vos pièces</li>
                                        <li>• Une différenciation forte</li>
                                        <li>• Une visibilité dans l’écosystème</li>
                                    </ul>
                                </div>
                            </div>
                            <button onClick={() => openContact("Partenariat Artisan")} className="text-memoir-blue font-bold text-sm border-b border-memoir-blue/20 hover:border-memoir-blue transition-colors pb-1 relative z-10">En savoir plus</button>
                        </div>

                    </div>
                </div>
            </section>

            {/* SECTION 4: TABLEAU RÉCAPITULATIF */}
            <section className="py-24 px-6 md:px-12 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-serif text-memoir-blue mb-4">Un modèle transparent</h2>
                        <p className="text-slate-600">Nous adaptons notre partenariat à votre structure.</p>
                    </div>

                    <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-stone-200 bg-stone-50">
                                <h3 className="text-xl font-bold text-memoir-blue mb-6">Le cadre de confiance</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-sm text-slate-700">
                                        <CheckCircle2 className="w-4 h-4 text-memoir-gold" />
                                        Contrat de partenariat clair
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-slate-700">
                                        <CheckCircle2 className="w-4 h-4 text-memoir-gold" />
                                        Espace Pro dédié (Dashboard)
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-slate-700">
                                        <CheckCircle2 className="w-4 h-4 text-memoir-gold" />
                                        Support technique prioritaire
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-slate-700">
                                        <CheckCircle2 className="w-4 h-4 text-memoir-gold" />
                                        Formation des équipes
                                    </li>
                                </ul>
                            </div>
                            <div className="p-8 md:p-12 bg-white">
                                <h3 className="text-xl font-bold text-memoir-blue mb-6">Le modèle économique</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-sm text-slate-700">
                                        <div className="w-1.5 h-1.5 bg-memoir-neon rounded-full mt-1.5" />
                                        <span>Commission sur chaque mémorial créé ou activé</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-slate-700">
                                        <div className="w-1.5 h-1.5 bg-memoir-neon rounded-full mt-1.5" />
                                        <span>Abonnement annuel (selon volume)</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-slate-700">
                                        <div className="w-1.5 h-1.5 bg-memoir-neon rounded-full mt-1.5" />
                                        <span>Tarifs préférentiels pour vos clients</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="bg-memoir-blue p-8 text-center text-white">
                            <p className="text-lg font-serif italic mb-6">"Le meilleur moyen de prédire l'avenir, c'est de le créer."</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => openContact("Candidature Pilote 2026")}
                                    className="px-8 py-3 bg-white text-memoir-blue font-bold rounded-lg hover:bg-memoir-gold hover:text-white transition-colors"
                                >
                                    Rejoindre le Pilote 2026
                                </button>
                                <button
                                    onClick={() => openContact("Information générale")}
                                    className="px-8 py-3 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    Être contacté
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
