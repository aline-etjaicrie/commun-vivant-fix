'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import RawImage from '@/components/RawImage';

interface Media {
  id: string;
  type: string;
  url: string;
  nom?: string;
  description?: string;
}

interface PhotoGalleryProps {
  medias: Media[];
  accentColor: string;
  textColor: string;
  bgColor: string;
  selectedFilter?: 'original' | 'noir-blanc' | 'sepia' | 'adouci';
  onFilterChange?: (filter: 'original' | 'noir-blanc' | 'sepia' | 'adouci') => void;
  showFilterSelector?: boolean;
}

type FilterType = 'original' | 'noir-blanc' | 'sepia' | 'adouci';

export default function PhotoGallery({ 
  medias, 
  accentColor, 
  textColor, 
  bgColor,
  selectedFilter = 'original',
  onFilterChange,
  showFilterSelector = false
}: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<FilterType>(selectedFilter);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const images = medias.filter((m) => m.type === 'image' || m.type === 'gallery');
  
  if (images.length === 0) return null;

  const filters = {
    'original': '',
    'noir-blanc': 'grayscale(100%)',
    'sepia': 'sepia(80%) contrast(1.1)',
    'adouci': 'brightness(1.1) contrast(0.9) saturate(0.8)',
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      setIsTransitioning(false);
    }, 300);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      setIsTransitioning(false);
    }, 300);
  };

  const currentImage = images[currentIndex];

  return (
    <>
      <div className="mb-8">
        {showFilterSelector && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <span className="text-sm font-medium w-full text-center mb-2" style={{ color: textColor, opacity: 0.7 }}>
              Choisir le style des photos :
            </span>
            {(['original', 'noir-blanc', 'sepia', 'adouci'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: filter === f ? accentColor : 'transparent',
                  color: filter === f ? (bgColor === '#FFFFFF' ? '#000' : bgColor) : textColor,
                  border: `2px solid ${filter === f ? accentColor : 'rgba(128,128,128,0.3)'}`,
                  opacity: filter === f ? 1 : 0.6,
                }}
              >
                {f === 'original' && 'Original'}
                {f === 'noir-blanc' && 'Noir & Blanc'}
                {f === 'sepia' && 'Sépia'}
                {f === 'adouci' && 'Adouci'}
              </button>
            ))}
          </div>
        )}

        <div className="relative w-full max-w-4xl mx-auto">
          <div 
            className="relative w-full rounded-lg overflow-hidden shadow-2xl"
            style={{ 
              perspective: '2000px',
              backgroundColor: 'rgba(0,0,0,0.05)',
              minHeight: '300px',
            }}
          >
            <div
              className="relative w-full transition-transform duration-500 ease-in-out"
              style={{
                transform: isTransitioning ? 'rotateY(-15deg) scale(0.95)' : 'rotateY(0deg) scale(1)',
                transformStyle: 'preserve-3d',
                transformOrigin: 'left center',
              }}
            >
              <RawImage
                src={currentImage.url}
                alt={currentImage.nom || `Photo ${currentIndex + 1}`}
                loading="eager"
                className="w-full h-auto object-contain"
                style={{
                  filter: filters[filter],
                  backfaceVisibility: 'hidden',
                  maxHeight: '70vh',
                }}
              />
              
              <button
                onClick={() => setIsZoomed(true)}
                className="absolute top-4 right-4 p-2 md:p-3 rounded-full backdrop-blur-sm transition-all hover:scale-110"
                style={{ 
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: '#fff'
                }}
              >
                <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          <button
            onClick={handlePrevious}
            disabled={isTransitioning}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full backdrop-blur-sm transition-all hover:scale-110 disabled:opacity-50"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff'
            }}
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            onClick={handleNext}
            disabled={isTransitioning}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full backdrop-blur-sm transition-all hover:scale-110 disabled:opacity-50"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff'
            }}
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <div className="flex items-center justify-center gap-2 mt-6">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isTransitioning && index !== currentIndex) {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setCurrentIndex(index);
                      setIsTransitioning(false);
                    }, 300);
                  }
                }}
                className="transition-all rounded-full"
                style={{
                  width: index === currentIndex ? '28px' : '8px',
                  height: '8px',
                  backgroundColor: index === currentIndex ? accentColor : 'rgba(128,128,128,0.3)',
                }}
              />
            ))}
          </div>

          {currentImage.nom && (
            <p 
              className="text-center mt-4 text-sm italic px-4"
              style={{ color: textColor, opacity: 0.7 }}
            >
              {currentImage.nom}
            </p>
          )}

          <p 
            className="text-center mt-2 text-sm font-medium"
            style={{ color: textColor, opacity: 0.5 }}
          >
            {currentIndex + 1} / {images.length}
          </p>
        </div>
      </div>

      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 p-2 md:p-3 rounded-full transition-all hover:scale-110 z-10"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff'
            }}
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-2 md:left-4 p-2 md:p-3 rounded-full transition-all hover:scale-110 z-10"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff'
            }}
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 md:right-4 p-2 md:p-3 rounded-full transition-all hover:scale-110 z-10"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff'
            }}
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          <RawImage
            src={currentImage.url}
            alt={currentImage.nom || `Photo ${currentIndex + 1}`}
            loading="eager"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            style={{ filter: filters[filter] }}
            onClick={(e) => e.stopPropagation()}
          />

          {currentImage.nom && (
            <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-base md:text-lg px-4 text-center">
              {currentImage.nom}
            </p>
          )}
        </div>
      )}
    </>
  );
}
