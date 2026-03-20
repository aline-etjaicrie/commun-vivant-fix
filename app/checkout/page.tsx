'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import UpgradeOptions from '@/components/UpgradeOptions';
import { useBetaAccess } from '@/lib/client/betaAccess';

function PaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const context = searchParams?.get('context') || 'funeral';
    const name = searchParams?.get('firstName') || 'cette personne';
    const isBeta = useBetaAccess();

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-12 md:py-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#D4AF37]/5 to-transparent pointer-events-none"></div>
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none"></div>

            {isBeta && (
                <div className="relative z-10 mx-auto mb-6 max-w-4xl px-4">
                    <div className="rounded-2xl border border-[#2B5F7D]/20 bg-[#EFF5F9] px-5 py-4">
                        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                            <div>
                                <p className="font-semibold text-[#0F2A44]">Accès BETA activé</p>
                                <p className="text-sm text-[#5E6B78]">Mode test pour cet email — vous pouvez continuer sans payer.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => router.push('/medias')}
                                className="shrink-0 rounded-xl bg-[#2B5F7D] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1E4A61] transition"
                            >
                                Continuer sans payer →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10 container mx-auto px-4">
                <UpgradeOptions context={context} firstName={name} />
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <PaymentContent />
        </Suspense>
    );
}
