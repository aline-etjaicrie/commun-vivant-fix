'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleAuth = async () => {
            const code = searchParams?.get('code');
            const next = searchParams?.get('next') || searchParams?.get('returnUrl') || '/dashboard';
            const error = searchParams?.get('error');

            if (error) {
                console.error('Auth error:', error);
                router.push('/login?error=' + error);
                return;
            }

            if (code) {
                try {
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) throw error;
                    // Session established in localStorage
                    router.push(next);
                } catch (err: any) {
                    console.error('Error exchanging code:', err);
                    router.push('/login?error=' + err.message);
                }
            } else {
                // No code, redirect to login
                router.push('/login');
            }
        };

        handleAuth();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F2A44] text-white">
            <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-[#C9A24D] border-t-transparent rounded-full mx-auto mb-4" />
                <p>Authentification en cours...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0F2A44]" />}>
            <AuthCallbackContent />
        </Suspense>
    );
}
