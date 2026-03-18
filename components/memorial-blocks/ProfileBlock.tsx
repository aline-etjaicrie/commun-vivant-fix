'use client';

import Image from 'next/image';
import RawImage from '@/components/RawImage';

interface ProfileBlockProps {
  prenom?: string;
  nom?: string;
  dateNaissance?: string;
  dateDeces?: string;
  photoUrl?: string;
  coverImage?: string;
  template: any;
  photoFilter?: string;
  photoShape?: 'round' | 'square';
  coverImagePosition?: string;
}

export default function ProfileBlock({
  prenom,
  nom,
  dateNaissance,
  dateDeces,
  photoUrl,
  coverImage,
  template,
  photoFilter,
  photoShape = 'round',
  coverImagePosition = 'center'
}: ProfileBlockProps) {
  const filters: Record<string, string> = {
    original: '',
    none: '',
    bw: 'grayscale(100%)',
    'noir-blanc': 'grayscale(100%)',
    sepia: 'sepia(80%) contrast(1.1)',
    vintage: 'brightness(1.1) contrast(0.9) saturate(0.8)',
    adouci: 'brightness(1.1) contrast(0.9) saturate(0.8)',
  };

  const fullName = [prenom, nom].filter(Boolean).join(' ').trim() || 'Hommage';
  const shapeClass = photoShape === 'square' ? 'rounded-2xl' : 'rounded-full';
  const isCelebration = String(template?.id || '').startsWith('vivant-');
  const isTransmission = String(template?.id || '').startsWith('transmission-');

  const formatYear = (value?: string) => {
    if (!value) return null;
    const year = new Date(value).getFullYear();
    if (Number.isNaN(year)) return String(value).slice(0, 4);
    return String(year);
  };

  if (coverImage) {
    return (
      <div className="relative h-[60vh] w-full mb-12 -mt-12 md:-mt-16 overflow-hidden">
        <Image
          src={coverImage}
          alt="Cover"
          fill
          className="object-cover"
          style={{ objectPosition: coverImagePosition }}
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${template.colors.bg} 0%, transparent 60%, rgba(0,0,0,0.2) 100%)`
          }}
        />

        <div className="absolute bottom-0 w-full p-6 md:p-12 flex flex-col items-center text-center pb-12 md:pb-20">
          {photoUrl && (
            <div className="mb-6 relative animate-in fade-in zoom-in duration-1000">
              <RawImage
                src={photoUrl}
                alt={prenom || 'Photo de profil'}
                loading="eager"
                className={`w-40 h-40 md:w-52 md:h-52 object-cover border-4 shadow-2xl ${shapeClass}`}
                style={{
                  borderColor: template.colors.accent,
                  filter: filters[photoFilter || 'none'] || ''
                }}
              />
            </div>
          )}

          <h1
            className={`text-5xl md:text-7xl mb-4 drop-shadow-xl animate-in slide-in-from-bottom-4 duration-1000 delay-200 ${template.fonts.heading} ${template.typography === 'calligraphy' ? 'font-calli italic' : template.typography === 'serif' ? 'font-serif' : 'font-sans'}`}
            style={{ color: template.colors.text }}
          >
            {fullName}
          </h1>

          {(dateNaissance || dateDeces) && (
            <div
              className="flex items-center justify-center gap-3 text-lg tracking-[0.2em] font-light uppercase opacity-90 drop-shadow-md animate-in slide-in-from-bottom-4 duration-1000 delay-300"
              style={{ color: template.colors.accent }}
            >
              {dateNaissance && <span>{formatYear(dateNaissance)}</span>}
              {dateNaissance && dateDeces && <span>—</span>}
              {dateDeces && <span>{formatYear(dateDeces)}</span>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
      <div className={`text-center ${isCelebration ? 'space-y-2' : ''}`}>
      {photoUrl && (
        <div className="flex justify-center mb-6">
          <RawImage
            src={photoUrl}
            alt={prenom || 'Photo de profil'}
            loading="eager"
            className={`w-44 h-44 md:w-52 md:h-52 object-cover border-4 shadow-xl transition-all duration-700 ${shapeClass} ${isCelebration ? 'ring-4 ring-[#EE135D]/20' : ''}`}
            style={{
              borderColor: template.colors.accent,
              filter: filters[photoFilter || 'none'] || ''
            }}
          />
        </div>
      )}

      <h1
        className={`text-4xl md:text-5xl mb-3 ${template.fonts.heading} ${template.typography === 'serif' ? 'font-serif' :
          template.typography === 'calligraphy' ? 'font-calli' :
            'font-sans'
          }`}
        style={{ color: template.colors.text }}
      >
        {fullName}
      </h1>

      {isCelebration ? (
        <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: template.colors.accent }}>
          Celebration
        </p>
      ) : null}
      {isTransmission ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: template.colors.accent }}>
          Patrimoine familial
        </p>
      ) : null}

      {(dateNaissance || dateDeces) && (
        <div
          className="flex items-center justify-center gap-3 mb-10 text-sm tracking-widest font-light"
          style={{ color: template.colors.textSecondary }}
        >
          {dateNaissance && <span>{formatYear(dateNaissance)}</span>}
          {dateNaissance && dateDeces && <span>—</span>}
          {dateDeces && <span>{formatYear(dateDeces)}</span>}
        </div>
      )}

      <div
        className="h-px w-16 mx-auto"
        style={{ backgroundColor: template.colors.accent, opacity: 0.4 }}
      />
    </div>
  );
}
