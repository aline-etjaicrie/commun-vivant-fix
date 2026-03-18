'use client';

import { ExternalLink } from 'lucide-react';
import { ensureAbsoluteUrl } from '@/lib/memorialRuntime';

interface Lien {
  id: string;
  url: string;
  titre?: string;
  description?: string;
}

interface WebLinksDisplayProps {
  liens: Lien[];
  accentColor: string;
  textColor: string;
  bgColor: string;
}

export default function WebLinksDisplay({ liens, accentColor, textColor, bgColor }: WebLinksDisplayProps) {
  const normalizedLinks = liens
    .map((lien) => ({ ...lien, normalizedUrl: ensureAbsoluteUrl(lien.url) }))
    .filter((lien) => lien.normalizedUrl);

  if (normalizedLinks.length === 0) return null;

  return (
    <div 
      className="rounded-xl shadow p-6"
      style={{ 
        backgroundColor: bgColor === '#FFFFFF' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)'
      }}
    >
      <h3 
        className="text-2xl font-bold mb-4"
        style={{ color: textColor }}
      >
        Liens
      </h3>
      <div className="space-y-3">
        {normalizedLinks.map((lien) => (
          <a
            key={lien.id}
            href={lien.normalizedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors group"
            style={{ border: `1px solid ${accentColor}30` }}
          >
            <ExternalLink 
              className="w-5 h-5 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
              style={{ color: accentColor }}
            />
            <div className="flex-1 min-w-0">
              {lien.titre && (
                <p 
                  className="font-medium mb-1"
                  style={{ color: textColor }}
                >
                  {lien.titre}
                </p>
              )}
              {lien.description && (
                <p 
                  className="text-sm mb-1"
                  style={{ color: textColor, opacity: 0.7 }}
                >
                  {lien.description}
                </p>
              )}
              <p 
                className="text-xs truncate"
                style={{ color: accentColor, opacity: 0.7 }}
              >
                {lien.normalizedUrl}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
