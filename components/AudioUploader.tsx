'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Music } from 'lucide-react';
import { savePhoto, getPhoto, deletePhoto, fileToBlob, blobToURL } from '@/lib/indexedDB';

interface AudioUploaderProps {
  audioId?: string;
  onAudioChange: (audioId: string | undefined) => void;
  memorialId: string;
}

export default function AudioUploader({ audioId, onAudioChange, memorialId }: AudioUploaderProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (audioId) {
      loadAudio(audioId);
    }
  }, [audioId]);

  const loadAudio = async (id: string) => {
    try {
      const audio = await getPhoto(id);
      if (audio) {
        const url = blobToURL(audio.blob);
        setAudioUrl(url);
        setAudioName(audio.nom || 'Fichier audio');
      }
    } catch (error) {
      console.error('Erreur chargement audio:', error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Veuillez sélectionner un fichier audio');
      return;
    }

    setIsUploading(true);

    try {
      const blob = await fileToBlob(file);
      const id = `audio-${memorialId}-${Date.now()}`;
      
      await savePhoto({
        id,
        memorialId,
        type: 'audio',
        blob,
        nom: file.name,
      });

      const url = blobToURL(blob);
      setAudioUrl(url);
      setAudioName(file.name);
      onAudioChange(id);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload du fichier audio');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (audioId) {
      try {
        await deletePhoto(audioId);
        setAudioUrl(null);
        setAudioName('');
        onAudioChange(undefined);
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  return (
    <div className="space-y-3">
      {audioUrl ? (
        <div className="border-2 border-memoir-gold/30 rounded-lg p-4 bg-memoir-gold/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-1">
              <Music className="w-5 h-5 text-memoir-gold" />
              <span className="text-sm font-medium text-memoir-blue truncate">
                {audioName}
              </span>
            </div>
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-red-500/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
          <audio src={audioUrl} controls className="w-full mt-2" style={{ height: '40px' }} />
        </div>
      ) : (
        <label className="cursor-pointer">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
          <div className="border-2 border-dashed border-memoir-blue/20 rounded-lg p-6 hover:border-memoir-gold/50 transition-colors bg-memoir-blue/5 hover:bg-memoir-gold/5">
            <div className="flex flex-col items-center gap-2">
              {isUploading ? (
                <>
                  <div className="animate-spin w-6 h-6 border-4 border-memoir-gold border-t-transparent rounded-full" />
                  <p className="text-sm text-memoir-blue/70">Chargement...</p>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-memoir-gold" />
                  <p className="text-sm text-memoir-blue/70 text-center">
                    <span className="font-medium text-memoir-gold">Ajouter un fichier audio</span>
                    <br />
                    <span className="text-xs">MP3, WAV, M4A...</span>
                  </p>
                </>
              )}
            </div>
          </div>
        </label>
      )}
    </div>
  );
}
