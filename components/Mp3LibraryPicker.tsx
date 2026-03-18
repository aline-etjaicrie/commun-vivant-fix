'use client';

import { useState } from 'react';
import { MEMORIAL_MP3_LIBRARY } from '@/lib/mp3Library';

interface Mp3LibraryPickerProps {
  selectedTrackId?: string;
  onSelectTrack: (track: { id: string; title: string; url: string } | null) => void;
}

export default function Mp3LibraryPicker({ selectedTrackId, onSelectTrack }: Mp3LibraryPickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-sm text-memoir-blue/70">
        Quelques pistes instrumentales douces si vous ne souhaitez pas importer de fichier audio.
      </p>

      <div className="grid gap-2">
        {MEMORIAL_MP3_LIBRARY.map((track) => {
          const selected = track.id === selectedTrackId;
          return (
            <div
              key={track.id}
              className={`rounded-lg border p-3 transition-colors ${selected ? 'border-memoir-gold bg-memoir-gold/10' : 'border-memoir-blue/15 bg-white'}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-memoir-blue">{track.title}</p>
                  <p className="text-xs text-memoir-blue/60">{track.artist} · {track.mood}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(track.url)}
                    className="rounded-md border border-memoir-blue/20 px-2 py-1 text-xs text-memoir-blue"
                  >
                    Ecouter
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTrack({ id: track.id, title: track.title, url: track.url })}
                    className="rounded-md bg-memoir-blue px-2 py-1 text-xs text-white"
                  >
                    Choisir
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedTrackId && (
        <button
          type="button"
          onClick={() => onSelectTrack(null)}
          className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-700"
        >
          Retirer la sélection
        </button>
      )}

      {previewUrl && (
        <audio controls className="w-full">
          <source src={previewUrl} />
        </audio>
      )}
    </div>
  );
}
