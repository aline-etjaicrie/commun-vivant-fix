'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Edit2, Sparkles, PenTool } from 'lucide-react';

const supabase = createClient();

export default function MethodChoice() {
    return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">Chargement...</div>}>
            <MethodChoiceContent />
        </React.Suspense>
    );
}

function MethodChoiceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams?.get('type') || 'honorer'; // feter, transmettre, honorer
    const agencyId = searchParams?.get('agency');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Redirect if not logged in
                const returnUrl = encodeURIComponent(`/create/method?type=${type}`);
                router.push(`/login?returnUrl=${returnUrl}`);
                return;
            }
            setUser(user);
            setLoading(false);
        };
        void checkAuth();
    }, [router, type]);

    const handleChoice = async (method: 'questionnaire' | 'alma' | 'libre') => {
        if (!user) return;
        setCreating(method);

        try {
            // Create Memory
            const { data: memory, error } = await supabase
                .from('memories')
                .insert({
                    user_id: user.id,
                    owner_user_id: user.id,
                    // email: user.email, // Assume user_id links to email
                    context: type, // context_type in prompt, using 'context' to match existing schema if set
                    payment_status: 'pending',
                    status: 'draft',
                    agency_id: agencyId || null,
                    created_by: agencyId ? 'agency' : 'user',
                })
                .select('id')
                .single();

            if (error) throw error;
            if (!memory) throw new Error('Failed to create');

            // Redirect
            if (method === 'questionnaire') {
                router.push(`/create?memoryId=${memory.id}`); // Standard flow
            } else if (method === 'alma') {
                const mapping: Record<string, { context: string; communType: string }> = {
                    honorer: { context: 'funeral', communType: 'deces' },
                    feter: { context: 'living_story', communType: 'hommage-vivant' },
                    transmettre: { context: 'object_memory', communType: 'memoire-objet' },
                };
                const flow = mapping[type] || mapping.honorer;
                router.push(`/create/alma?memoryId=${memory.id}&context=${flow.context}&communType=${flow.communType}`);
            } else if (method === 'libre') {
                router.push(`/create/libre?memoryId=${memory.id}`);
            }
        } catch (e) {
            console.error(e);
            alert('Une erreur est survenue.');
            setCreating(null);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">Chargement...</div>;

    const titles = {
        feter: 'Vous vous apprêtez à célébrer quelqu\'un de vivant',
        transmettre: 'Vous vous apprêtez à transmettre une mémoire',
        honorer: 'Vous vous apprêtez à honorer une mémoire'
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-16 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-4xl font-serif text-[#1A1A2E] mb-4">
                        Comment souhaitez-vous raconter cette histoire ?
                    </h1>
                    <p className="text-[#D4AF37] font-medium tracking-wide">
                        {titles[type as keyof typeof titles]}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">

                    {/* CARD 1: Questionnaire */}
                    <div
                        onClick={() => handleChoice('questionnaire')}
                        className="group relative bg-white rounded-2xl shadow-sm border border-stone-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden ring-1 ring-transparent hover:ring-[#D4AF37]/20"
                    >
                        <div className="w-12 h-12 bg-[#FDFBF7] rounded-[14px] flex items-center justify-center mb-6 text-[#1A1A2E] group-hover:bg-[#1A1A2E] group-hover:text-[#D4AF37] transition-colors">
                            <Edit2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">Répondre à un questionnaire</h3>
                        <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                            Guidé, structuré, rapide. Questions simples et progressives. Idéal si vous voulez un cadre.
                        </p>
                        <div className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-2 group-hover:gap-3 transition-all">
                            Choisir cette méthode →
                        </div>
                        {creating === 'questionnaire' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#1A1A2E] border-t-transparent rounded-full animate-spin"></div></div>}
                    </div>

                    {/* CARD 2: Alma */}
                    <div
                        onClick={() => handleChoice('alma')}
                        className="group relative bg-gradient-to-br from-[#1A1A2E] to-[#27384E] rounded-2xl shadow-xl border border-[#D4AF37]/30 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden ring-2 ring-[#D4AF37]/30"
                    >
                        <div className="absolute top-0 right-0 bg-[#D4AF37] text-[#1A1A2E] text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                            Recommandé
                        </div>
                        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#D4AF37]/20 blur-2xl" />
                        <div className="w-12 h-12 bg-[#FDFBF7] rounded-[14px] flex items-center justify-center mb-6 text-[#1A1A2E] group-hover:bg-[#1A1A2E] group-hover:text-[#D4AF37] transition-colors">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Conversation avec Alma</h3>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-3">La bonne âme du parcours</p>
                        <p className="text-sm text-white/80 mb-6 leading-relaxed">
                            Naturel, accompagné, personnel. Parlez librement avec Alma plutôt que remplir un formulaire.
                        </p>
                        <div className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-2 group-hover:gap-3 transition-all">
                            Choisir cette méthode →
                        </div>
                        {creating === 'alma' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#1A1A2E] border-t-transparent rounded-full animate-spin"></div></div>}
                    </div>

                    {/* CARD 3: Libre */}
                    <div
                        onClick={() => handleChoice('libre')}
                        className="group bg-white rounded-2xl shadow-sm border border-stone-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                    >
                        <div className="w-12 h-12 bg-[#FDFBF7] rounded-[14px] flex items-center justify-center mb-6 text-[#1A1A2E] group-hover:bg-[#1A1A2E] group-hover:text-white transition-colors">
                            <PenTool className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">Écrire librement</h3>
                        <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                            Créatif, personnel, sans limite. Écrivez à votre façon, aucune contrainte.
                        </p>
                        <div className="text-xs font-bold uppercase tracking-widest text-[#1A1A2E] flex items-center gap-2 group-hover:gap-3 transition-all">
                            Choisir cette méthode →
                        </div>
                        {creating === 'libre' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#1A1A2E] border-t-transparent rounded-full animate-spin"></div></div>}
                    </div>

                </div>

                <div className="text-center mt-12">
                    <button onClick={() => router.push('/')} className="text-sm text-stone-400 hover:text-[#1A1A2E] underline decoration-stone-300">
                        ← Retour à l'accueil
                    </button>
                </div>
            </div>
        </div>
    );
}
