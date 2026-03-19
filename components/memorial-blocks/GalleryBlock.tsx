'use client';

import PhotoGallery from '@/components/PhotoGallery';
import FluidPresentation from '@/components/FluidPresentation';
import RawImage from '@/components/RawImage';

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

  const featuredMedia = usableMedias[0];
  const supportingMedias = usableMedias.slice(1, 3);

  return (
    <div
      className="rounded-[32px] border p-6 shadow-[0_24px_70px_rgba(15,23,38,0.08)] md:p-8"
      style={{
        backgroundColor: isLightBg ? 'rgba(255,255,255,0.68)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${template.colors.accent}20`,
      }}
    >
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: template.colors.accent }}>
          Images et souvenirs
        </p>
        <h3 className="mt-2 text-[1.9rem] font-serif leading-tight" style={{ color: template.colors.text }}>
          Galerie
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: template.colors.text, opacity: 0.72 }}>
          Des images cadrées avec soin, pour donner du rythme au récit et laisser place aux détails qui comptent.
        </p>
      </div>

      {!presentationMode && featuredMedia ? (
        <div className={`mb-8 grid gap-4 ${supportingMedias.length > 0 ? 'lg:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.65fr)]' : ''}`}>
          <figure className="overflow-hidden rounded-[28px] border" style={{ borderColor: `${template.colors.accent}22` }}>
            <div className="relative h-[340px] md:h-[420px]">
              <RawImage
                src={featuredMedia.url}
                alt={featuredMedia.caption || 'Souvenir principal'}
                className="h-full w-full object-cover"
              />
            </div>
            {featuredMedia.caption ? (
              <figcaption
                className="border-t px-5 py-4 text-sm leading-6"
                style={{
                  borderColor: `${template.colors.accent}16`,
                  color: template.colors.text,
                  backgroundColor: isLightBg ? 'rgba(255,255,255,0.9)' : 'rgba(12,18,29,0.55)',
                }}
              >
                {featuredMedia.caption}
              </figcaption>
            ) : null}
          </figure>

          {supportingMedias.length > 0 ? (
            <div className="grid gap-4">
              {supportingMedias.map((media, index) => (
                <figure
                  key={media.id || `supporting-media-${index}`}
                  className="overflow-hidden rounded-[24px] border"
                  style={{ borderColor: `${template.colors.accent}22` }}
                >
                  <div className="relative h-[158px] md:h-[200px]">
                    <RawImage
                      src={media.url}
                      alt={media.caption || `Souvenir ${index + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {media.caption ? (
                    <figcaption
                      className="border-t px-4 py-3 text-xs leading-5"
                      style={{
                        borderColor: `${template.colors.accent}16`,
                        color: template.colors.text,
                        backgroundColor: isLightBg ? 'rgba(255,255,255,0.92)' : 'rgba(12,18,29,0.55)',
                      }}
                    >
                      {media.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

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
