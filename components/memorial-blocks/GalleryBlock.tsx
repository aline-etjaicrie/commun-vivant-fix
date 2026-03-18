'use client';

import PhotoGallery from '@/components/PhotoGallery';
import FluidPresentation from '@/components/FluidPresentation';

interface GalleryBlockProps {
  medias: any[];
  template: any;
  photoFilter?: string; // Made optional
  isLightBg: boolean;
  presentationMode?: boolean;
}

export default function GalleryBlock({
  medias,
  template,
  photoFilter = 'original',
  isLightBg,
  presentationMode = false,
}: GalleryBlockProps) {
  const usableMedias = (medias || []).filter((m) => {
    const url = String(m?.url || '');
    return Boolean(url) && !url.startsWith('indexed-db:');
  });
  if (usableMedias.length === 0) return null;

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
        Galerie
      </h3>
      {presentationMode && (
        <FluidPresentation
          medias={usableMedias}
          accentColor={template.colors.accent}
          textColor={template.colors.text}
        />
      )}
      <PhotoGallery
        medias={usableMedias}
        accentColor={template.colors.accent}
        textColor={template.colors.text}
        bgColor={template.colors.bg}
        selectedFilter={
          photoFilter === 'bw' ? 'noir-blanc' :
            photoFilter === 'vintage' ? 'adouci' :
              photoFilter === 'none' ? 'original' :
                (photoFilter || 'original') as any
        }
        showFilterSelector={false}
      />
    </div>
  );
}
