'use client';

interface TextBlockProps {
  texte: string;
  template: any;
  isLightBg: boolean;
  fontStyle?: 'serif' | 'sans' | 'calligraphy';
  thematicSections?: Array<{ title: string; content: string }>;
}

export default function TextBlock({ texte, template, isLightBg, fontStyle, thematicSections = [] }: TextBlockProps) {
  if (!texte && thematicSections.length === 0) return null;

  const effectiveFont = fontStyle || (template.typography === 'calligraphy' ? 'calligraphy' : template.typography === 'serif' ? 'serif' : 'sans');
  const headingClass = effectiveFont === 'calligraphy' ? 'font-calli italic' : effectiveFont === 'serif' ? 'font-serif' : 'font-sans';
  const paragraphClass = `${template.fonts.body} ${effectiveFont === 'calligraphy' ? 'font-calli italic' : effectiveFont === 'serif' ? 'font-serif' : 'font-sans'}`;
  const sections = (texte || '')
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
  
  return (
    <div 
      className="rounded-xl shadow p-8"
      style={{ 
        backgroundColor: isLightBg ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
        color: template.colors.text
      }}
    >
      <div className="space-y-6">
        {sections.map((section, index) => {
          const lines = section.split('\n').map((l) => l.trim()).filter(Boolean);
          const first = lines[0] || '';
          const hasTitle = first.endsWith(':') || first.length <= 42;
          const title = hasTitle ? first.replace(/:$/, '') : null;
          const body = hasTitle ? lines.slice(1).join('\n') : lines.join('\n');
          return (
            <div key={`section-${index}`} className="space-y-3">
              {title ? (
                <h3 className={`text-xl md:text-2xl ${headingClass}`} style={{ color: template.colors.accent }}>
                  {title}
                </h3>
              ) : null}
              <p
                className={`whitespace-pre-line text-base md:text-lg ${paragraphClass}`}
                style={{
                  color: template.colors.text,
                  opacity: 0.92,
                  lineHeight: effectiveFont === 'calligraphy' ? '2' : '1.85'
                }}
              >
                {body}
              </p>
            </div>
          );
        })}
        {thematicSections.length > 0 && (
          <div className="space-y-4 border-t border-black/10 pt-6">
            <h3 className={`text-xl md:text-2xl ${headingClass}`} style={{ color: template.colors.accent }}>
              Reperes de vie
            </h3>
            {thematicSections.map((section, index) => (
              <div key={`theme-${index}`} className="space-y-1">
                <h4 className={`text-base md:text-lg ${headingClass}`} style={{ color: template.colors.text }}>
                  {section.title}
                </h4>
                <p
                  className={`whitespace-pre-line text-sm md:text-base ${paragraphClass}`}
                  style={{ color: template.colors.text, opacity: 0.88, lineHeight: '1.75' }}
                >
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
