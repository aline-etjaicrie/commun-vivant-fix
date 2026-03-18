'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface CandleMemorialProps {
  prenom: string;
  memorialId: string;
  accentColor: string;
  textColor: string;
  bgColor: string;
}

export default function CandleMemorial({ prenom, memorialId, accentColor, textColor, bgColor }: CandleMemorialProps) {
  const [count, setCount] = useState(0);
  const [hasLit, setHasLit] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const savedCount = localStorage.getItem(`candles-${memorialId}`);
    if (savedCount) {
      setCount(parseInt(savedCount, 10));
    }
    
    const userHasLit = localStorage.getItem(`candle-lit-${memorialId}`);
    if (userHasLit === 'true') {
      setHasLit(true);
    }
  }, [memorialId]);

  const handleLightCandle = () => {
    if (hasLit) return;
    
    setIsAnimating(true);
    const newCount = count + 1;
    setCount(newCount);
    setHasLit(true);
    
    localStorage.setItem(`candles-${memorialId}`, newCount.toString());
    localStorage.setItem(`candle-lit-${memorialId}`, 'true');
    
    setTimeout(() => setIsAnimating(false), 2000);
  };

  return (
    <div 
      className="rounded-xl shadow-lg p-8 md:p-12 text-center"
      style={{ 
        backgroundColor: bgColor === '#FFFFFF' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)'
      }}
    >
      <div className="max-w-md mx-auto">
        <div className="relative mb-6">
          <div 
            className={`text-6xl md:text-7xl transition-all duration-500 ${isAnimating ? 'scale-125' : 'scale-100'}`}
            style={{
              filter: isAnimating ? 'drop-shadow(0 0 20px rgba(255, 200, 100, 0.8))' : 'none',
            }}
          >
            🕯️
          </div>
          {isAnimating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="animate-ping absolute w-20 h-20 rounded-full opacity-75"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          )}
        </div>

        <h3 
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ color: textColor }}
        >
          Allumer une bougie
        </h3>
        
        <p 
          className="text-lg mb-6"
          style={{ color: textColor, opacity: 0.7 }}
        >
          en pensant à {prenom}
        </p>

        {!hasLit ? (
          <button
            onClick={handleLightCandle}
            className="px-8 py-3 rounded-lg font-medium text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: accentColor,
              color: bgColor === '#FFFFFF' || bgColor === '#F5E6D3' || bgColor === '#F4E8D0' ? '#000' : '#fff',
            }}
          >
            Allumer une bougie
          </button>
        ) : (
          <div className="space-y-3">
            <div 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg"
              style={{ 
                backgroundColor: 'rgba(100, 200, 100, 0.2)',
                border: `2px solid rgba(100, 200, 100, 0.5)`,
                color: textColor
              }}
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Votre bougie a été allumée</span>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t" style={{ borderColor: `${textColor}20` }}>
          <p 
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ color: accentColor }}
          >
            {count}
          </p>
          <p 
            className="text-sm"
            style={{ color: textColor, opacity: 0.6 }}
          >
            {count === 0 ? 'bougie allumée' : count === 1 ? 'bougie allumée' : 'bougies allumées'}
          </p>
        </div>
      </div>
    </div>
  );
}
