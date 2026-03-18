'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  STORAGE_KEYS,
  getFinalizationRaw,
  getQuestionnaireDataRaw,
} from '@/lib/creationFlowStorage';
import { resolveCommunTypeFromPayload } from '@/lib/almaProfiles';
import { resolveSensitiveJourneyCopy } from '@/lib/sensitiveJourneyCopy';
import { supabase } from '@/lib/supabase';
import { markMemorialAsPaid } from '@/lib/paymentHelpers';
import { isPaidPaymentStatus } from '@/lib/paymentStatus';
import { CheckCircle, Loader2, AlertCircle, HeartHandshake, ArrowLeft } from 'lucide-react';

function AlmaConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // ... (rest of the component logic)
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [journeyHint, setJourneyHint] = useState<{ context?: string; communType?: string }>({});

  const activeCopy = resolveSensitiveJourneyCopy({
    context: paymentDetails?.context || journeyHint.context,
    communType: journeyHint.communType,
  });

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

  const verifyPayment = useCallback(async () => {
    try {
      const sessionId = searchParams?.get('session_id');

      if (!sessionId) {
        setStatus('error');
        setErrorMessage("Nous n'avons pas retrouvé la confirmation du paiement. Vous pouvez revenir à l'étape précédente sans perdre ce qui a déjà été préparé.");
        return;
      }

      // Vérifier l'authentification
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Si la session a expiré, stocker le session_id et rediriger vers login
        localStorage.setItem('pending_payment_session', sessionId);
        router.push(`/login?returnUrl=/alma/confirmation&session_id=${sessionId}`);
        return;
      }

      // Vérifier le paiement avec Stripe
      const response = await fetch(`/api/verify-checkout-session?session_id=${sessionId}`);

      if (!response.ok) {
        throw new Error('Erreur lors de la vérification du paiement');
      }

      const data = await response.json();

      if (!isPaidPaymentStatus(data.status)) {
        setStatus('error');
        setErrorMessage("Le paiement n'a pas encore été confirmé. Vous pouvez réessayer dans quelques instants ou revenir à l'aperçu.");
        return;
      }

      const metadata = data.metadata || {};
      const memorialId = data.memoryId || metadata.memoryId || metadata.memorialId;

      if (!memorialId) {
        setStatus('error');
        setErrorMessage("La confirmation est bien revenue, mais nous n'avons pas réussi à rattacher votre espace. Rien n'est perdu.");
        return;
      }

      localStorage.setItem(STORAGE_KEYS.currentMemorialId, memorialId);

      // Sauvegarder les détails du paiement
      setPaymentDetails({
        memorialId,
        amount: (data.amount_total || 0) / 100, // Convert from centimes
        email: data.customer_email,
        context: metadata.context,
      });

      // Créer l'enregistrement dans la table commons
      const { error: commonsError } = await supabase
        .from('commons')
        .upsert({
          id: memorialId,
          context: metadata.context || 'funeral',
          status: 'draft',
          base_price: parseFloat(metadata.basePrice || '79'),
          total_paid: parseFloat(metadata.totalPaid || '79'),
          created_by: user.id,
          owned_by: user.id,
          created_at: new Date().toISOString(),
        });

      if (commonsError) {
        console.error('Erreur création commons:', commonsError);
        // Continue quand même, ce n'est pas bloquant
      }

      // Créer l'enregistrement dans la table transactions
      const stripePaymentId = String(data.payment_intent || sessionId);
      const { data: existingTransaction, error: existingTransactionError } = await supabase
        .from('transactions')
        .select('id')
        .eq('stripe_payment_id', stripePaymentId)
        .maybeSingle();

      if (existingTransactionError) {
        console.error('Erreur lecture transaction:', existingTransactionError);
      }

      if (!existingTransaction) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            common_id: memorialId,
            type: 'base_publication',
            amount: parseFloat(metadata.totalPaid || '79'),
            platform_revenue: parseFloat(metadata.totalPaid || '79'),
            payment_status: 'paid',
            stripe_payment_id: stripePaymentId,
            created_at: new Date().toISOString(),
          });

        if (transactionError) {
          console.error('Erreur création transaction:', transactionError);
          // Continue quand même, ce n'est pas bloquant
        }
      }

      // Marquer comme payé dans localStorage
      markMemorialAsPaid(memorialId);

      // Marquer la session comme traitée pour éviter les doubles traitements
      localStorage.setItem(`payment_processed_${sessionId}`, 'true');

      // Analytics (si disponible)
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('Alma_Payment_Completed', {
          userId: user.id,
          memorialId,
          amount: data.amount_total / 100,
          context: metadata.context,
        });
      }

      console.log('✅ Paiement confirmé et enregistré');
      setStatus('success');

    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      setStatus('error');
      setErrorMessage("La vérification prend plus de temps que prévu. Vos éléments sont conservés, et vous pouvez reprendre tranquillement.");
    }
  }, [router, searchParams]);

  useEffect(() => {
    void verifyPayment();
  }, [verifyPayment]);

  // Countdown pour la redirection
  useEffect(() => {
    if (status === 'success' && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (status === 'success' && redirectCountdown === 0) {
      router.push('/medias');
    }
  }, [status, redirectCountdown, router]);

  // Vue de chargement
  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-[#2B5F7D] mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Nous prenons un instant pour tout vérifier
          </h2>
          <p className="text-gray-600">
            Votre confirmation de paiement est en cours de vérification. Cela prend seulement quelques secondes.
          </p>
        </div>
      </div>
    );
  }

  // Vue d'erreur
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-20 h-20 text-[#C06A3A] mx-auto mb-6" />
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Nous n'avons pas encore pu finaliser cette étape
          </h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <p className="text-sm text-gray-500 mb-8">
            Vous pouvez revenir à l'étape précédente sans perdre ce que vous avez déjà confié.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/alma/pricing')}
              className="w-full px-6 py-3 bg-[#2B5F7D] text-white rounded-full hover:bg-[#1e4458] transition-colors"
            >
              {activeCopy.retryPaymentLabel}
            </button>
            <button
              onClick={() => router.push('/alma/preview')}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:border-gray-400 transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Revenir à l'aperçu
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vue de succès
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="max-w-2xl w-full">
        {/* Carte de succès */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* En-tête avec icône de succès */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
            <CheckCircle className="w-24 h-24 text-white mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {activeCopy.successTitle}
            </h1>
            <p className="text-green-100 text-lg">
              {activeCopy.successLead}
            </p>
          </div>

          {/* Contenu */}
          <div className="p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <HeartHandshake className="h-7 w-7 text-[#2B5F7D]" />
                Merci pour votre confiance
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {activeCopy.successBody}
              </p>
            </div>

            {/* Détails du paiement */}
            {paymentDetails && (
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-gray-800 mb-4">Détails de votre commande</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant payé</span>
                    <span className="font-semibold text-gray-800">
                      {paymentDetails.amount}€
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email de confirmation</span>
                    <span className="font-medium text-gray-800">
                      {paymentDetails.email || 'En cours...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type d'espace</span>
                    <span className="font-medium text-gray-800">
                      {activeCopy.paymentTypeLabel}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Prochaines étapes */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-4">Prochaines étapes :</h3>
              <ol className="space-y-3">
                {activeCopy.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2B5F7D] text-white flex items-center justify-center font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* CTA de redirection */}
            <div className="bg-[#2B5F7D]/5 border-2 border-[#2B5F7D]/20 rounded-xl p-6 text-center">
              <p className="text-gray-700 mb-4">
                Redirection automatique dans{' '}
                <span className="font-bold text-[#2B5F7D] text-xl">{redirectCountdown}</span>{' '}
                seconde{redirectCountdown > 1 ? 's' : ''}...
              </p>
              <button
                onClick={() => router.push('/medias')}
                className="px-8 py-4 bg-[#2B5F7D] hover:bg-[#1e4458] text-white rounded-full text-lg font-medium transition-all transform hover:scale-105"
              >
                {activeCopy.continueToMediaLabel} →
              </button>
            </div>
          </div>
        </div>

        {/* Aide */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Besoin d'aide ?{' '}
            <Link href="/faq" className="text-[#2B5F7D] hover:underline">
              Contactez-nous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AlmaConfirmationPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-[#2B5F7D]" />
      </div>
    }>
      <AlmaConfirmationContent />
    </React.Suspense>
  );
}
