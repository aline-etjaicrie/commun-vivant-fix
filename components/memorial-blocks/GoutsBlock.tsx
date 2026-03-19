'use client';

import { Music, MapPin } from 'lucide-react';
import MusicPlayer from '@/components/MusicPlayer';

interface GoutsBlockProps {
  gouts: any;
  audioUrl?: string | null;
  audioTitle?: string | null;
  template: any;
  isLightBg: boolean;
}

export default function GoutsBlock({ gouts, audioUrl, audioTitle, template, isLightBg }: GoutsBlockProps) {
  // If we have an audioUrl, we display at least the music player.
  // Otherwise, we check if gouts has content.
  if (!audioUrl && (!gouts || (!gouts.musique && !gouts.lieu && !gouts.phrase))) return null;

  // Safe access to gouts fields
  const musiqueTitle = audioTitle || gouts?.musique;
  const lieu = gouts?.lieu;
  const phrase = gouts?.phrase;

  return (
    <div
      className="rounded-[30px] border p-6 shadow-[0_24px_70px_rgba(15,23,38,0.08)] md:p-7"
      style={{
        backgroundColor: isLightBg ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${template.colors.accent}20`,
      }}
    >
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: template.colors.accent }}>
          Ambiance sonore
        </p>
        <h3
          className="mt-2 text-[1.85rem] font-serif leading-tight"
          style={{ color: template.colors.text }}
        >
          Musique et repères
        </h3>
      </div>
      <div className="space-y-4">
        {musiqueTitle && (
          <div className="flex items-start gap-3 rounded-[22px] border p-4" style={{ borderColor: `${template.colors.accent}20` }}>
            <Music
              className="w-5 h-5 flex-shrink-0 mt-1"
              style={{ color: template.colors.accent }}
            />
            <div className="flex-1">
              <p
                className="font-semibold"
                style={{ color: template.colors.text }}
              >
                Musique
              </p>
              <p style={{ color: template.colors.text, opacity: 0.7 }}>
                {musiqueTitle}
              </p>
            </div>
          </div>
        )}

        {audioUrl && (
          <div>
            <MusicPlayer
              audioUrl={audioUrl}
              title={musiqueTitle}
              accentColor={template.colors.accent}
              textColor={template.colors.text}
              bgColor={template.colors.bg}
              autoPlay={false} // Default to false to avoid sudden noise
            />
          </div>
        )}

        {lieu && (
          <div className="flex items-start gap-3 rounded-[22px] border p-4" style={{ borderColor: `${template.colors.accent}20` }}>
            <MapPin
              className="w-5 h-5 flex-shrink-0 mt-1"
              style={{ color: template.colors.accent }}
            />
            <div>
              <p
                className="font-semibold"
                style={{ color: template.colors.text }}
              >
                Lieu
              </p>
              <p style={{ color: template.colors.text, opacity: 0.7 }}>
                {lieu}
              </p>
            </div>
          </div>
        )}

        {phrase && (
          <blockquote
            className="rounded-[24px] border-l-4 p-5 text-[1rem] italic leading-8 md:text-[1.06rem]"
            style={{
              borderColor: template.colors.accent,
              color: template.colors.text,
              opacity: 0.8,
              backgroundColor: isLightBg ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
            }}
          >
            {phrase}
          </blockquote>
        )}
      </div>
    </div>
  );
}
