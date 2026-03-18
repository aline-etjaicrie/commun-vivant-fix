'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import UpgradeOptions from '@/components/UpgradeOptions';

function PaymentContent() {
    const searchParams = useSearchParams();
    const context = searchParams?.get('context') || 'funeral';
    const name = searchParams?.get('firstName') || 'cette personne';

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-12 md:py-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#D4AF37]/5 to-transparent pointer-events-none"></div>
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none"></div>

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
