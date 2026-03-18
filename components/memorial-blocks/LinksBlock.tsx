'use client';

import WebLinksDisplay from '@/components/WebLinksDisplay';

interface LinksBlockProps {
  liens: any[];
  template: any;
}

export default function LinksBlock({ liens, template }: LinksBlockProps) {
  if (!liens || liens.length === 0) {
    return (
      <div
        className="rounded-xl shadow p-6"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: `1px dashed ${template.colors.accent}66` }}
      >
        <h3 className="text-2xl font-bold mb-2" style={{ color: template.colors.text }}>
          Contributions extérieures
        </h3>
        <p style={{ color: template.colors.text, opacity: 0.75 }}>
          Aucun lien de cagnotte ou de contribution n'a encore été ajouté.
        </p>
      </div>
    );
  }
  
  return (
    <WebLinksDisplay
      liens={liens}
      accentColor={template.colors.accent}
      textColor={template.colors.text}
      bgColor={template.colors.bg}
    />
  );
}
