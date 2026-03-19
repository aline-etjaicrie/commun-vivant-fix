import Link from 'next/link';
import Image from 'next/image';
import { EXAMPLE_MEMORIALS } from '@/lib/exampleMemorials';
import {
  getCompositionModel,
  getVisualTheme,
  getWritingStyle,
  hexToRgba,
} from '@/lib/compositionStudio';

export default function ExemplePage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F6F1EA_0%,#FBFAF7_25%,#FFFFFF_100%)] px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#8C6635]">
            Exemples réels
          </p>
          <h1 className="mt-5 text-4xl text-[#0F2A44] md:text-6xl" style={{ fontFamily: 'var(--font-serif)' }}>
            Trois rendus, trois manières de faire vivre une mémoire.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5E6B78]">
            Chaque exemple reprend le même moteur de rendu que les pages publiées. Ce que vous voyez ici
            correspond à la direction réelle du produit : modèle final, ambiance visuelle, voix du texte et
            place donnée aux images, aux liens et aux gestes d’hommage.
          </p>
        </div>

        <div className="mt-14 grid gap-8 xl:grid-cols-3">
          {EXAMPLE_MEMORIALS.map((example) => {
            const model = getCompositionModel(example.compositionModel);
            const theme = getVisualTheme(example.visualTheme);
            const writingStyle = getWritingStyle(example.writingStyle);

            return (
              <article
                key={example.slug}
                className="overflow-hidden rounded-[34px] border shadow-[0_24px_80px_rgba(15,42,68,0.08)]"
                style={{
                  borderColor: `${theme.colors.accent}30`,
                  background: `linear-gradient(180deg, ${hexToRgba(theme.colors.surface, 0.96)}, ${theme.colors.bg})`,
                }}
              >
                <Link href={`/exemple/${example.slug}`} className="block">
                  <div className="relative h-[320px] overflow-hidden">
                    <Image
                      src={example.coverImage}
                      alt={example.cardTitle}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          example.visualTheme === 'night-cinematic'
                            ? 'linear-gradient(180deg, rgba(7,10,18,0.16), rgba(7,10,18,0.78))'
                            : 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(15,42,68,0.5))',
                      }}
                    />
                    <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                      <span
                        className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                        style={{
                          backgroundColor: hexToRgba(theme.colors.surface, 0.86),
                          color: theme.colors.text,
                        }}
                      >
                        {example.cardLabel}
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="text-sm uppercase tracking-[0.24em] text-white/75">{model.label}</p>
                      <h2 className="mt-2 text-3xl leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                        {example.cardTitle}
                      </h2>
                    </div>
                  </div>
                </Link>

                <div className="space-y-5 px-6 py-6">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                      style={{
                        borderColor: `${theme.colors.accent}30`,
                        color: theme.colors.accent,
                        backgroundColor: hexToRgba(theme.colors.accent, 0.08),
                      }}
                    >
                      {theme.label}
                    </span>
                    <span
                      className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                      style={{
                        borderColor: `${theme.colors.accent}22`,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {writingStyle.label}
                    </span>
                  </div>

                  <p className="text-base leading-7 text-[#5E6B78]">{example.cardDescription}</p>

                  <div className="rounded-[24px] border px-4 py-4" style={{ borderColor: `${theme.colors.accent}20` }}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: theme.colors.accent }}>
                      Signature du rendu
                    </p>
                    <p className="mt-2 text-sm leading-6" style={{ color: theme.colors.text }}>
                      {model.signature}
                    </p>
                  </div>

                  <Link
                    href={`/exemple/${example.slug}`}
                    className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
                    style={{ backgroundColor: theme.colors.accent }}
                  >
                    Ouvrir cet exemple
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-16">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-[#DCCDBA] px-6 py-3 text-sm font-medium text-[#0F2A44] transition hover:border-[#A27C53] hover:bg-white"
          >
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
