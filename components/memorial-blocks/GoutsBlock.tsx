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
      className="rounded-xl shadow p-6"
      style={{
        backgroundColor: isLightBg ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)'
      }}
    >
      <h3
        className="text-2xl font-bold mb-6"
        style={{ color: template.colors.text }}
      >
        Moments et goûts
      </h3>
      <div className="space-y-4">
        {musiqueTitle && (
          <div className="flex items-start gap-3">
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
          <div className="flex items-start gap-3">
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
            className="border-l-4 pl-4 italic"
            style={{
              borderColor: template.colors.accent,
              color: template.colors.text,
              opacity: 0.8
            }}
          >
            {phrase}
          </blockquote>
        )}
      </div>
    </div>
  );
}
