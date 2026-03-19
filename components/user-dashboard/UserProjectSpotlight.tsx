import type { ComponentType } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Eye,
  Flame,
  Flower2,
  Music4,
  Palette,
  PenSquare,
  Shapes,
  Sparkles,
} from 'lucide-react';
import RawImage from '@/components/RawImage';
import {
  getCompositionModel,
  getVisualTheme,
  getWritingStyle,
} from '@/lib/compositionStudio';
import { formatIdentityForDisplay } from '@/lib/memorialRuntime';
import type { DashboardAction } from '@/lib/user-dashboard/presentation';
import { formatRelativeDate, getMemorialStage } from '@/lib/user-dashboard/presentation';
import type { UserMemorialItem } from '@/lib/user-dashboard/types';

function ActionButton({ action }: { action: DashboardAction }) {
  if (action.external) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#1B2D3E] px-5 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
      >
        {action.label}
        <ArrowUpRight className="h-4 w-4" />
      </a>
    );
  }

  return (
    <Link
      href={action.href}
      className="inline-flex items-center gap-2 rounded-full bg-[#1B2D3E] px-5 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
    >
      {action.label}
      <ArrowUpRight className="h-4 w-4" />
    </Link>
  );
}

export default function UserProjectSpotlight({
  memorial,
  primaryAction,
}: {
  memorial: UserMemorialItem;
  primaryAction: DashboardAction;
}) {
  const stage = getMemorialStage(memorial);
  const theme = getVisualTheme(memorial.visualTheme || 'memorial-soft');
  const model = getCompositionModel(memorial.compositionModel || 'portrait-sensitive');
  const writingStyle = getWritingStyle(memorial.writingStyle || 'sobre-digne');
  const identity = formatIdentityForDisplay({
    identite: {
      prenom: memorial.subjectFirstName,
      nom: memorial.subjectLastName,
    },
  });
  const displayName =
    [identity.prenom, identity.nom].filter(Boolean).join(' ').trim() || memorial.title;

  const tributeLabel =
    memorial.tributeMode === 'candle'
      ? 'Bougie'
      : memorial.tributeMode === 'flower'
        ? 'Fleurs'
        : memorial.tributeMode === 'none'
          ? 'Sans hommage visuel'
          : 'Bougie et fleurs';

  const stageClassName =
    stage.tone === 'published'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : stage.tone === 'ready'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : stage.tone === 'progress'
          ? 'bg-sky-50 text-sky-700 border-sky-200'
          : 'bg-stone-50 text-stone-700 border-stone-200';

  const creativeChoices = [
    { id: 'model', icon: Shapes, label: model.label },
    { id: 'theme', icon: Palette, label: theme.label },
    { id: 'writing', icon: PenSquare, label: writingStyle.label },
    {
      id: 'tribute',
      icon: memorial.tributeMode === 'flower' ? Flower2 : Flame,
      label: tributeLabel,
    },
    memorial.audioEnabled
      ? { id: 'audio', icon: Music4, label: memorial.audioTitle || 'Musique activée' }
      : null,
  ].filter(Boolean) as Array<{ id: string; icon: ComponentType<{ className?: string }>; label: string }>;

  return (
    <section className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,38,0.06)] md:p-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_420px] xl:items-stretch">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${stageClassName}`}>
              {stage.label}
            </span>
            <span className="text-sm text-[#6B7280]">
              Créé {formatRelativeDate(memorial.createdAt)}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Projet à reprendre</p>
            <h2 className="text-3xl font-semibold text-[#102132] md:text-4xl">{displayName}</h2>
            <p className="max-w-2xl text-base leading-relaxed text-[#516173]">{stage.description}</p>
          </div>

          <div className="rounded-[24px] border border-[#E5E7EB] bg-[#F8F7F4] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Prochaine action recommandée</p>
            <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold text-[#102132]">{primaryAction.label}</p>
                <p className="text-sm text-[#516173]">{primaryAction.description}</p>
              </div>
              <ActionButton action={primaryAction} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Composition actuelle</p>
            <div className="flex flex-wrap gap-2">
              {creativeChoices.map((choice) => {
                const Icon = choice.icon;
                return (
                  <span
                    key={choice.id}
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm text-[#223346]"
                    style={{
                      borderColor: `${theme.colors.accent}2A`,
                      backgroundColor: `${theme.colors.accentSoft}80`,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {choice.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-[30px] border"
          style={{
            borderColor: theme.colors.border,
            background: `linear-gradient(145deg, ${theme.preview.from}, ${theme.preview.via}, ${theme.preview.to})`,
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_45%)]" />
          <div className="relative flex h-full min-h-[340px] flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                style={{
                  borderColor: `${theme.colors.accent}33`,
                  color: theme.colors.text,
                  backgroundColor: 'rgba(255,255,255,0.55)',
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Aperçu du projet
              </span>

              <Link
                href={`/memorial/${memorial.id}/preview`}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-[#102132] transition-colors hover:bg-white/70"
                style={{ borderColor: `${theme.colors.accent}33` }}
              >
                <Eye className="h-3.5 w-3.5" />
                Ouvrir l’aperçu
              </Link>
            </div>

            <div className="mx-auto w-full max-w-[320px]">
              <div className="overflow-hidden rounded-[26px] border border-white/60 bg-white/75 shadow-[0_24px_80px_rgba(15,23,38,0.12)]">
                <div className="relative aspect-[4/5]">
                  {memorial.profilePhotoUrl ? (
                    <RawImage
                      src={memorial.profilePhotoUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full items-center justify-center text-4xl font-semibold"
                      style={{ color: theme.colors.text }}
                    >
                      {displayName
                        .split(' ')
                        .map((part) => part.charAt(0))
                        .join('')
                        .slice(0, 2)}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#102132]/85 to-transparent p-5 text-white">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/70">{model.label}</p>
                    <p className="mt-2 text-2xl font-semibold">{displayName}</p>
                    <p className="mt-2 text-sm text-white/75">{writingStyle.label}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[20px] bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#6B7280]">Photos</p>
                <p className="mt-2 text-2xl font-semibold text-[#102132]">{memorial.photosCount}</p>
              </div>
              <div className="rounded-[20px] bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#6B7280]">Messages</p>
                <p className="mt-2 text-2xl font-semibold text-[#102132]">{memorial.messagesCount}</p>
              </div>
              <div className="rounded-[20px] bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#6B7280]">Bougies</p>
                <p className="mt-2 text-2xl font-semibold text-[#102132]">{memorial.candlesCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
