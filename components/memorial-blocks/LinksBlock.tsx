'use client';

import WebLinksDisplay from '@/components/WebLinksDisplay';

interface LinksBlockProps {
  liens: any[];
  template: any;
}

export default function LinksBlock({ liens, template }: LinksBlockProps) {
  if (!liens || liens.length === 0) return null;
  
  return (
    <WebLinksDisplay
      liens={liens}
      accentColor={template.colors.accent}
      textColor={template.colors.text}
      bgColor={template.colors.bg}
    />
  );
}
