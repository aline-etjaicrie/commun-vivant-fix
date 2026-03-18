'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, ArrowRight, Edit3, RefreshCw } from 'lucide-react';
import { isIsolatedCreationFlow } from '@/lib/almaQuestionnaireIsolation';
import { CommunType, resolveCommunType, getLegacyContextForCommunType, isCommunType } from '@/lib/communTypes';
import { isAlmaBetaActive } from '@/lib/featureFlags';

function AlmaApercuContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isIsolated = isIsolatedCreationFlow(searchParams);
    const communType = resolveCommunType(searchParams);
    const [teaserText, setTeaserText] = useState('');
    const [context, setContext] = useState('');
    const [currentCommunType, setCurrentCommunType] = useState(communType);
    const [subjectName, setSubjectName] = useState('');
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [regenerationCount, setRegenerationCount] = useState(0);
    const MAX_REGENERATIONS = 3;
    const teaserTextKey = isIsolated ? 'alma_teaser_text_dev' : 'alma_teaser_text';
    const almaContextKey = isIsolated ? 'alma_context_dev' : 'alma_context';
    const almaSubjectKey = isIsolated ? 'alma_subject_name_dev' : 'alma_subject_name';
    const almaGenreKey = isIsolated ? 'alma_genre_dev' : 'alma_genre';
    const almaCollectedInfoKey = isIsolated ? 'alma_collected_info_dev' : 'alma_collected_info';
    const conversationKey = `almaConversation_${isIsolated ? `dev_${context}` : context}`;
    const almaCommunTypeKey = isIsolated ? 'alma_commun_type_dev' : 'alma_commun_type';

    const handleRegenerate = async () => {
        if (regenerationCount >= MAX_REGENERATIONS) return;
        setIsRegenerating(true);

        try {
            const conversationHistory = JSON.parse(localStorage.getItem(conversationKey) || '[]');
            const collectedInfo = JSON.parse(localStorage.getItem(almaCollectedInfoKey) || '{}');

            const response = await fetch('/api/alma/generate-teaser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationHistory,
                    collectedInfo,
                    context,
                    communType: currentCommunType,
                    genre: localStorage.getItem(almaGenreKey),
                    subjectName: localStorage.getItem(almaSubjectKey),
                }),
            });

            const data = await response.json();
            setTeaserText(data.teaserText);
            localStorage.setItem(teaserTextKey, data.teaserText);
            setRegenerationCount(prev => prev + 1);
        } catch (e) {
            console.error('Erreur régénération');
        } finally {
            setIsRegenerating(false);
        }
    };

    useEffect(() => {
        // Récupérer les données sauvegardées
        const teaser = localStorage.getItem(teaserTextKey);
        const ctx = localStorage.getItem(almaContextKey) || getLegacyContextForCommunType(communType);
        const name = localStorage.getItem(almaSubjectKey);
        const storedCommunType = localStorage.getItem(almaCommunTypeKey);

        if (!teaser) {
            // Si pas de teaser, rediriger vers Alma (Create path)
            router.push(isIsolated ? '/alma-dev' : '/create/alma');
            return;
        }

        setTeaserText(teaser);
        setContext(ctx || 'honorer');
        setSubjectName(name || '');
        const nextCommunType: CommunType =
            isCommunType(storedCommunType || '') ? (storedCommunType as CommunType) : communType;
        setCurrentCommunType(nextCommunType);
    }, [almaCommunTypeKey, almaContextKey, almaSubjectKey, communType, isIsolated, router, teaserTextKey]);

    const handleContinue = () => {
        if (isAlmaBetaActive()) {
            router.push('/medias');
            return;
        }

        const targetCommunType = isCommunType(currentCommunType) ? currentCommunType : 'deces';
        const questionnaireContext = getLegacyContextForCommunType(targetCommunType);
        if (isIsolated) {
            router.push(`/questionnaire-dev?context=${questionnaireContext}&communType=${targetCommunType}&isolated=1`);
            return;
        }
        // Rediriger vers la page tarifs avec le contexte
        router.push(`/alma/pricing?context=${questionnaireContext}&communType=${targetCommunType}`);
    };

    const handleModify = () => {
        const targetCommunType = isCommunType(currentCommunType) ? currentCommunType : 'deces';
        const nextContext = getLegacyContextForCommunType(targetCommunType);
        // Retour à Alma pour modifier
        const query = isIsolated
            ? `?context=${nextContext}&communType=${targetCommunType}&isolated=1`
            : `?context=${nextContext}&communType=${targetCommunType}`;
        router.push(`${isIsolated ? '/alma-dev' : '/create/alma'}${query}`);
    };

    if (!teaserText) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-memoir-bg">
                <div className="animate-spin w-8 h-8 border-4 border-memoir-gold border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-memoir-bg py-12 px-4">
            <div className="max-w-3xl mx-auto">

                {/* En-tête */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-memoir-gold/10 px-4 py-2 rounded-full mb-4">
                        <Sparkles className="w-4 h-4 text-memoir-gold" />
                        <span className="text-sm text-memoir-blue font-medium">Aperçu généré par Alma</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif text-memoir-blue mb-3">
                        Voilà ce que ça pourrait donner...
                    </h1>
                    <p className="text-memoir-blue/60 text-lg">
                        {subjectName && `Pour ${subjectName}`}
                    </p>
                </div>

                {/* Carte aperçu */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8 border border-memoir-gold/20">
                    <div className="prose prose-lg max-w-none">
                        <p className="text-memoir-blue leading-relaxed font-light text-lg whitespace-pre-wrap">
                            {teaserText}
                        </p>
                    </div>

                    <div className="mt-8 pt-8 border-t border-memoir-gold/10">
                        <p className="text-memoir-blue/50 text-sm italic text-center">
                            Ceci n'est qu'un début... Le texte complet sera bien plus riche.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-center -mt-4 mb-8">
                    <button
                        onClick={handleRegenerate}
                        disabled={isRegenerating || regenerationCount >= MAX_REGENERATIONS}
                        className="flex items-center gap-2 text-sm text-memoir-blue/60 hover:text-memoir-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isRegenerating ? (
                            <div className="w-4 h-4 border-2 border-memoir-gold border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                        {regenerationCount >= MAX_REGENERATIONS
                            ? 'Limite atteinte (3/3)'
                            : `Régénérer le texte (${MAX_REGENERATIONS - regenerationCount} restant${MAX_REGENERATIONS - regenerationCount > 1 ? 's' : ''})`
                        }
                    </button>
                </div>

                {/* Explications */}
                <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-100">
                    <h2 className="text-memoir-blue font-semibold mb-3 flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-memoir-gold" />
                        Ça vous plaît ?
                    </h2>
                    <ul className="space-y-2 text-memoir-blue/70 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="text-memoir-gold mt-1">✓</span>
                            <span>Après paiement, vous pourrez <strong>modifier</strong> le texte comme vous le souhaitez</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-memoir-gold mt-1">✓</span>
                            <span>Vous pourrez demander à Alma de <strong>régénérer</strong> le texte (jusqu'à 3 fois)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-memoir-gold mt-1">✓</span>
                            <span>Vous choisirez parmi <strong>3 templates visuels</strong> adaptés au type de commun sélectionné</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-memoir-gold mt-1">✓</span>
                            <span>Vous pourrez <strong>changer de template</strong> à tout moment, même après publication</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-memoir-gold mt-1">✓</span>
                            <span>Vous pourrez ajouter des <strong>photos, vidéos, audios</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-memoir-gold mt-1">✓</span>
                            <span>Vous recevrez un <strong>QR code PDF</strong> gratuit</span>
                        </li>
                    </ul>
                </div>

                {/* Call to actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleModify}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-memoir-blue text-memoir-blue rounded-xl hover:bg-memoir-blue hover:text-white transition-all font-medium"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Modifier d'abord
                    </button>

                    <button
                        onClick={handleContinue}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-memoir-gold text-white rounded-xl hover:bg-memoir-gold/90 transition-all font-medium shadow-lg"
                    >
                        Ça me plaît, je continue
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Mention rassurante */}
                <p className="text-center text-memoir-blue/40 text-xs mt-6">
                    Paiement sécurisé • Satisfaction garantie • Support 7j/7
                </p>

            </div>
        </div>
    );
}

export default function AlmaApercuPage() {
    return (
        <Suspense fallback={null}>
            <AlmaApercuContent />
        </Suspense>
    );
}
