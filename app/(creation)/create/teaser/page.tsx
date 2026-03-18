'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Lock } from 'lucide-react';
import Title from '@/components/Title';
import { QuestionnaireData } from '@/lib/schema';
import { getQuestionnaireDraftStorageKey } from '@/lib/almaQuestionnaireIsolation';
import { getLegacyContextForCommunType, resolveCommunType } from '@/lib/communTypes';

function TeaserContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const communType = resolveCommunType(searchParams);
    const flowRaw = typeof window !== 'undefined' ? localStorage.getItem('creation_flow') : null;
    const flow = flowRaw ? (() => {
        try { return JSON.parse(flowRaw); } catch { return null; }
    })() : null;
    const context = searchParams?.get('context') || flow?.context || getLegacyContextForCommunType(communType);
    const storageKey = getQuestionnaireDraftStorageKey(context, false, communType);

    const [data, setData] = useState<Partial<QuestionnaireData> | null>(null);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setData(JSON.parse(saved));
            } catch {
                setData(null);
            }
        }
        setChecked(true);
    }, [storageKey]);

    const handlePayment = (plan: string) => {
        // Simulation de paiement: on débloque directement la suite sans reposer le questionnaire.
        localStorage.setItem('context', context);
        localStorage.setItem('creation_flow', JSON.stringify({
            source: 'questionnaire',
            context,
            communType,
            paidPreviewPlan: plan,
            updatedAt: new Date().toISOString(),
        }));
        alert(`Offre ${plan} validée en mode test.`);
        router.push('/medias');
    };

    if (!checked) return <div className="min-h-screen flex items-center justify-center bg-memoir-bg">Chargement de votre aperçu...</div>;

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-memoir-bg px-6">
                <div className="max-w-xl text-center bg-white rounded-2xl border border-memoir-blue/10 shadow-sm p-8">
                    <h1 className="text-2xl font-semibold text-memoir-blue mb-3">Aperçu indisponible</h1>
                    <p className="text-memoir-blue/70 mb-6">
                        Nous n'avons pas retrouve vos reponses du questionnaire pour ce parcours.
                    </p>
                    <button
                        onClick={() => router.push(`/create/questionnaire?communType=${communType}&context=${context}`)}
                        className="btn-primary"
                    >
                        Reprendre le questionnaire
                    </button>
                </div>
            </div>
        );
    }

    const prenom = data.identite?.prenom || 'Nom Inconnu';
    const resume = data.resume || 'Un début d\'histoire...';
    const style = data.style || 'votre style';

    return (
        <div className="min-h-screen bg-memoir-bg py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-1.5 bg-memoir-gold/10 text-memoir-gold rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                        Aperçu gratuit
                    </span>
                    <Title as="h1" className="text-3xl md:text-5xl font-serif italic text-memoir-blue mb-4">
                        {`Le mémorial de ${prenom} prend forme.`}
                    </Title>
                    <p className="text-memoir-blue/60 text-lg">
                        Vous avez posé les fondations. Il ne reste plus qu'à écrire la suite.
                    </p>
                </div>

                {/* Preview Section - attractive but lightweight */}
                <div className="relative mb-16 rounded-[32px] overflow-hidden border border-memoir-gold/20 shadow-xl bg-white max-w-4xl mx-auto">
                    <div className="pointer-events-none select-none p-6 md:p-10 bg-gradient-to-br from-[#FDFBF7] via-white to-[#F8F3E8]">
                        <div className="mx-auto grid max-w-3xl grid-cols-1 md:grid-cols-[220px,1fr] gap-6 rounded-3xl border border-memoir-blue/10 bg-white/90 p-5 shadow-lg">
                            <div className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-stone-100">
                                <Image
                                    src="/image-site2.png"
                                    alt={`Aperçu ${prenom}`}
                                    fill
                                    sizes="220px"
                                    className="object-cover"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-black/40 px-3 py-2 text-xs text-white/90">
                                    {data.identite?.dateNaissance || '----'}{data.identite?.dateDeces ? ` - ${data.identite?.dateDeces}` : ''}
                                </div>
                            </div>

                            <div className="relative">
                                <p className="text-[11px] uppercase tracking-widest text-memoir-blue/50 mb-2">Extrait du mémorial</p>
                                <h3 className="text-3xl font-serif italic text-memoir-blue mb-4">
                                    {`${prenom} ${data.identite?.nom || ''}`.trim()}
                                </h3>
                                <p className="text-memoir-blue/80 leading-relaxed whitespace-pre-line">
                                    {resume}
                                </p>

                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent" />
                                <div className="mt-6 inline-flex items-center rounded-full border border-memoir-gold/40 px-3 py-1 text-xs text-memoir-blue/70">
                                    Style: {String(style)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interaction Block Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white via-white/80 to-transparent flex flex-col justify-end items-center pb-8 z-10 cursor-not-allowed">
                        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-memoir-gold/30 flex items-center gap-2 mb-2">
                            <Lock className="w-4 h-4 text-memoir-gold" />
                            <span className="text-memoir-blue font-serif italic text-sm">Aperçu protégé</span>
                        </div>
                        <p className="text-xs text-memoir-blue/40 font-medium tracking-wide uppercase">Finalisez la commande pour débloquer l'édition</p>
                    </div>

                    {/* Full click blocker */}
                    <div className="absolute inset-0 z-20" onContextMenu={(e) => e.preventDefault()} />
                </div>

                {/* Dynamic Pricing Plans based on Context */}
                <div className="mb-12 text-center">
                    <h2 className="text-2xl font-bold text-memoir-blue mb-8">Votre formule</h2>

                    <div className="flex justify-center">
                        {/* Single Primary Plan based on context */}
                        {(context === 'object_memory') ? (
                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-memoir-gold/20 max-w-md w-full relative overflow-hidden group hover:scale-105 transition-transform">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-memoir-gold to-memoir-neon" />
                                <h3 className="text-2xl font-serif italic text-memoir-blue mb-2">Mémoire d'Objet</h3>
                                <div className="text-5xl font-serif text-memoir-gold mb-2">49€</div>
                                <p className="text-memoir-blue/60 text-sm mb-6 uppercase tracking-widest font-bold">Paiement unique</p>

                                <ul className="space-y-4 text-left text-memoir-blue/70 mb-8 px-4">
                                    <li className="flex items-center gap-3"><Check className="w-5 h-5 text-memoir-gold shrink-0" /> <span>Espace sécurisé à vie</span></li>
                                    <li className="flex items-center gap-3"><Check className="w-5 h-5 text-memoir-gold shrink-0" /> <span>Récit rédigé par Alma</span></li>
                                    <li className="flex items-center gap-3"><Check className="w-5 h-5 text-memoir-gold shrink-0" /> <span>Puce NFC incluse (Ø25mm)</span></li>
                                    <li className="flex items-center gap-3"><Check className="w-5 h-5 text-memoir-gold shrink-0" /> <span>Galerie photos</span></li>
                                </ul>
                                <button onClick={() => handlePayment('objet_49')} className="w-full py-4 bg-memoir-gold text-white font-bold rounded-xl hover:bg-memoir-gold/90 transition-colors shadow-lg shadow-memoir-gold/20">
                                    Débloquer mon mémorial
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-memoir-blue/10 max-w-md w-full relative overflow-hidden group hover:scale-105 transition-transform">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-memoir-blue to-memoir-neon" />
                                <h3 className="text-2xl font-serif italic text-memoir-blue mb-2">{context === 'celebration' ? 'Hommage Vivant' : 'Mémorial en Ligne'}</h3>
                                <div className="text-5xl font-serif text-memoir-blue mb-2">79€</div>
                                <p className="text-memoir-blue/60 text-sm mb-6 uppercase tracking-widest font-bold">Paiement unique</p>

                                <ul className="space-y-4 text-left text-memoir-blue/70 mb-8 px-4">
                                    <li className="flex items-center gap-3"><Check className="w-5 h-5 text-memoir-gold shrink-0" /> <span>Espace dédié à vie</span></li>
                                    <li className="flex items-center gap-3"><Check className="w-5 h-5 text-memoir-gold shrink-0" /> <span>Biographie assistée par IA</span></li>
                                    <li className="flex items-center gap-3"><Check className="w-5 h-5 text-memoir-gold shrink-0" /> <span>Contributions illimitées</span></li>
                                    <li className="flex items-center gap-3"><Check className="w-5 h-5 text-memoir-gold shrink-0" /> <span>Plaque QR Code offerte</span></li>
                                </ul>
                                <button onClick={() => handlePayment('personne_79')} className="w-full py-4 bg-memoir-blue text-white font-bold rounded-xl hover:bg-memoir-blue/90 transition-colors shadow-lg shadow-memoir-blue/20">
                                    Créer ce mémorial
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center text-memoir-blue/40 text-sm">
                    Paiement sécurisé via Stripe. Satisfait ou remboursé sous 14 jours.
                </div>
            </div>
        </div>
    );
}

export default function TeaserPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <TeaserContent />
        </Suspense>
    );
}
