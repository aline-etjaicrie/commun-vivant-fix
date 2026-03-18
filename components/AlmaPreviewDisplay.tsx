'use client';

import React from 'react';
import { Loader2, Lock, Sparkles } from 'lucide-react';

interface AlmaPreviewDisplayProps {
  previewText: string;
  wordCount?: number;
  estimatedFullLength?: number;
  hasPaid: boolean;
  isBetaMode: boolean;
  isLoading?: boolean;
  onUnlock: () => void;
  subjectName: string;
  context: 'funeral' | 'living_story' | 'object_memory';
}

export default function AlmaPreviewDisplay({
  previewText,
  wordCount,
  estimatedFullLength,
  hasPaid,
  isBetaMode,
  isLoading,
  onUnlock,
  subjectName,
  context,
}: AlmaPreviewDisplayProps) {
  // Textes selon le contexte
  const contextTexts = {
    funeral: 'ce mémorial',
    living_story: 'cette biographie',
    object_memory: 'cette histoire',
  };

  const contextText = contextTexts[context] || 'ce commun';

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Statistiques */}
      {!hasPaid && wordCount && estimatedFullLength && (
        <div className="mb-6 flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>{wordCount} mots générés</span>
          </div>
          <div className="text-gray-400">•</div>
          <div>
            <span>~{estimatedFullLength} mots au total estimés</span>
          </div>
        </div>
      )}

      {/* Conteneur principal avec effet de flou */}
      <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Zone de contenu */}
        <div className="p-8 md:p-12">
          {/* Texte de preview (2-3 paragraphes visibles) */}
          <div
            className={`prose prose-lg max-w-none ${
              !hasPaid ? 'max-h-[500px] overflow-hidden' : ''
            }`}
          >
            <div className="text-gray-800 leading-relaxed space-y-4 whitespace-pre-line">
              {previewText}
            </div>

            {/* Placeholder pour contenu flouté (si non payé) */}
            {!hasPaid && (
              <div className="mt-6 space-y-4 text-gray-400 select-none">
                <p className="opacity-60">
                  La suite de l'histoire révèle d'autres aspects essentiels de {subjectName}...
                </p>
                <p className="opacity-40">
                  Des anecdotes touchantes, des valeurs qui ont guidé sa vie...
                </p>
                <p className="opacity-20">
                  Un portrait complet et authentique qui honore sa mémoire...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Overlay avec gradient et blur (si non payé) */}
        {!hasPaid && (
          <>
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{
                height: '60%',
                background:
                  'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.95) 70%, rgba(255,255,255,1) 85%)',
                backdropFilter: 'blur(12px)',
              }}
            />

            {/* CTA flottant au centre */}
            <div className="absolute bottom-0 left-0 right-0 pb-12 flex flex-col items-center justify-center z-10">
              {/* Badge informatif */}
              <div className="mb-6 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg">
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#D4AF37]" />
                  <span>
                    Aperçu • {Math.ceil((wordCount || 0) / (estimatedFullLength || 1) * 100)}% du texte complet
                  </span>
                </p>
              </div>

              {/* Bouton principal */}
              <button
                onClick={onUnlock}
                disabled={isLoading}
                className="group px-8 py-4 bg-[#2B5F7D] hover:bg-[#1e4458] text-white rounded-full shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-medium">Chargement...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                      <span className="font-medium text-lg">
                        {isBetaMode
                          ? 'Accéder gratuitement (Beta)'
                          : `Débloquer ${contextText}`}
                      </span>
                    </>
                  )}
                </div>
              </button>

              {/* Sous-texte */}
              {!isBetaMode && (
                <p className="mt-4 text-sm text-gray-600 text-center max-w-md">
                  Accédez au texte complet, ajoutez photos et musiques,
                  <br />
                  et créez un espace de souvenir unique
                </p>
              )}

              {isBetaMode && (
                <p className="mt-4 text-sm text-[#D4AF37] font-medium">
                  Offre beta • Accès gratuit temporaire
                </p>
              )}
            </div>
          </>
        )}

        {/* Message de succès (si payé) */}
        {hasPaid && (
          <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-[#2B5F7D]/5 to-[#D4AF37]/5">
            <div className="flex items-center justify-center gap-3 text-[#2B5F7D]">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <p className="font-medium">
                Vous avez accès au texte complet • Continuez pour ajouter photos et musiques
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Information additionnelle */}
      {!hasPaid && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Ce texte a été généré par Alma à partir de votre conversation
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Vous pourrez le modifier et le personnaliser après déblocage
          </p>
        </div>
      )}
    </div>
  );
}
