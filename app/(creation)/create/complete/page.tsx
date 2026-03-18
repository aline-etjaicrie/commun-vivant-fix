'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import StepComponent from '@/components/Step';
import Progress from '@/components/Progress';
import { ChevronRight, ChevronLeft, Home } from 'lucide-react';
import { getCompleteSteps } from '../questionnaire/completeSteps';
import { QuestionnaireData } from '@/lib/schema';

function CompleteQuestionnaireContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const memoryId = searchParams?.get('memoryId');
    const contextIndex = searchParams?.get('context') || 'funeral';
    const steps = getCompleteSteps(contextIndex);

    const [stepIndex, setStepIndex] = useState(0);
    const [data, setData] = useState<Partial<QuestionnaireData>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch initial data if available
        setLoading(false);
    }, []);

    const currentStep = steps[stepIndex];
    const isLastStep = stepIndex === steps.length - 1;

    const handleChange = (field: string, value: any) => {
        setData((prev) => {
            const keys = field.split('.');
            if (keys.length === 1) return { ...prev, [field]: value };
            const [key, subKey] = keys;
            return {
                ...prev,
                [key]: {
                    ...(prev[key as keyof QuestionnaireData] as any || {}),
                    [subKey]: value
                }
            };
        });
    };

    const handleNext = async () => {
        if (isLastStep) {
            // Save logic to DB
            // Redirect to memorial page
            if (memoryId) router.push(`/memoire/${memoryId}`);
        } else {
            setStepIndex(prev => prev + 1);
            // Auto-save logic here
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">Chargement...</div>;

    return (
        <div className="min-h-screen bg-memoir-bg flex flex-col">
            {/* Header */}
            <header className="px-6 py-4 bg-white border-b border-memoir-gold/10 flex justify-between items-center sticky top-0 z-50">
                <button onClick={() => router.push('/')} className="p-2 hover:bg-stone-50 rounded-full transition-colors"><Home className="w-5 h-5 text-memoir-blue/50" /></button>
                <span className="text-memoir-blue font-serif font-bold">Enrichir la mémoire</span>
                <div className="w-9" />
            </header>

            <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
                {/* Progress: +6 because initial questionnaire had 5 steps, or logic as requested 6/9?
              Prompt says "Barre de progression : 5/9 blocs"
              Wait, Steps 6 to 10.
              If we display stepIndex + 6, range is 6 to 10.
              Total steps? Prompt: "Etape 6/9" then "Etape 10/9"? Maybe "6/10"?
              The prompt title says "ETAPE 6/9". But then lists "ETAPE 10/9".
              Typo in prompt? 6, 7, 8, 9, 10 = 5 steps.
              If total is 10 (1-5 initial + 6-10).
              Display 6/10 seems correct.
           */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs font-bold text-[#1A1A2E]/40 mb-2 uppercase tracking-widest">
                        <span>Progression</span>
                        <span>{stepIndex + 6} / 10</span>
                    </div>
                    <Progress current={stepIndex + 6} total={10} />
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden border border-[#D4AF37]/10 transition-all duration-500">
                    <StepComponent
                        step={currentStep}
                        data={data}
                        onChange={handleChange}
                    />
                </div>

                <div className="mt-8 flex justify-between">
                    <button
                        onClick={() => setStepIndex(prev => Math.max(0, prev - 1))}
                        className={`px-6 py-3 rounded-full text-[#1A1A2E]/60 hover:bg-white/50 transition-colors flex items-center gap-2 font-medium ${stepIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={stepIndex === 0}
                    >
                        <ChevronLeft className="w-4 h-4" /> Précédent
                    </button>

                    <button
                        onClick={handleNext}
                        className="px-8 py-3 rounded-full bg-[#1A1A2E] text-white font-bold hover:bg-[#1A1A2E]/90 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        {isLastStep ? 'Terminer' : 'Suivant'} <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </main>
        </div>
    );
}

export default function CompleteQuestionnaire() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <CompleteQuestionnaireContent />
        </Suspense>
    );
}
