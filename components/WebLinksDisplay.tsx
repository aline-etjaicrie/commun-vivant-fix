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
      className="rounded-[30px] border p-6 shadow-[0_24px_70px_rgba(15,23,38,0.08)] md:p-7"
      style={{ 
        backgroundColor: bgColor === '#FFFFFF' ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${accentColor}22`,
      }}
    >
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: accentColor }}>
          Ressources
        </p>
        <h3 
          className="mt-2 text-[1.85rem] font-serif leading-tight"
          style={{ color: textColor }}
        >
          Liens utiles
        </h3>
      </div>
      <div className="space-y-3">
        {normalizedLinks.map((lien) => (
          <a
            key={lien.id}
            href={lien.normalizedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 rounded-[24px] p-5 transition-colors"
            style={{
              border: `1px solid ${accentColor}26`,
              backgroundColor: bgColor === '#FFFFFF' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
            }}
          >
            <div
              className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <ExternalLink 
                className="h-4 w-4 transition-transform group-hover:scale-110"
                style={{ color: accentColor }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: accentColor }}>
                Lien utile
              </p>
              {lien.titre && (
                <p 
                  className="mt-2 text-base font-medium"
                  style={{ color: textColor }}
                >
                  {lien.titre}
                </p>
              )}
              {lien.description && (
                <p 
                  className="mt-2 text-sm leading-6"
                  style={{ color: textColor, opacity: 0.74 }}
                >
                  {lien.description}
                </p>
              )}
              <p 
                className="mt-3 truncate text-xs"
                style={{ color: accentColor, opacity: 0.72 }}
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
