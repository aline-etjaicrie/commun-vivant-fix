'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PublishedMemorialRenderer from '@/components/memorial/PublishedMemorialRenderer';
import type { ExampleMemorial } from '@/lib/exampleMemorials';
import {
  buildThemeTemplate,
  getCompositionModel,
  getVisualTheme,
  getWritingStyle,
  hexToRgba,
} from '@/lib/compositionStudio';
import { applyTypographyPreference } from '@/lib/memorialRuntime';

export default function ExampleMemorialPage({ example }: { example: ExampleMemorial }) {
  const theme = getVisualTheme(example.visualTheme);
  const model = getCompositionModel(example.compositionModel);
  const writingStyle = getWritingStyle(example.writingStyle);
  const currentTemplate = applyTypographyPreference(
    buildThemeTemplate(example.visualTheme, example.communType),
    example.textTypography
  );

  const memorial = {
    ...example.memorial,
    liensWeb: example.memorial.liensWeb || [],
    tributeMode: example.tributeMode,
    textTypography: example.textTypography,
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(180deg, ${theme.preview.from}, ${theme.colors.bg})`,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <Link
          href="/exemple"
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
          style={{
            borderColor: `${theme.colors.accent}33`,
            color: theme.colors.text,
            backgroundColor:
              example.visualTheme === 'night-cinematic' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux exemples
        </Link>

        <div
          className="mt-5 rounded-[28px] border px-5 py-5 md:px-6"
          style={{
            borderColor: `${theme.colors.accent}24`,
            backgroundColor:
              example.visualTheme === 'night-cinematic' ? 'rgba(9,14,24,0.28)' : 'rgba(255,255,255,0.72)',
          }}
        >
          <div className="flex flex-wrap gap-2">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{
                backgroundColor: hexToRgba(theme.colors.accent, 0.14),
                color: theme.colors.text,
              }}
            >
              {model.label}
            </span>
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{
                backgroundColor: hexToRgba(theme.colors.accent, 0.1),
                color: theme.colors.textSecondary,
              }}
            >
              {theme.label}
            </span>
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{
                backgroundColor: hexToRgba(theme.colors.accent, 0.08),
                color: theme.colors.textSecondary,
              }}
            >
              {writingStyle.label}
            </span>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6" style={{ color: theme.colors.textSecondary }}>
            Exemple de rendu final utilisant le même moteur de composition que la preview et la page publiée.
          </p>
        </div>
      </div>

      <PublishedMemorialRenderer
        memorial={memorial}
        communType={example.communType}
        memorialId={`example-${example.slug}`}
        currentTemplate={currentTemplate}
        compositionModel={example.compositionModel}
        visualTheme={example.visualTheme}
        writingStyle={example.writingStyle}
        profilePhotoUrl={example.coverImage}
        galleryMediasWithUrls={example.gallery}
        audioUrl={example.audioUrl}
        audioTitle={example.audioTitle}
        showCompositionBadges={false}
      />
    </div>
  );
}
