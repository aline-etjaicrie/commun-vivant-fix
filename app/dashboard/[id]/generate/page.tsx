'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Sparkles, Users, FileText, CheckCircle } from 'lucide-react';
import Title from '@/components/Title';
import { STORAGE_KEYS } from '@/lib/creationFlowStorage';
import { buildGenerationRequestData } from '@/lib/buildGenerationRequestData';
import {
    buildWritingStylePromptBlock,
    getWritingStyle,
    resolveWritingStyle,
} from '@/lib/compositionStudio';
import { resolveIdentity } from '@/lib/memorialRuntime';
import { createClient } from '@/lib/supabase/client';
import { getValidateUrl } from '@/lib/validateUrl';

const MOCK_TESTIMONIES = [
    { name: 'Vous (Aline Weber)', status: 'complete' },
    { name: 'Marie Dupont', status: 'complete' },
    { name: 'Paul Martin', status: 'pending' },
];

const supabase = createClient();

async function getAuthHeaders(): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const GeneratePage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');
    const [realData, setRealData] = useState<any>(null);
    const getRecoveryUrl = () => {
        const communType = realData?.communType || 'deces';
        const context = realData?.context || 'funeral';
        return `/create/questionnaire?communType=${encodeURIComponent(communType)}&context=${encodeURIComponent(context)}`;
    };

    useEffect(() => {
        // Gather all data
        const loadData = () => {
            const safeParse = (raw: string | null) => {
                if (!raw) return null;
                try {
                    return JSON.parse(raw);
                } catch {
                    return null;
                }
            };
            const context = localStorage.getItem('context') || 'funeral';
            const finalizationRaw =
                localStorage.getItem('memorial_finalization') || localStorage.getItem('memorial_finalization_dev');
            const finalization = safeParse(finalizationRaw);
            const flowRaw = localStorage.getItem('creation_flow');
            const flow = safeParse(flowRaw);

            // Try to find any alma conversation
            const almaFuneral = localStorage.getItem('almaConversation_funeral');
            const almaLiving = localStorage.getItem('almaConversation_living_story');
            const almaObject = localStorage.getItem('almaConversation_object_memory');
            const almaData = almaFuneral || almaLiving || almaObject;

            const mediaData = localStorage.getItem('mediaData');
            const previewData = localStorage.getItem('memorialPreviewData');

            // Try to find questionnaire data (final key first, then any draft key)
            const questionnaireFinal = localStorage.getItem('questionnaireData');
            const questionnaireDraftKey = Object.keys(localStorage).find((key) =>
                key.startsWith('questionnaire-memoire-')
            );
            const questionnaireDraft = questionnaireDraftKey ? localStorage.getItem(questionnaireDraftKey) : null;
            const qData = questionnaireFinal || questionnaireDraft;
            const questionnaireData = safeParse(qData);

            setRealData({
                alma: safeParse(almaData),
                media: safeParse(mediaData),
                preview: safeParse(previewData),
                questionnaire: questionnaireData,
                context: finalization?.context || flow?.context || context,
                communType: finalization?.communType || flow?.communType || null,
            });
        };
        loadData();
    }, []);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setProgress(0);

        // Steps for UI
        const steps = [
            { text: 'Analyse des souvenirs et de la conversation...', duration: 2000 },
            { text: 'Identification des traits de caractère...', duration: 2500 },
            { text: 'Rédaction de l\'hommage...', duration: 3000 },
            { text: 'Mise en forme finale...', duration: 1500 },
        ];

        // Start UI animation in parallel
        let currentProgress = 0;
        let stepIndex = 0;

        // We will run the API call in background
        const generatePromise = (async () => {
            const conversationHistory = realData?.alma || [];
            const questionnaire = realData?.questionnaire || {};
            const previewData = realData?.preview || {};
            const context = realData?.context || localStorage.getItem('context') || 'funeral';
            const communType = realData?.communType || 'deces';
            const validatedThemes = Array.isArray(realData?.media?.imageThemes)
                ? realData.media.imageThemes
                : Array.isArray(realData?.media?.memoryImageEnergies)
                ? realData.media.memoryImageEnergies
                : [];
            const identity = resolveIdentity(questionnaire);
            const writingStyleId = resolveWritingStyle(
                previewData?.writingStyle || previewData?.style || questionnaire?.writingStyle || questionnaire?.style,
                communType
            );
            const selectedWritingStyle = getWritingStyle(writingStyleId);
            const writingStylePromptBlock = buildWritingStylePromptBlock(writingStyleId);
            const liens = questionnaire.liens || questionnaire.liensVie || {};
            const occasion = questionnaire.occasion || {};

            const conversationText = conversationHistory.length > 0
                ? conversationHistory.map((m: any) => `${m.role === 'user' ? 'Utilisateur' : 'Alma'}: ${m.content}`).join('\n')
                : "Aucune conversation Alma disponible.";

            const questionnaireText = questionnaire
                ? `Données du questionnaire :
                   Prénom : ${identity?.prenom || 'Inconnu'}
                   Nom : ${identity?.nom || ''}
                   Caractère : ${(questionnaire.caractere?.adjectifs || []).join(', ')}
                   Valeurs : ${(questionnaire.valeurs?.selected || []).join(', ')}
                   Message : ${questionnaire.resume || questionnaire.message?.content || ''}
                   Carriere : ${questionnaire.talents?.carriere || ''}
                   Sport : ${questionnaire.talents?.sport || ''}
                   Blagues : ${questionnaire.talents?.blagues || ''}
                   Ami(e)s : ${liens?.amis || ''}
                   Personnes qui comptent : ${liens?.personnesQuiComptent || ''}
                   Voyages : ${liens?.voyages || ''}
                   Lieux de vie : ${liens?.lieuxDeVie || ''}
                   Anecdotes : ${liens?.anecdotes || ''}
                   Occasion : ${occasion?.type || ''}
                   Precisions sur l'occasion : ${occasion?.details || ''}
                  `
                : "Aucune donnée de questionnaire disponible.";
            const requestData = buildGenerationRequestData({
                questionnaire,
                media: realData?.media,
                previewData,
                context,
                communType,
                almaConversationText: conversationText,
            });

            let dynamicConsignes = '';
            let goal = '';

            if (context === 'object_memory') {
                goal = "Rédige l'histoire d'un objet précieux pour une page de mémoire.";
                dynamicConsignes = `
                - L'objet est le personnage principal. Raconte son origine, sa matière et ce qu'il symbolise.
                - Utilise un ton narratif, presque comme un conte ou une fiche de musée habitée.
                - Ne parle pas de "décès" ou de "disparition" sauf si c'est explicitement lié à l'histoire de l'objet.
                `;
            } else if (context === 'living_story') {
                goal = "Rédige un récit de vie (biographie) célébrant une personne vivante.";
                dynamicConsignes = `
                - Utilise le PRÉSENT. La personne est bien vivante, c'est un hommage à son parcours actuel.
                - Évite tout ton mélancolique ou funèbre. C'est une célébration de la vie, des passions et de l'avenir.
                `;
            } else {
                goal = "Rédige un texte d'hommage pour un mémorial numérique (page web de souvenir) suite à un départ.";
                dynamicConsignes = `
                - IMPORTANT : Ce texte NE DOIT PAS être un discours ou une oraison funèbre à lire lors d'une cérémonie.
                - Évite ABSOLUMENT les formules de type "Nous sommes réunis aujourd'hui", "En ce jour de deuil", "Adieu".
                - Il doit s'agir d'un récit de vie intemporel, structuré et touchant, destiné à être lu sur internet par les proches au fil du temps.
                `;
            }

            const prompt = `
            OBJECTIF : ${goal}
            
            CONSIGNES GÉNÉRALES :
            ${writingStylePromptBlock}
            - Respecte ce style d'écriture du debut a la fin. Le rendu doit etre nettement perceptible.
            - N'utilise pas un ton generique : adapte le rythme, les images et la formulation au style "${selectedWritingStyle.label}".
            - Divise le texte en paragraphes thématiques clairs avec des titres élégants.
            - Le texte doit être fidèle aux anecdotes et traits de caractère décrits ci-dessous.
            - Prends en compte l'ambiance suggérée par les souvenirs (couleurs, odeurs, paysages) pour créer une atmosphère immersive.
            ${dynamicConsignes}
            
            INFORMATIONS QUESTIONNAIRE :
            ${questionnaireText}

            CONVERSATION ALMA :
            ${conversationText}

            THÈMES DOMINANTS VALIDÉS :
            ${validatedThemes.length > 0 ? validatedThemes.join(', ') : 'Aucun'}

            Si des thèmes dominants validés sont fournis :
            - intègre-les naturellement dans le récit ;
            - ne mentionne jamais qu'elles proviennent d'images ;
            - n'invente aucun fait supplémentaire.
            `;

            try {
                const parseJsonResponse = async (response: Response) => {
                    const raw = await response.text();
                    if (!raw) return null;
                    try {
                        return JSON.parse(raw);
                    } catch {
                        return { error: raw.trim() || 'Réponse serveur illisible' };
                    }
                };

                const authHeaders = await getAuthHeaders();
                const res = await fetch('/api/generate-memorial', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...authHeaders,
                    },
                    body: JSON.stringify({
                        memoryId: id, // Pass the memory ID from params
                        prompt,
                        data: requestData,
                    })
                });
                const data = await parseJsonResponse(res);
                if (!res.ok) {
                    throw new Error(data?.error || 'Generation impossible');
                }
                return data?.text || "Erreur lors de la génération.";
            } catch (e) {
                console.error(e);
                return "Erreur lors de la génération.";
            }
        })();

        const runStep = async () => {
            if (stepIndex >= steps.length) {
                // Wait for generation to finish if it hasn't
                const text = await generatePromise;

                // Save generated text
                localStorage.setItem('generatedMemorialText', text);

                // Redirect
                router.push(getValidateUrl(id));
                return;
            }

            const step = steps[stepIndex];
            setCurrentStep(step.text);

            const progressIncrement = 100 / steps.length;

            // Animate progress bar for this step
            // We blindly animate for 'duration'
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const p = Math.min(elapsed / step.duration, 1);
                // current overall progress
                const baseProgress = stepIndex * progressIncrement;
                const stepProgress = p * progressIncrement;
                setProgress(baseProgress + stepProgress);

                if (p < 1) requestAnimationFrame(animate);
                else {
                    stepIndex++;
                    runStep();
                }
            };
            animate();
        };

        runStep();
    };

    if (isGenerating) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0F2A44] to-[#1C3B5A] flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl p-12 max-w-2xl w-full text-center">
                    <div className="mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#C9A24D] to-[#E1C97A] rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
                            <Sparkles className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-3xl text-[#0F2A44] mb-3 font-normal" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                            Création de votre mémorial
                        </h2>
                        <p className="text-lg text-gray-600 italic">{currentStep}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#C9A24D] to-[#E1C97A] transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}%</p>
                    </div>

                    <div className="text-sm text-gray-500 italic">
                        <p>Cette opération prend généralement quelques secondes</p>
                        <p className="mt-1">Merci de patienter...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F5F4F2] to-white">
            {/* Header */}
            <header className="bg-white border-b border-[#C9A24D]/20 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/medias" className="flex items-center gap-2 text-[#0F2A44] hover:text-[#C9A24D] transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                        <span>Retour aux médias</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#C9A24D]/20 to-[#E1C97A]/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-[#C9A24D]" />
                    </div>
                    <Title as="h1" className="text-4xl md:text-5xl text-[#0F2A44] mb-3 font-normal" style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}>
                        Générer le mémorial
                    </Title>
                    <p className="text-xl text-gray-600 italic max-w-2xl mx-auto">
                        Nous allons créer un texte unique à partir de votre conversation avec Alma, de vos réponses et, si besoin, des souvenirs déjà partagés par vos proches.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-xl border border-[#C9A24D]/20 p-6 text-center">
                        <Users className="w-8 h-8 text-[#C9A24D] mx-auto mb-3" />
                        <p className="text-3xl font-medium text-[#0F2A44] mb-1">
                            {realData?.alma ? '1' : '0'}
                        </p>
                        <p className="text-sm text-gray-600">Conversation Alma</p>
                    </div>

                    <div className="bg-white rounded-xl border border-[#C9A24D]/20 p-6 text-center">
                        <FileText className="w-8 h-8 text-[#C9A24D] mx-auto mb-3" />
                        <p className="text-3xl font-medium text-[#0F2A44] mb-1">
                            {realData?.media?.galleryPhotos?.length || 0}
                        </p>
                        <p className="text-sm text-gray-600">Photos ajoutées</p>
                    </div>

                    <div className="bg-white rounded-xl border border-[#C9A24D]/20 p-6 text-center">
                        <Sparkles className="w-8 h-8 text-[#C9A24D] mx-auto mb-3" />
                        <p className="text-3xl font-medium text-[#0F2A44] mb-1">IA</p>
                        <p className="text-sm text-gray-600">Synthèse intelligente</p>
                    </div>
                </div>


                {/* Info Box */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg mb-8">
                    <div className="flex gap-3">
                        <div className="text-blue-600 text-2xl">ℹ️</div>
                        <div>
                            <h3 className="text-blue-900 font-medium mb-2">Comment fonctionne la génération ?</h3>
                            <ul className="text-sm text-blue-800 leading-relaxed space-y-1">
                                <li>• L'IA analyse votre conversation avec Alma</li>
                                <li>• Elle identifie les thèmes, anecdotes et valeurs communes</li>
                                <li>• Les souvenirs deja recueillis aupres des proches sont integres avec discretion</li>
                                <li>• Le texte respecte le ton choisi dans l’atelier de composition</li>
                                <li>• Vous pourrez ensuite le relire, modifier et approuver</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="text-center">
                    {(!realData?.alma && !realData?.questionnaire) ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
                            <p className="text-amber-800">
                                Donnees manquantes: aucune reponse Alma ou questionnaire n'a ete retrouvee pour ce parcours.
                            </p>
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                                <button
                                    onClick={() => router.push(getRecoveryUrl())}
                                    className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                                >
                                    Reprendre le questionnaire
                                </button>
                                <button
                                    onClick={() => router.push('/create/alma')}
                                    className="inline-flex items-center gap-2 rounded-lg border border-amber-700 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                                >
                                    Reprendre avec Alma
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleGenerate}
                            className="inline-flex items-center gap-3 px-12 py-4 bg-gradient-to-r from-[#C9A24D] to-[#E1C97A] text-white rounded-xl hover:shadow-xl transition-all font-medium text-lg"
                        >
                            <Sparkles className="w-6 h-6" />
                            <span>Générer le mémorial</span>
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}

export default GeneratePage;
