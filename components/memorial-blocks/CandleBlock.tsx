'use client';

import CandleMemorial from '@/components/CandleMemorial';

interface CandleBlockProps {
  prenom?: string;
  memorialId: string;
  template: any;
}

export default function CandleBlock({ prenom, memorialId, template }: CandleBlockProps) {
  if (!prenom) return null;
  
  return (
    <CandleMemorial 
      prenom={prenom}
      memorialId={memorialId}
      accentColor={template.colors.accent}
      textColor={template.colors.text}
      bgColor={template.colors.bg}
    />
  );
}
