'use client';

import { X } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'inconnu' | 'publication';
  onConfirm?: () => void;
}

export default function AlertModal({ isOpen, onClose, type, onConfirm }: AlertModalProps) {
  if (!isOpen) return null;

  const content = {
    inconnu: {
      title: '⚠️ Attention',
      message: (
        <>
          <p className="mb-4">
            Si vous n'avez pas connu personnellement cette personne, certaines informations 
            (photos, textes, gravure sur une tombe ou un objet mémoriel) peuvent nécessiter 
            l'accord des ayants droit.
          </p>
          <p>
            Vous pouvez continuer, mais la publication finale pourra être limitée sans validation.
          </p>
        </>
      ),
      buttons: (
        <button
          onClick={onClose}
          className="btn-primary w-full"
        >
          J'ai compris
        </button>
      ),
    },
    publication: {
      title: '⚠️ Avant de publier',
      message: (
        <>
          <p className="mb-4">
            Vous attestez être autorisé·e à partager ces informations et à disposer des 
            droits nécessaires sur les textes, images et sons utilisés.
          </p>
          <p>
            Le texte généré est une proposition éditoriale, modifiable à tout moment.
          </p>
        </>
      ),
      buttons: (
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className="btn-primary flex-1"
          >
            Publier
          </button>
        </div>
      ),
    },
  };

  const { title, message, buttons } = content[type];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-memoir-dark/40 hover:text-memoir-dark transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Titre */}
        <h3 className="text-2xl font-serif font-bold text-memoir-dark mb-4">
          {title}
        </h3>

        {/* Message */}
        <div className="text-memoir-dark/80 mb-6 leading-relaxed">
          {message}
        </div>

        {/* Boutons */}
        {buttons}
      </div>
    </div>
  );
}
