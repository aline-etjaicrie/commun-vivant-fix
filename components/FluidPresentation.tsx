'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

interface FluidPresentationProps {
  medias: Array<{ type?: string; url?: string }>;
  accentColor: string;
  textColor: string;
}

export default function FluidPresentation({ medias, accentColor, textColor }: FluidPresentationProps) {
  const imageUrls = useMemo(
    () => medias.filter((m) => (m.type || 'image') === 'image' && !!m.url).map((m) => m.url as string),
    [medias]
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (imageUrls.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % imageUrls.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [imageUrls.length]);

  if (imageUrls.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border p-3" style={{ borderColor: `${accentColor}66` }}>
      <p className="mb-2 text-xs uppercase tracking-widest" style={{ color: textColor, opacity: 0.7 }}>
        Presentation fluide
      </p>
      <div className="relative h-64 overflow-hidden rounded-lg bg-black/10">
        {imageUrls.map((url, i) => (
          <Image
            key={`${url}-${i}`}
            src={url}
            alt="Souvenir"
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 1024px"
            className="absolute inset-0 object-contain transition-opacity duration-1000"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}
      </div>
    </div>
  );
}
