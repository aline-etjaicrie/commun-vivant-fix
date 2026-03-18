'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import AlmaChat from './AlmaChat';

export default function AlmaChatBubble() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bulle flottante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-memoir-gold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50 group"
          aria-label="Ouvrir ALMA"
        >
          <Sparkles className="w-7 h-7 text-white" />
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-memoir-blue text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Discuter avec ALMA
          </div>
        </button>
      )}

      {/* Modal chat ALMA */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 md:p-6">
          {/* Overlay semi-transparent */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Fenêtre de chat */}
          <div className="relative w-full md:w-[450px] h-[600px] md:h-[700px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header avec bouton fermer */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-memoir-blue/10 hover:bg-memoir-blue/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-memoir-blue" />
              </button>
            </div>
            
            {/* Composant AlmaChat */}
            <AlmaChat />
          </div>
        </div>
      )}
    </>
  );
}