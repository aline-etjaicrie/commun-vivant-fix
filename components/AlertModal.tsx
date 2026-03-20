'use client';

import { X } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'inconnu';
}

export default function AlertModal({ isOpen, onClose, type }: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-memoir-dark/40 hover:text-memoir-dark transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-2xl font-serif font-bold text-memoir-dark mb-4">
          ⚠️ Attention
        </h3>

        <div className="text-memoir-dark/80 mb-6 leading-relaxed">
          <p className="mb-4">
            Si vous n'avez pas connu personnellement cette personne, certaines informations
            (photos, textes, gravure sur une tombe ou un objet mémoriel) peuvent nécessiter
            l'accord des ayants droit.
          </p>
          <p>
            Vous pouvez continuer, mais la publication finale pourra être limitée sans validation.
          </p>
        </div>

        <button
          onClick={onClose}
          className="btn-primary w-full"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
}
