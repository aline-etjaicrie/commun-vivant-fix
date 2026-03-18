'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import Link from 'next/link';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  prenom: string;
}

export default function ConsentModal({ isOpen, onClose, onConfirm, prenom }: ConsentModalProps) {
  const [hasConsented, setHasConsented] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (hasConsented) {
      onConfirm();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-memoir-blue/10 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-memoir-blue">
            Consentement de publication
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-memoir-blue/5 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-memoir-blue/50" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-memoir-gold/10 rounded-lg p-5">
            <p className="text-memoir-blue/80 leading-relaxed">
              Vous êtes sur le point de publier le mémorial de <strong>{prenom}</strong>. 
              Cette action rendra ce contenu accessible en ligne.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-memoir-blue text-lg">
              En publiant ce mémorial, vous reconnaissez :
            </h3>
            
            <div className="space-y-3 text-memoir-blue/70">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-memoir-gold flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Agir en tant que membre de la famille ou ayant droit</strong>, 
                  disposant de la légitimité nécessaire pour transmettre ces contenus.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-memoir-gold flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Respecter la mémoire et la volonté présumée du défunt</strong>, 
                  et que la personne concernée n'a pas exprimé d'opposition connue à cette démarche.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-memoir-gold flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Assumer collectivement cette décision de publication</strong> 
                  et comprendre que le contenu sera accessible à des tiers.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-memoir-gold flex-shrink-0 mt-0.5" />
                <p>
                  Avoir lu et accepté la{' '}
                  <Link 
                    href="/confidentialite" 
                    target="_blank"
                    className="text-memoir-gold hover:underline font-medium"
                  >
                    politique de confidentialité
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          <div className="bg-memoir-blue/5 rounded-lg p-5">
            <p className="text-sm text-memoir-blue/70 leading-relaxed">
              <strong>Rappel :</strong> Cette publication est réversible. Vous pouvez à tout moment 
              demander la dépublication ou la suppression du mémorial en nous contactant à{' '}
              <a href="mailto:contact@etjaicrie.fr" className="text-memoir-gold hover:underline">
                contact@etjaicrie.fr
              </a>
              {' '}ou via notre page{' '}
              <Link href="/droit-oubli" target="_blank" className="text-memoir-gold hover:underline">
                droit à l'oubli
              </Link>
              .
            </p>
          </div>

          <div className="border-t border-memoir-blue/10 pt-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={hasConsented}
                onChange={(e) => setHasConsented(e.target.checked)}
                className="mt-1 w-5 h-5 text-memoir-gold rounded border-memoir-blue/30 focus:ring-memoir-gold cursor-pointer"
              />
              <span className="text-memoir-blue select-none">
                <strong>Je déclare avoir lu et accepté les conditions ci-dessus</strong>, 
                et je confirme vouloir publier ce mémorial en toute connaissance de cause.
              </span>
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-memoir-blue/10 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-memoir-blue/20 text-memoir-blue rounded-lg hover:border-memoir-blue/40 transition-colors font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasConsented}
            className="flex-1 px-6 py-3 bg-memoir-gold text-white rounded-lg hover:bg-memoir-gold/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Publier le mémorial
          </button>
        </div>
      </div>
    </div>
  );
}
