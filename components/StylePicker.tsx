'use client';

import { STYLE_EXEMPLES } from '@/lib/schema';
import { Check } from 'lucide-react';

interface StylePickerProps {
  value: string | null;
  onChange: (style: string) => void;
}

export default function StylePicker({ value, onChange }: StylePickerProps) {
  return (
    <div className="space-y-4">
      {STYLE_EXEMPLES.map((style) => (
        <button
          key={style.id}
          type="button"
          onClick={() => onChange(style.id)}
          className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
            value === style.id
              ? 'border-memoir-gold bg-memoir-gold/5'
              : 'border-memoir-blue/10 hover:border-memoir-gold/30'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-memoir-blue">
              {style.titre}
            </h3>
            {value === style.id && (
              <Check className="w-6 h-6 text-memoir-gold flex-shrink-0" />
            )}
          </div>
          <p className="text-memoir-blue/70 leading-relaxed italic">
            "{style.texte}"
          </p>
        </button>
      ))}
    </div>
  );
}
