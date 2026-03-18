'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Check, ZoomIn } from 'lucide-react';
import { savePhoto, getPhoto, deletePhoto, fileToBlob, blobToURL } from '@/lib/indexedDB';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/utils/cropImage';
import RawImage from '@/components/RawImage';
import { optimizeImageBlob, optimizeImageFile } from '@/lib/client/imageOptimization';

interface PhotoUploaderProps {
  photoId?: string;
  onPhotoChange: (photoId: string | undefined) => void;
  memorialId: string;
  label?: string;
  filter?: string;
}

const getFilterStyle = (filter: string) => {
  switch (filter) {
    case 'sepia': return 'sepia(80%)';
    case 'bw': return 'grayscale(100%)';
    case 'enhanced': return 'contrast(120%) saturate(120%)';
    default: return 'none';
  }
};

export default function PhotoUploader({
  photoId,
  onPhotoChange,
  memorialId,
  label = "Photo de profil",
  filter = 'none'
}: PhotoUploaderProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Cropping State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [tempFile, setTempFile] = useState<{ url: string; file: File } | null>(null);

  useEffect(() => {
    if (photoId) {
      void loadPhoto(photoId);
      return;
    }

    setPhotoUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return null;
    });
  }, [photoId]);

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      if (tempFile?.url) URL.revokeObjectURL(tempFile.url);
    };
  }, [photoUrl, tempFile]);

  const loadPhoto = async (id: string) => {
    try {
      const photo = await getPhoto(id);
      if (photo) {
        const url = blobToURL(photo.blob);
        setPhotoUrl(url);
      }
    } catch (error) {
      console.error('Erreur chargement photo:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void (async () => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        return;
      }

      if (file.size > 30 * 1024 * 1024) {
        alert("L'image est vraiment trop lourde (maximum 30 Mo avant allègement automatique)");
        return;
      }

      const optimizedFile = await optimizeImageFile(file, {
        maxWidth: 2400,
        maxHeight: 2400,
        quality: 0.88,
      });

      const url = URL.createObjectURL(optimizedFile);
      setTempFile({ url, file: optimizedFile });
      setIsCropping(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    })();
  };

  const handleCropSave = async () => {
    if (!tempFile || !croppedAreaPixels) return;

    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImg(tempFile.url, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Erreur lors du recadrage");
      const optimizedBlob = await optimizeImageBlob(croppedBlob, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
      });

      const id = `photo-profil-${memorialId}-${Date.now()}`;

      await savePhoto({
        id,
        memorialId,
        type: 'profile',
        blob: optimizedBlob,
        nom: tempFile.file.name,
      });

      // Cleanup old URL if exists
      if (photoUrl) URL.revokeObjectURL(photoUrl);

      const newUrl = blobToURL(optimizedBlob);
      setPhotoUrl(newUrl);
      onPhotoChange(id);

      // Close cropper
      setIsCropping(false);
      setTempFile(null);
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
        if (photoUrl) URL.revokeObjectURL(photoUrl);
        setPhotoUrl(null);
        onPhotoChange(undefined);
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  // Crop View
  if (isCropping && tempFile) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-xl h-[60vh] bg-gray-900 rounded-lg overflow-hidden border border-white/10 mb-6">
          <Cropper
            image={tempFile.url}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
            onZoomChange={setZoom}
          />
        </div>

        <div className="w-full max-w-md space-y-4">
          <div className="flex items-center gap-2">
            <ZoomIn className="text-white w-5 h-5" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-memoir-gold"
            />
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => { setIsCropping(false); setTempFile(null); }}
              className="px-6 py-2 text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              disabled={isUploading}
            >
              Annuler
            </button>
            <button
              onClick={handleCropSave}
              className="flex items-center gap-2 px-8 py-2 text-white bg-memoir-gold hover:bg-memoir-gold/90 rounded-lg transition-colors font-medium shadow-lg"
              disabled={isUploading}
            >
              {isUploading ? 'Traitement...' : <><Check className="w-4 h-4" /> Valider</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal View
  return (
    <div className="space-y-3">
      {photoUrl ? (
        <div className="border-2 border-memoir-gold/30 rounded-lg overflow-hidden bg-memoir-gold/5">
          <div className="relative">
            <RawImage
              src={photoUrl}
              alt={label}
              loading="eager"
              className="w-full h-64 object-cover transition-all duration-300"
              style={{ filter: getFilterStyle(filter) }}
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors shadow-lg"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="p-3 text-center">
            <p className="text-sm text-memoir-blue/70">
              Cliquez sur la croix pour changer la photo
            </p>
          </div>
        </div>
      ) : (
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
          <div className="border-2 border-dashed border-memoir-blue/20 rounded-lg p-8 hover:border-memoir-gold/50 transition-colors bg-memoir-blue/5 hover:bg-memoir-gold/5">
            <div className="flex flex-col items-center gap-3">
              {isUploading ? (
                <>
                  <div className="animate-spin w-8 h-8 border-4 border-memoir-gold border-t-transparent rounded-full" />
                  <p className="text-sm text-memoir-blue/70">Preparation de l'image...</p>
                </>
              ) : (
                <>
                  <ImageIcon className="w-12 h-12 text-memoir-gold" />
                  <div className="text-center">
                    <p className="font-medium text-memoir-gold mb-1">
                      Ajouter une {label.toLowerCase()}
                    </p>
                    <p className="text-xs text-memoir-blue/50">
                      JPG, PNG, WebP, HEIC/HEIF • allegement automatique
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </label>
      )}
      <p className="text-xs text-memoir-blue/50">
        Vos images sont allegees automatiquement pour faciliter l'envoi.
      </p>
    </div>
  );
}
