'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, Mail, Clock, ArrowRight, Plus, AlertCircle, ArrowLeft } from 'lucide-react';
import Title from '@/components/Title';
import { Suspense } from 'react';
import { isPaidPaymentStatus } from '@/lib/paymentStatus';
import {
  STORAGE_KEYS,
  getFinalizationRaw,
  getQuestionnaireDataRaw,
} from '@/lib/creationFlowStorage';
import { resolveSensitiveJourneyCopy } from '@/lib/sensitiveJourneyCopy';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const dynamic = 'force-dynamic';

export default function ConfirmationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">Chargement...</div>}>
            <ConfirmationPageContent />
        </Suspense>
    );
}

function ConfirmationPageContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams?.get('session_id');
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() => (sessionId ? 'loading' : 'error'));
    const [generationStatus, setGenerationStatus] = useState<'pending' | 'generating' | 'done'>('pending');
    const [errorMessage, setErrorMessage] = useState('');
    const [memoryId, setMemoryId] = useState('');
    const [journeyHint, setJourneyHint] = useState<{ context?: string; communType?: string }>({});

    const activeCopy = resolveSensitiveJourneyCopy(journeyHint);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const safeParse = (raw: string | null) => {
            if (!raw) return null;
            try {
                return JSON.parse(raw);
            } catch {
                return null;
            }
        };

        const finalization = safeParse(getFinalizationRaw());
        const flow = safeParse(localStorage.getItem(STORAGE_KEYS.creationFlow));
        const questionnaire = safeParse(getQuestionnaireDataRaw());

        setJourneyHint({
            context: finalization?.context || flow?.context || localStorage.getItem(STORAGE_KEYS.context) || undefined,
            communType: finalization?.communType || flow?.communType || questionnaire?.communType || undefined,
        });
    }, []);

    useEffect(() => {
        if (!sessionId) {
            setErrorMessage("Nous n'avons pas retrouvé la confirmation du paiement.");
            return;
        }

        const verifySession = async () => {
            try {
                // Call API to verify Stripe session
                const res = await fetch(`/api/verify-checkout-session?session_id=${sessionId}`);

                if (!res.ok) {
                    throw new Error('Verification de paiement impossible');
                }

                const data = await res.json();

                if (isPaidPaymentStatus(data.status)) {
                    setStatus('success');
                    setGenerationStatus('generating');

                    const memoryId = data.metadata?.memoryId || data.memoryId;

                    if (!memoryId) {
                        throw new Error('Memory ID manquant apres verification Stripe');
                    }

                    setMemoryId(memoryId);
                    localStorage.setItem(STORAGE_KEYS.currentMemorialId, memoryId);

                    // Trigger text generation with the most relevant payload for the active journey.
                    // ALMA writes a dedicated finalization payload; falling back to questionnaire data keeps
                    // legacy flows working while avoiding stale or unrelated localStorage values.
                    const finalizationRaw = getFinalizationRaw();
                    const finalizationPayload = finalizationRaw ? JSON.parse(finalizationRaw) : null;
                    const questionnaireRaw = getQuestionnaireDataRaw();
                    const questionnaireData = questionnaireRaw ? JSON.parse(questionnaireRaw) : null;
                    const generationData = finalizationPayload?.source === 'alma'
                        ? finalizationPayload
                        : questionnaireData;

                    const { data: auth } = await supabase.auth.getSession();
                    const authToken = auth.session?.access_token;

                    await fetch('/api/generate-memorial', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                        },
                        body: JSON.stringify({
                            memoryId,
                            data: generationData,
                            sessionId,
                        }),
                    });

                    setGenerationStatus('done');
                } else {
                    setErrorMessage("Le paiement n'a pas encore été confirmé. Vous pouvez revenir à l'étape précédente sans perdre ce que vous avez déjà préparé.");
                    setStatus('error');
                }
            } catch (e) {
                console.error(e);
                setErrorMessage("La vérification prend plus de temps que prévu. Rien n'est perdu dans votre parcours.");
                setStatus('error');
            }
        };
        void verifySession();
    }, [sessionId]);

    if (status === 'loading') return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-6">
            <div className="max-w-lg text-center">
                <Title as="h1" className="text-3xl font-serif text-[#1A1A2E]">Nous préparons la suite avec soin</Title>
                <p className="mt-3 text-[#1A1A2E]/65">
                    Votre paiement est en cours de vérification. Cela prend seulement quelques secondes.
                </p>
            </div>
        </div>
    );
    if (status === 'error') return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-6">
            <div className="max-w-xl rounded-3xl border border-[#E7D9C8] bg-white p-8 text-center shadow-lg">
                <AlertCircle className="mx-auto h-16 w-16 text-[#C06A3A]" />
                <Title as="h1" className="mt-5 text-3xl font-serif text-[#1A1A2E]">Nous n'avons pas encore pu finaliser cette étape</Title>
                <p className="mt-4 text-[#1A1A2E]/65">{errorMessage}</p>
                <p className="mt-3 text-sm text-[#1A1A2E]/45">
                    Vous pouvez revenir à l'étape précédente ou reprendre votre parcours un peu plus tard.
                </p>
                <div className="mt-8 flex flex-col gap-3">
                    <button
                        onClick={() => router.push('/create/pay')}
                        className="w-full rounded-full bg-[#1A1A2E] px-6 py-3 font-semibold text-white hover:bg-[#111827]"
                    >
                        {activeCopy.retryPaymentLabel}
                    </button>
                    <button
                        onClick={() => router.push('/faq')}
                        className="w-full rounded-full border border-[#D7D1C8] px-6 py-3 text-[#1A1A2E] hover:border-[#BDAA8B]"
                    >
                        <span className="inline-flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Revenir et demander de l'aide
                        </span>
                    </button>
                </div>
            </div>
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

                    <Title as="h1" className="text-3xl md:text-4xl font-serif font-bold text-[#1A1A2E] mb-4">Paiement confirmé !</Title>
                    <p className="text-lg text-[#1A1A2E]/70 mb-12">
                        {activeCopy.successLead}
                    </p>

                    <div className="bg-[#FDFBF7] p-8 rounded-2xl mb-8 border border-stone-100/50 text-left">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#1A1A2E]/40 mb-6">
                            <Mail className="w-4 h-4" /> Prochaines étapes
                        </h3>

                        <ol className="space-y-6 relative border-l-2 border-stone-200 ml-3">
                            <li className="pl-6 relative">
                                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-[#FDFBF7]"></span>
                                <span className="text-[#1A1A2E] font-medium">Confirmation par email</span>
                                <p className="text-sm text-[#1A1A2E]/50 mt-1">Un récapitulatif vous accompagne pour garder un repère simple.</p>
                            </li>
                            <li className="pl-6 relative">
                                <span className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-[#FDFBF7] transition-colors ${generationStatus === 'done' ? 'bg-green-500' : 'bg-[#D4AF37] animate-pulse'}`}></span>
                                <span className="text-[#1A1A2E] font-medium">Génération du récit IA</span>
                                <p className="text-sm text-[#1A1A2E]/50 mt-1">
                                    {generationStatus === 'generating' ? activeCopy.generateInProgress : 'Première version prête à être relue'}
                                </p>
                            </li>
                            <li className="pl-6 relative">
                                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-stone-300 border-2 border-[#FDFBF7]"></span>
                                <span className="text-[#1A1A2E] font-medium">Enrichissement</span>
                                <p className="text-sm text-[#1A1A2E]/50 mt-1">{activeCopy.successBody}</p>
                            </li>
                        </ol>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-[#1A1A2E]/40 mb-8 bg-stone-50 py-3 rounded-full mx-auto max-w-sm">
                        <Clock className="w-4 h-4" />
                        <span>Temps d'attente estimé : 2-3 minutes</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => router.push(memoryId ? `/dashboard/${memoryId}/validate` : '/dashboard')}
                            className="w-full py-4 bg-[#1A1A2E] text-white rounded-full font-bold shadow-lg hover:bg-[#1A1A2E]/90 transition-all flex items-center justify-center gap-2"
                        >
                            {activeCopy.continueToDraftLabel} <ArrowRight className="w-4 h-4" />
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
