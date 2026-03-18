'use client';

import { PRESET_LAYOUTS } from '@/lib/layouts';
import * as LucideIcons from 'lucide-react';

interface LayoutSelectorProps {
  selectedLayout: string;
  onLayoutChange: (layoutId: string) => void;
}

export default function LayoutSelector({ selectedLayout, onLayoutChange }: LayoutSelectorProps) {
  const getIcon = (layoutId: string) => {
    switch (layoutId) {
      case 'classic':
        return LucideIcons.LayoutGrid;
      case 'editorial':
        return LucideIcons.Columns;
      case 'magazine':
        return LucideIcons.Newspaper;
      case 'triptych':
        return LucideIcons.LayoutDashboard;
      default:
        return LucideIcons.LayoutGrid;
    }
  };
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-memoir-blue mb-4">
        Choisir la mise en page
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {PRESET_LAYOUTS.map((layout) => {
          const isSelected = selectedLayout === layout.id;
          const Icon = getIcon(layout.id);

          return (
            <button
              key={layout.id}
              onClick={() => onLayoutChange(layout.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${isSelected
                  ? 'border-memoir-gold bg-memoir-gold/5 ring-1 ring-memoir-gold'
                  : 'border-gray-200 hover:border-memoir-gold/50 hover:bg-gray-50'
                }`}
            >
              <Icon
                className={`w-6 h-6 mb-2 ${isSelected ? 'text-memoir-gold' : 'text-gray-400'}`}
              />
              <span className={`text-xs font-medium text-center ${isSelected ? 'text-memoir-gold' : 'text-gray-600'}`}>
                {layout.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-memoir-blue/5 rounded-lg">
        <p className="text-sm text-memoir-blue/70">
          💡 Sur mobile, toutes les mises en page s'adaptent automatiquement en une colonne
        </p>
      </div>
    </div>
  );
}
