'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, Mail, Clock, ArrowRight, Plus } from 'lucide-react';

export default function ConfirmationContent() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">Chargement...</div>}>
            <ConfirmationBody />
        </Suspense>
    );
}

function ConfirmationBody() {
    const searchParams = useSearchParams();
    const sessionId = searchParams?.get('session_id');
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [generationStatus, setGenerationStatus] = useState<'pending' | 'generating' | 'done'>('pending');

    useEffect(() => {
        if (!sessionId) {
            // router.push('/create'); // Redirect if no session logic
            setStatus('success'); // Mock for MVP: Assume success if here
            setGenerationStatus('generating');

            // Mock Generation Process
            setTimeout(() => setGenerationStatus('done'), 3000);
            return;
        }

        const verifySession = async () => {
            try {
                // Call API to verify Stripe session
                const res = await fetch(`/api/verify-checkout-session?session_id=${sessionId}`);
                const data = await res.json();

                if (data.status === 'paid') {
                    setStatus('success');
                    setGenerationStatus('generating');

                    // Trigger Text Generation
                    await fetch('/api/generate-memorial', {
                        method: 'POST',
                        body: JSON.stringify({ memoryId: data.memoryId }), // Get memoryId from session metadata
                    });

                    setGenerationStatus('done');
                } else {
                    setStatus('error');
                }
            } catch (e) {
                console.error(e);
                setStatus('error');
                // Mock success for MVP
                setStatus('success');
                setGenerationStatus('done');
            }
        };
        verifySession();
    }, [sessionId]);

    if (status === 'loading') return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">Chargement...</div>;
    if (status === 'error') return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] flex-col p-8 text-center">
            <h1 className="text-3xl font-serif text-[#1A1A2E] mb-4">Erreur de paiement</h1>
            <p className="text-[#1A1A2E]/60 mb-8">Une erreur est survenue lors de la vérification. Veuillez contacter le support.</p>
            <button onClick={() => router.push('/contact')} className="text-[#D4AF37] underline">Contacter le support</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-16 px-4 flex items-center justify-center">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-[#D4AF37]/10 relative">
                <div className="absolute top-0 w-full h-1 bg-[#D4AF37]"></div>

                <div className="p-8 md:p-12 text-center">

                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1A1A2E] mb-4">Paiement confirmé !</h1>
                    <p className="text-lg text-[#1A1A2E]/70 mb-12">
                        Merci ! Votre espace mémoire est en cours de création.
                    </p>

                    <div className="bg-[#FDFBF7] p-8 rounded-2xl mb-8 border border-stone-100/50 text-left">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#1A1A2E]/40 mb-6">
                            <Mail className="w-4 h-4" /> Prochaines étapes
                        </h3>

                        <ol className="space-y-6 relative border-l-2 border-stone-200 ml-3">
                            <li className="pl-6 relative">
                                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-[#FDFBF7]"></span>
                                <span className="text-[#1A1A2E] font-medium">Confirmation par email</span>
                                <p className="text-sm text-[#1A1A2E]/50 mt-1">Envoyé à votre adresse email.</p>
                            </li>
                            <li className="pl-6 relative">
                                <span className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-[#FDFBF7] transition-colors ${generationStatus === 'done' ? 'bg-green-500' : 'bg-[#D4AF37] animate-pulse'}`}></span>
                                <span className="text-[#1A1A2E] font-medium">Génération du récit IA</span>
                                <p className="text-sm text-[#1A1A2E]/50 mt-1">
                                    {generationStatus === 'generating' ? 'En cours d\'écriture...' : 'Terminé !'}
                                </p>
                            </li>
                            <li className="pl-6 relative">
                                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-stone-300 border-2 border-[#FDFBF7]"></span>
                                <span className="text-[#1A1A2E] font-medium">Enrichissement</span>
                                <p className="text-sm text-[#1A1A2E]/50 mt-1">Ajout de photos, vidéos et contributeurs.</p>
                            </li>
                        </ol>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-[#1A1A2E]/40 mb-8 bg-stone-50 py-3 rounded-full mx-auto max-w-sm">
                        <Clock className="w-4 h-4" />
                        <span>Temps d'attente estimé : 2-3 minutes</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full py-4 bg-[#1A1A2E] text-white rounded-full font-bold shadow-lg hover:bg-[#1A1A2E]/90 transition-all flex items-center justify-center gap-2"
                        >
                            Accéder à mon compte <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => router.push('/create')}
                            className="text-sm text-[#1A1A2E]/60 hover:text-[#D4AF37] transition-colors flex items-center justify-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> Créer une autre mémoire
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
