'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  checkAlmaAccess,
  getAlmaContext,
  getAlmaConversation,
  getOrCreateMemorialId,
  grantBetaAccess,
  hashConversation,
} from '@/lib/paymentHelpers';
import { isAlmaBetaActive } from '@/lib/featureFlags';
import AlmaPreviewDisplay from '@/components/AlmaPreviewDisplay';
import FlowNotice from '@/components/create/FlowNotice';
import { Loader2, AlertCircle } from 'lucide-react';

function AlmaPreviewContent() {
  const router = useRouter();

  // États
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [previewText, setPreviewText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [estimatedFullLength, setEstimatedFullLength] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');

  const [hasPaid, setHasPaid] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');

  const [contextData, setContextData] = useState<{
    context: 'funeral' | 'living_story' | 'object_memory';
    subjectName: string;
    genre: 'Elle' | 'Il' | 'Sans genre spécifié';
  } | null>(null);

  const [conversation, setConversation] = useState<any[]>([]);
  const [memorialId, setMemorialId] = useState('');

  const generateFallbackPreview = useCallback((conv: any[], ctx: any) => {
    const userMessages = conv.filter(m => m.role === 'user').slice(0, 5);
    const summary = userMessages.map(m => m.content).join('\n\n');

    setPreviewText(
      `Voici un aperçu de votre conversation avec Alma au sujet de ${ctx.subjectName}:\n\n${summary}\n\n[La suite sera générée après déblocage...]`
    );
    setWordCount(summary.split(/\s+/).length);
    setEstimatedFullLength(summary.split(/\s+/).length * 4);
  }, []);

  // 4. Génération de la preview via API
  const generatePreview = useCallback(async (
    conv: any[],
    ctx: { context: string; subjectName: string; genre: string }
  ) => {
    // Vérifier le cache localStorage
    const convHash = hashConversation(conv);
    const cacheKey = `almaPreview_${ctx.context}_${convHash}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        const cacheTime = new Date(cachedData.timestamp);
        const now = new Date();
        const hoursSinceCache = (now.getTime() - cacheTime.getTime()) / (1000 * 60 * 60);

        // Cache valide pendant 24h
        if (hoursSinceCache < 24) {
          console.log('✅ Preview chargée depuis le cache');
          setPreviewText(cachedData.previewText);
          setWordCount(cachedData.wordCount);
          setEstimatedFullLength(cachedData.estimatedFullLength);
          return;
        }
      } catch (e) {
        console.warn('Cache invalide, régénération...');
      }
    }

    // Générer via API
    setIsGenerating(true);
    setGenerationError('');

    try {
      const response = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: conv,
          context: ctx.context,
          subjectName: ctx.subjectName,
          genre: ctx.genre,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération');
      }

      const data = await response.json();

      setPreviewText(data.previewText);
      setWordCount(data.wordCount);
      setEstimatedFullLength(data.estimatedFullLength);

      // Sauvegarder dans le cache
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          previewText: data.previewText,
          wordCount: data.wordCount,
          estimatedFullLength: data.estimatedFullLength,
          timestamp: new Date().toISOString(),
        })
      );

      console.log('✅ Preview générée avec succès');
    } catch (error) {
      console.error('Erreur génération preview:', error);
      setGenerationError(
        'Impossible de générer l\'aperçu. Veuillez réessayer plus tard.'
      );

      // Fallback: afficher un résumé de la conversation
      generateFallbackPreview(conv, ctx);
    } finally {
      setIsGenerating(false);
    }
  }, [generateFallbackPreview]);

  // 3. Vérification du statut de paiement
  const checkPaymentStatus = useCallback(async (
    currentUser: { id: string; email?: string | null },
    id: string
  ) => {
    setIsCheckingPayment(true);
    try {
      const hasAccess = await checkAlmaAccess(currentUser.id, id, currentUser.email);
      setHasPaid(hasAccess);
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
    } finally {
      setIsCheckingPayment(false);
    }
  }, []);

  // 2. Chargement des données (contexte, conversation, memorialId)
  const loadData = useCallback((currentUser: { id: string; email?: string | null }) => {
    try {
      // Charger le contexte
      const ctx = getAlmaContext();
      if (!ctx) {
        setGenerationError('Conversation introuvable. Veuillez recommencer.');
        return;
      }
      setContextData(ctx);

      // Charger la conversation
      const conv = getAlmaConversation(ctx.context);
      if (!conv || conv.length === 0) {
        setGenerationError('Conversation vide. Veuillez recommencer.');
        return;
      }
      setConversation(conv);

      // Obtenir ou créer memorial ID
      const id = getOrCreateMemorialId();
      setMemorialId(id);

      // Vérifier le paiement
      void checkPaymentStatus(currentUser, id);

      // Générer la preview
      void generatePreview(conv, ctx);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setGenerationError('Erreur lors du chargement des données.');
    }
  }, [checkPaymentStatus, generatePreview]);

  const checkAuthentication = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        // Pas authentifié → rediriger vers login
        const returnUrl = '/alma/preview';
        router.push(`/login?mode=signup&returnUrl=${encodeURIComponent(returnUrl)}`);
        return;
      }

      setUser(currentUser);
      setIsAuthenticated(true);
      setIsCheckingAuth(false);

      // Charger les données après authentification
      loadData(currentUser);
    } catch (error) {
      console.error('Erreur vérification auth:', error);
      setIsCheckingAuth(false);
      router.push('/login');
    }
  }, [loadData, router]);

  // 1. Vérification de l'authentification au chargement
  useEffect(() => {
    void checkAuthentication();
  }, [checkAuthentication]);

  // 5. Gestion du déblocage (beta ou paiement)
  const handleUnlock = async () => {
    if (!user || !memorialId) return;

    setIsUnlocking(true);
    setUnlockError('');

    try {
      const isBeta = isAlmaBetaActive();

      if (isBeta) {
        // Mode beta : accès gratuit
        grantBetaAccess(user.id);

        // Analytics (si disponible)
        if (typeof window !== 'undefined' && (window as any).analytics) {
          (window as any).analytics.track('Alma_Beta_Access_Granted', {
            userId: user.id,
            context: contextData?.context,
            memorialId,
          });
        }

        console.log('✅ Accès beta accordé');

        // Redirect vers /medias
        setTimeout(() => {
          router.push('/medias');
        }, 500);
      } else {
        // Mode prod : redirect vers pricing
        router.push('/alma/pricing');
      }
    } catch (error) {
      console.error('Erreur déblocage:', error);
      setUnlockError("Nous n’avons pas encore pu ouvrir la suite du parcours. Vous pouvez réessayer dans un instant sans perdre votre aperçu.");
    } finally {
      setIsUnlocking(false);
    }
  };

  // États de chargement
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#2B5F7D] mx-auto mb-4" />
          <p className="text-gray-600">Vérification de votre session...</p>
        </div>
      </div>
    );
  }

  if (generationError && !previewText) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Oups, quelque chose s'est mal passé
          </h2>
          <p className="text-gray-600 mb-6">{generationError}</p>
          <button
            onClick={() => router.push('/create/alma')}
            className="px-6 py-3 bg-[#2B5F7D] text-white rounded-full hover:bg-[#1e4458] transition-colors"
          >
            Recommencer une conversation
          </button>
        </div>
      </div>
    );
  }

  // Affichage principal
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">
            Voici votre <span className="italic text-[#2B5F7D]">aperçu</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Alma a transformé votre conversation en un texte mémoriel unique pour{' '}
            <span className="font-medium text-[#2B5F7D]">
              {contextData?.subjectName}
            </span>
          </p>
        </div>

        {unlockError && (
          <FlowNotice
            variant="error"
            title="La suite du parcours n a pas encore pu s ouvrir"
            message={unlockError}
            className="mb-8"
          />
        )}

        {/* Loader pendant la génération */}
        {isGenerating && !previewText && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-16 h-16 animate-spin text-[#2B5F7D] mb-6" />
            <p className="text-xl text-gray-700 mb-2">
              Alma génère votre aperçu...
            </p>
            <p className="text-sm text-gray-500">
              Cela ne prendra que quelques secondes
            </p>
          </div>
        )}

        {/* Affichage de la preview */}
        {previewText && contextData && (
          <AlmaPreviewDisplay
            previewText={previewText}
            wordCount={wordCount}
            estimatedFullLength={estimatedFullLength}
            hasPaid={hasPaid}
            isBetaMode={isAlmaBetaActive()}
            isLoading={isUnlocking || isCheckingPayment}
            onUnlock={handleUnlock}
            subjectName={contextData.subjectName}
            context={contextData.context}
          />
        )}

        {/* Bouton de retour (si payé) */}
        {hasPaid && (
          <div className="mt-12 text-center">
            <button
              onClick={() => router.push('/medias')}
              className="px-8 py-4 bg-[#2B5F7D] hover:bg-[#1e4458] text-white rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
              Continuer → Ajouter photos et musiques
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AlmaPreviewPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-[#2B5F7D]" />
      </div>
    }>
      <AlmaPreviewContent />
    </React.Suspense>
  );
}
