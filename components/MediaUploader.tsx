'use client';

import { useCallback, useEffect, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Media } from '@/lib/schema';
import { savePhoto, getPhoto, deletePhoto, fileToBlob, blobToURL } from '@/lib/indexedDB';
import RawImage from '@/components/RawImage';

interface MediaUploaderProps {
  value: Media[];
  onChange: (value: Media[]) => void;
  type: 'all' | 'image' | 'video' | 'audio';
}

export default function MediaUploader({ value, onChange, type }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [mediaWithUrls, setMediaWithUrls] = useState<(Media & { localUrl?: string })[]>([]);

  const loadMediaUrls = useCallback(async () => {
    const mediasWithUrls = await Promise.all(
      value.map(async (media) => {
        if (media.url.startsWith('indexed-db:')) {
          const photoId = media.url.replace('indexed-db:', '');
          const photo = await getPhoto(photoId);
          if (photo) {
            return { ...media, localUrl: blobToURL(photo.blob) };
          }
        }
        return { ...media, localUrl: media.url };
      })
    );
    setMediaWithUrls(mediasWithUrls);
  }, [value]);

  // Charger les URLs des médias depuis IndexedDB
  useEffect(() => {
    void loadMediaUrls();
  }, [loadMediaUrls]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const newMedias: Media[] = [];
      
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} n'est pas une image valide`);
          continue;
        }

        const blob = await fileToBlob(file);
        const photoId = `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        await savePhoto({
          id: photoId,
          memorialId: 'current',
          type: 'gallery',
          blob,
          nom: file.name,
        });

        newMedias.push({
          id: photoId,
          type: 'image',
          url: `indexed-db:${photoId}`,
          nom: file.name,
        });
      }

      onChange([...value, ...newMedias]);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload des photos');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = async (media: Media) => {
    try {
      if (media.url.startsWith('indexed-db:')) {
        const photoId = media.url.replace('indexed-db:', '');
        await deletePhoto(photoId);
      }
      onChange(value.filter((m) => m.id !== media.id));
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const acceptTypes = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : type === 'audio' ? 'audio/*' : 'image/*,video/*';

  return (
    <div className="space-y-4">
      {mediaWithUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaWithUrls.map((media) => (
            <div key={media.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-memoir-blue/5 border-2 border-memoir-blue/10">
                {media.type === 'image' && media.localUrl && (
                  <RawImage
                    src={media.localUrl}
                    alt={media.nom || 'Photo'}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <button
                onClick={() => handleRemove(media)}
                className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
              {media.nom && (
                <p className="mt-1 text-xs text-memoir-blue/60 truncate">
                  {media.nom}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <label className="cursor-pointer">
        <input
          type="file"
          accept={acceptTypes}
          multiple
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        <div className="border-2 border-dashed border-memoir-blue/30 rounded-xl p-8 hover:border-memoir-gold transition-colors bg-memoir-blue/5 hover:bg-memoir-gold/5">
          <div className="flex flex-col items-center gap-3">
            {isUploading ? (
              <>
                <div className="animate-spin w-8 h-8 border-4 border-memoir-gold border-t-transparent rounded-full" />
                <p className="text-memoir-blue/70">Upload en cours...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-memoir-gold" />
                <p className="text-memoir-blue/70 text-center">
                  <span className="font-medium text-memoir-gold">Cliquez pour ajouter</span>
                  <br />
                  <span className="text-sm">ou glissez vos photos ici</span>
                </p>
                <p className="text-xs text-memoir-blue/50">
                  {mediaWithUrls.length > 0
                    ? `${mediaWithUrls.length} photo${mediaWithUrls.length > 1 ? 's' : ''} ajoutée${mediaWithUrls.length > 1 ? 's' : ''}`
                    : 'Formats acceptés : JPG, PNG, GIF'}
                </p>
              </>
            )}
          </div>
        </div>
      </label>
    </div>
  );
}
