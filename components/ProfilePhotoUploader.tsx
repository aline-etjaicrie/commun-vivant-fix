'use client';

import { useState, useEffect } from 'react';
import { Upload, X, User } from 'lucide-react';
import { savePhoto, getPhoto, deletePhoto, fileToBlob, blobToURL } from '@/lib/indexedDB';
import RawImage from '@/components/RawImage';
import { optimizeImageFile } from '@/lib/client/imageOptimization';

interface ProfilePhotoUploaderProps {
  photoId?: string;
  onPhotoChange: (photoId: string | undefined) => void;
  memorialId: string;
}

export default function ProfilePhotoUploader({ photoId, onPhotoChange, memorialId }: ProfilePhotoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (photoId) {
      void loadPhoto(photoId);
    }
  }, [photoId]);

  const loadPhoto = async (id: string) => {
    try {
      const photo = await getPhoto(id);
      if (photo) {
        const url = blobToURL(photo.blob);
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error('Erreur chargement photo:', error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      alert("L'image est vraiment trop lourde (maximum 30 Mo avant allegement automatique)");
      return;
    }

    setIsUploading(true);

    try {
      const preparedFile = await optimizeImageFile(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
      });
      const blob = await fileToBlob(preparedFile);
      const id = `profile-${memorialId}-${Date.now()}`;
      
      await savePhoto({
        id,
        memorialId,
        type: 'profile',
        blob,
        nom: preparedFile.name,
      });

      const url = blobToURL(blob);
      setPreviewUrl(url);
      onPhotoChange(id);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de la photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (photoId) {
      try {
        await deletePhoto(photoId);
        setPreviewUrl(null);
        onPhotoChange(undefined);
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {previewUrl ? (
          <div className="relative group">
            <RawImage
              src={previewUrl}
              alt="Photo de profil"
              loading="eager"
              className="w-32 h-32 rounded-full object-cover border-4 border-memoir-gold shadow-lg"
            />
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full border-4 border-memoir-blue/20 border-dashed flex items-center justify-center bg-memoir-blue/5">
            <User className="w-12 h-12 text-memoir-blue/30" />
          </div>
        )}
      </div>

      <label className="cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        <div className="flex items-center gap-2 px-4 py-2 bg-memoir-gold text-white rounded-lg hover:bg-memoir-gold/90 transition-colors disabled:opacity-50">
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isUploading ? 'Preparation...' : previewUrl ? 'Changer la photo' : 'Ajouter une photo'}
          </span>
        </div>
      </label>

      <p className="text-xs text-memoir-blue/60 text-center max-w-xs">
        Cette photo apparaîtra en haut du mémorial. Elle sera allegée automatiquement.
      </p>
    </div>
  );
}
