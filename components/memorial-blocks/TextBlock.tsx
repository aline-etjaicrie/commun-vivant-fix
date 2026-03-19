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
  const useDropCap = effectiveFont !== 'sans';
  
  return (
    <div 
      className="rounded-[32px] border p-7 shadow-[0_24px_70px_rgba(15,23,38,0.08)] md:p-10 lg:p-12"
      style={{ 
        backgroundColor: isLightBg ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.06)',
        color: template.colors.text,
        border: `1px solid ${template.colors.accent}20`
      }}
    >
      <div className="mb-8 flex items-center gap-4">
        <div className="h-px flex-1" style={{ backgroundColor: `${template.colors.accent}28` }} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: template.colors.accent }}>
          Récit principal
        </p>
        <div className="h-px flex-1" style={{ backgroundColor: `${template.colors.accent}28` }} />
      </div>

      <div className="mx-auto max-w-[72ch] space-y-12">
        {sections.map((section, index) => {
          const lines = section.split('\n').map((l) => l.trim()).filter(Boolean);
          const first = lines[0] || '';
          const hasTitle = first.endsWith(':') || first.length <= 42;
          const title = hasTitle ? first.replace(/:$/, '') : null;
          const body = hasTitle ? lines.slice(1).join('\n') : lines.join('\n');
          const paragraphs = body
            .split('\n')
            .map((paragraph) => paragraph.trim())
            .filter(Boolean);
          return (
            <div key={`section-${index}`} className="space-y-4">
              {title ? (
                <h3
                  className={`text-[1.55rem] leading-tight md:text-[1.95rem] ${headingClass}`}
                  style={{ color: template.colors.accent }}
                >
                  {title}
                </h3>
              ) : null}
              <div className="space-y-5">
                {paragraphs.map((paragraph, paragraphIndex) => (
                  <p
                    key={`paragraph-${index}-${paragraphIndex}`}
                    className={`max-w-[68ch] text-[1.06rem] md:text-[1.18rem] ${paragraphClass} ${
                      useDropCap && index === 0 && paragraphIndex === 0 ? 'first-letter:text-5xl first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:leading-none md:first-letter:text-6xl' : ''
                    }`}
                    style={{
                      color: template.colors.text,
                      opacity: 0.94,
                      lineHeight: effectiveFont === 'calligraphy' ? '2.05' : '1.95'
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
        {thematicSections.length > 0 && (
          <div className="space-y-5 border-t border-black/10 pt-10">
            <h3 className={`text-[1.55rem] md:text-[1.95rem] ${headingClass}`} style={{ color: template.colors.accent }}>
              Repères de vie
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {thematicSections.map((section, index) => (
                <div
                  key={`theme-${index}`}
                  className="rounded-2xl border p-4"
                  style={{ borderColor: `${template.colors.accent}22`, backgroundColor: isLightBg ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)' }}
                >
                  <h4 className={`text-base md:text-lg ${headingClass}`} style={{ color: template.colors.text }}>
                    {section.title}
                  </h4>
                  <p
                    className={`mt-2 whitespace-pre-line text-sm md:text-base ${paragraphClass}`}
                    style={{ color: template.colors.text, opacity: 0.88, lineHeight: '1.75' }}
                  >
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
