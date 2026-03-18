'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FlowNotice from '@/components/create/FlowNotice';
import { supabase } from '@/lib/supabase';
import { getAlmaContext, getOrCreateMemorialId } from '@/lib/paymentHelpers';
import { getAlmaBasePrice, isAlmaBetaActive } from '@/lib/featureFlags';
import { isTesterUser } from '@/lib/testerAccess';
import { Check, Loader2, Sparkles, Lock } from 'lucide-react';
import { resolveCommunTypeFromContext } from '@/lib/communTypes';

export default function AlmaPricingPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [context, setContext] = useState<'funeral' | 'living_story' | 'object_memory'>('funeral');
  const [subjectName, setSubjectName] = useState('');
  const [basePrice, setBasePrice] = useState(79);
  const [paymentError, setPaymentError] = useState('');

  // Options d'upsell
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const flowRaw = localStorage.getItem('creation_flow');
        const flow = flowRaw ? (() => {
          try { return JSON.parse(flowRaw); } catch { return null; }
        })() : null;
        const returnUrl = `/alma/pricing${flow?.context ? `?context=${encodeURIComponent(flow.context)}` : ''}`;

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push(`/login?mode=signup&returnUrl=${encodeURIComponent(returnUrl)}`);
          return;
        }

        if (isAlmaBetaActive()) {
          router.push('/medias');
          return;
        }

        if (isTesterUser({ id: user.id, email: user.email }, { publicOnly: true })) {
          router.push('/medias');
          return;
        }

        setUser(user);

        // Charger le contexte
        const ctx = getAlmaContext();
        if (ctx) {
          setContext(ctx.context);
          setSubjectName(ctx.subjectName);
          setBasePrice(getAlmaBasePrice(ctx.context));
        } else if (flow?.context) {
          const fallbackContext =
            flow.context === 'celebration' || flow.context === 'living_story' || flow.context === 'feter'
              ? 'living_story'
              : flow.context === 'object_memory' || flow.context === 'heritage' || flow.context === 'transmettre'
              ? 'object_memory'
              : 'funeral';
          setContext(fallbackContext);
          setBasePrice(getAlmaBasePrice(fallbackContext));
        } else {
          localStorage.setItem('creation_flow', JSON.stringify({
            source: 'alma',
            context: 'funeral',
            communType: resolveCommunTypeFromContext('funeral'),
            updatedAt: new Date().toISOString(),
          }));
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Erreur chargement:', error);
        setIsLoading(false);
      }
    };

    void checkAuthAndLoadData();
  }, [router]);

  // Options d'upsell disponibles
  const upsellOptions = [
    {
      id: 'unlimited_photos',
      label: 'Galerie photos illimitée',
      description: 'Ajoutez autant de photos que vous souhaitez',
      price: 15,
    },
    {
      id: 'video',
      label: 'Intégration vidéo (5 min)',
      description: 'Ajoutez une vidéo à votre mémorial',
      price: 20,
    },
    {
      id: 'audio',
      label: 'Message audio (3 min)',
      description: 'Enregistrez un message vocal',
      price: 10,
    },
    {
      id: 'premium_theme',
      label: 'Thème premium personnalisé',
      description: 'Design exclusif et couleurs sur mesure',
      price: 25,
    },
    {
      id: 'lifetime_hosting',
      label: 'Hébergement à vie (30 ans)',
      description: 'Au lieu de 5 ans inclus',
      price: 90,
    },
  ];

  // Calculer le total
  const calculateTotal = () => {
    const upsellsTotal = selectedOptions.reduce((sum, optionId) => {
      const option = upsellOptions.find(o => o.id === optionId);
      return sum + (option?.price || 0);
    }, 0);

    return basePrice + upsellsTotal;
  };

  // Gestion de la sélection d'options
  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  // Procéder au paiement
  const handlePayment = async () => {
    if (!user) return;

    setIsProcessing(true);
    setPaymentError('');

    try {
      const memorialId = getOrCreateMemorialId();
      const totalPrice = calculateTotal();

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memorialId,
          packId: 'alma_base',
          context,
          basePrice,
          totalPrice,
          selectedOptions: upsellOptions
            .filter(opt => selectedOptions.includes(opt.id))
            .map(opt => ({ id: opt.id, label: opt.label, price: opt.price })),
          userId: user.id,
          returnUrl: window.location.origin + '/alma/confirmation',
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session');
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error('URL de paiement invalide');
      }

      // Redirect vers Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Erreur paiement:', error);
      setPaymentError("Nous n avons pas encore pu preparer le paiement. Vos choix sont conserves et vous pouvez reessayer dans un instant.");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <Loader2 className="w-12 h-12 animate-spin text-[#2B5F7D]" />
      </div>
    );
  }

  const totalPrice = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">
            Finalisez votre <span className="italic text-[#2B5F7D]">mémorial</span>
          </h1>
          <p className="text-lg text-gray-600">
            Débloquez l'accès complet pour créer un espace unique en l'honneur de{' '}
            <span className="font-medium text-[#2B5F7D]">{subjectName}</span>
          </p>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          {/* Prix de base */}
          <div className="bg-gradient-to-r from-[#2B5F7D] to-[#1e4458] p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {basePrice}€
                </h2>
                <p className="text-white/80">Prix de base • Paiement unique</p>
              </div>
              <Sparkles className="w-16 h-16 text-[#D4AF37]" />
            </div>
          </div>

          {/* Fonctionnalités incluses */}
          <div className="p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Check className="w-6 h-6 text-green-500" />
              Inclus dans le forfait de base
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                'Génération IA complète avec Alma',
                'Jusqu\'à 15 photos incluses',
                'Galerie de photos',
                'Lecteur de musiques',
                'Messages de contributeurs',
                'Bougies virtuelles interactives',
                'QR code de partage',
                'Hébergement 5 ans',
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Options supplémentaires */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Options supplémentaires (optionnel)
              </h3>

              <div className="space-y-4">
                {upsellOptions.map(option => (
                  <label
                    key={option.id}
                    className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedOptions.includes(option.id)
                        ? 'border-[#2B5F7D] bg-[#2B5F7D]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(option.id)}
                        onChange={() => toggleOption(option.id)}
                        className="mt-1 w-5 h-5 text-[#2B5F7D] rounded focus:ring-[#2B5F7D]"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-[#2B5F7D]">
                      +{option.price}€
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Total et CTA */}
          <div className="border-t border-gray-200 bg-gray-50 p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-2xl font-semibold text-gray-800">Total</span>
              <span className="text-4xl font-bold text-[#2B5F7D]">{totalPrice}€</span>
            </div>

            {paymentError && (
              <FlowNotice
                variant="error"
                title="Le paiement n a pas encore pu demarrer"
                message={paymentError}
                className="mb-6"
              />
            )}

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-4 bg-[#2B5F7D] hover:bg-[#1e4458] text-white rounded-xl text-lg font-medium transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Préparation du paiement...</span>
                </>
              ) : (
                <>
                  <Lock className="w-6 h-6" />
                  <span>Procéder au paiement sécurisé</span>
                </>
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1 17l-5-5.299 1.399-1.43 3.574 3.736 6.572-7.007 1.455 1.403-8 8.597z"/>
                </svg>
                <span>Paiement sécurisé Stripe</span>
              </div>
              <div className="text-gray-300">•</div>
              <div>Garantie satisfait ou remboursé</div>
            </div>
          </div>
        </div>

        {/* Lien retour */}
        <div className="text-center">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            ← Retour à l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
}
