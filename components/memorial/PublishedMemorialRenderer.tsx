'use client';

import { useState } from 'react';
import React from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { GripVertical, Home, Share2, Sparkles } from 'lucide-react';
import { resolveBlockIcon } from '@/lib/blockIconRegistry';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ContributeBlock,
  FamilyBlock,
  GalleryBlock,
  GoutsBlock,
  LinksBlock,
  LocationBlock,
  MessagesBlock,
  TextBlock,
  TributeBlock,
} from '@/components/memorial-blocks';
import type { CommunType } from '@/lib/communTypes';
import {
  getCompositionModel,
  getVisualTheme,
  getWritingStyle,
  hexToRgba,
  isLightVisualTheme,
  type CompositionModelId,
  type VisualThemeId,
  type WritingStyleId,
} from '@/lib/compositionStudio';
import {
  buildThematicSections,
  resolveTypographyPreference,
  sanitizeGeneratedText,
} from '@/lib/memorialRuntime';
import type { TemplateConfig } from '@/lib/templates';
import RawImage from '@/components/RawImage';

interface PublishedMemorialRendererProps {
  memorial: any;
  communType: CommunType;
  memorialId: string;
  currentTemplate: TemplateConfig;
  compositionModel: CompositionModelId;
  visualTheme: VisualThemeId;
  writingStyle: WritingStyleId;
  profilePhotoUrl?: string | null;
  galleryMediasWithUrls?: any[];
  audioUrl?: string | null;
  audioTitle?: string | null;
  showActions?: boolean;
  backHref?: string;
  backLabel?: string;
  onShare?: () => void;
  shareDisabled?: boolean;
  embedded?: boolean;
  showCompositionBadges?: boolean;
  editMode?: boolean;
  blockOrder?: string[];
  onBlockOrderChange?: (newOrder: string[]) => void;
  blockIcons?: Record<string, string>;
}

function BlockIconBadge({ iconName, accentColor }: { iconName?: string; accentColor: string }) {
  const IconComponent = resolveBlockIcon(iconName);
  if (!IconComponent) return null;
  const El = IconComponent as React.ElementType;
  return (
    <div
      className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-md opacity-60"
      style={{ color: accentColor }}
    >
      <El className="h-3.5 w-3.5" />
    </div>
  );
}

function SortableBlockItem({
  id,
  locked,
  children,
  accentColor,
  iconName,
}: {
  id: string;
  locked: boolean;
  children: ReactNode;
  accentColor: string;
  iconName?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: locked,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="group relative"
    >
      {!locked && (
        <button
          type="button"
          className="absolute left-2 top-3 z-10 flex h-7 w-7 cursor-grab items-center justify-center rounded-lg opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          style={{ color: accentColor, backgroundColor: `${accentColor}18` }}
          title="Glisser pour déplacer"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <BlockIconBadge iconName={iconName} accentColor={accentColor} />
      {children}
    </div>
  );
}

function InfoPill({
  children,
  accentColor,
  surfaceColor,
  textColor,
}: {
  children: ReactNode;
  accentColor: string;
  surfaceColor: string;
  textColor: string;
}) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
      style={{
        borderColor: hexToRgba(accentColor, 0.26),
        backgroundColor: surfaceColor,
        color: textColor,
      }}
    >
      {children}
    </span>
  );
}

export default function PublishedMemorialRenderer({
  memorial,
  communType,
  memorialId,
  currentTemplate,
  compositionModel,
  visualTheme,
  writingStyle,
  profilePhotoUrl,
  galleryMediasWithUrls = [],
  audioUrl,
  audioTitle,
  showActions = false,
  backHref = '/',
  backLabel = 'Retour',
  onShare,
  shareDisabled = false,
  embedded = false,
  showCompositionBadges = false,
  editMode = false,
  blockOrder,
  onBlockOrderChange,
  blockIcons = {},
}: PublishedMemorialRendererProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id || !blockOrder || !onBlockOrderChange) return;
    const oldIndex = blockOrder.indexOf(String(active.id));
    const newIndex = blockOrder.indexOf(String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      onBlockOrderChange(arrayMove(blockOrder, oldIndex, newIndex));
    }
  };
  const theme = getVisualTheme(visualTheme);
  const model = getCompositionModel(compositionModel);
  const editorialTone = getWritingStyle(writingStyle);
  const isLightBg = (() => {
    const hex = currentTemplate.colors.bg.replace('#', '');
    if (hex.length < 6) return isLightVisualTheme(visualTheme);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 >= 0.5;
  })();
  const communLabel =
    communType === 'hommage-vivant'
      ? 'Hommage vivant'
      : communType === 'transmission-familiale'
        ? 'Transmission'
        : communType === 'memoire-objet'
          ? 'Mémoire d’objet'
          : communType === 'pro-ceremonie'
            ? 'Cérémonie'
            : 'Mémorial';

  const identite = memorial?.identite || {};
  const gouts = memorial?.gouts || {};
  const family = memorial?.family || {};
  const location = memorial?.location || null;
  const liensWeb = Array.isArray(memorial?.liensWeb) ? memorial.liensWeb : [];
  const photoFilter = memorial?.photoFilter;
  const textTypography = memorial?.textTypography;
  const quoteText = memorial?.citation || gouts?.citation || gouts?.phrase || '';
  const safeText = sanitizeGeneratedText(memorial?.texteGenere || '');
  const thematicSections = buildThematicSections(memorial);
  const heroImage = profilePhotoUrl || galleryMediasWithUrls[0]?.url || '';

  const layoutWidth = embedded ? 'max-w-[1120px]' : 'max-w-[1260px]';
  const sectionSpacing = embedded ? 'space-y-8' : 'space-y-12 md:space-y-16';
  const edgePadding = embedded ? 'px-4 py-4' : 'px-4 py-10 md:px-8 md:py-14';

  const textBlock = (
    <TextBlock
      texte={safeText}
      template={currentTemplate}
      isLightBg={isLightBg}
      fontStyle={resolveTypographyPreference(textTypography)}
      thematicSections={thematicSections}
    />
  );

  const galleryBlock = (
    <GalleryBlock
      medias={galleryMediasWithUrls}
      photoFilter={photoFilter}
      template={currentTemplate}
      isLightBg={isLightBg}
      presentationMode={memorial?.medias?.presentationMode || memorial?.presentationMode}
    />
  );

  const musicBlock = (
    <GoutsBlock
      gouts={gouts}
      audioUrl={audioUrl}
      audioTitle={audioTitle || gouts?.musique}
      template={currentTemplate}
      isLightBg={isLightBg}
    />
  );

  const familyBlock = (
    <FamilyBlock
      template={currentTemplate}
      isLightBg={isLightBg}
      story={family?.story || ''}
      members={Array.isArray(family?.members) ? family.members : []}
      pdfUrl={family?.pdfUrl || ''}
      pdfName={family?.pdfName || ''}
    />
  );

  const linksBlock = <LinksBlock liens={liensWeb} template={currentTemplate} />;

  const locationBlock = (
    <LocationBlock
      template={currentTemplate}
      isLightBg={isLightBg}
      location={location}
    />
  );

  const messagesBlock = (
    <MessagesBlock
      message={memorial?.message}
      template={currentTemplate}
    />
  );

  const tributeBlock = (
    <TributeBlock
      prenom={identite?.prenom || ''}
      memorialId={memorialId}
      template={currentTemplate}
      funeraireMode={
        memorial?.tributeMode === 'candle' ||
        memorial?.tributeMode === 'flower' ||
        memorial?.tributeMode === 'none'
          ? memorial.tributeMode
          : 'both'
      }
    />
  );

  const contributeBlock = (
    <ContributeBlock
      template={currentTemplate}
      isLightBg={isLightBg}
      links={liensWeb || []}
    />
  );

  const heroShared = (
    <div className={`relative ${embedded ? 'px-4 py-6' : 'px-6 py-8 md:px-10 md:py-12'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <InfoPill
          accentColor={theme.colors.accent}
          surfaceColor={hexToRgba(theme.colors.accent, theme.id === 'night-cinematic' ? 0.18 : 0.12)}
          textColor={theme.colors.text}
        >
          {communLabel}
        </InfoPill>
        {showCompositionBadges ? (
          <InfoPill
            accentColor={theme.colors.accent}
            surfaceColor={hexToRgba(theme.colors.accent, theme.id === 'night-cinematic' ? 0.18 : 0.12)}
            textColor={theme.colors.text}
          >
            {model.label}
          </InfoPill>
        ) : null}
        {showCompositionBadges ? (
          <InfoPill
            accentColor={theme.colors.accent}
            surfaceColor={hexToRgba(theme.colors.accent, theme.id === 'night-cinematic' ? 0.12 : 0.08)}
            textColor={theme.colors.text}
          >
            {editorialTone.label}
          </InfoPill>
        ) : null}
      </div>

      <div className={`${embedded ? 'mt-6' : 'mt-10'} max-w-4xl`}>
        <h1
          className={`${embedded ? 'text-4xl' : 'text-5xl md:text-[5.25rem] lg:text-[6.4rem]'} font-serif leading-[0.92] tracking-[-0.03em]`}
          style={{ color: currentTemplate.colors.text }}
        >
          {[identite?.prenom, identite?.nom].filter(Boolean).join(' ').trim() || 'Commun Vivant'}
        </h1>

        {(identite?.dateNaissance || identite?.dateDeces) ? (
          <p
            className={`${embedded ? 'mt-3 text-sm' : 'mt-4 text-base md:text-lg'} uppercase tracking-[0.22em]`}
            style={{ color: currentTemplate.colors.accent }}
          >
            {[identite?.dateNaissance, identite?.dateDeces].filter(Boolean).join(' — ')}
          </p>
        ) : null}

        {quoteText ? (
          <p
            className={`${embedded ? 'mt-5 text-lg' : 'mt-8 text-2xl md:text-[2rem]'} max-w-3xl font-serif italic leading-[1.55]`}
            style={{ color: currentTemplate.colors.textSecondary }}
          >
            “{quoteText}”
          </p>
        ) : null}
      </div>
    </div>
  );

  const heroPortrait = (
    <section
      className="overflow-hidden rounded-[36px] border shadow-[0_24px_80px_rgba(15,23,38,0.08)]"
      style={{
        borderColor: theme.colors.border,
        background: `linear-gradient(145deg, ${hexToRgba(theme.colors.accent, theme.id === 'night-cinematic' ? 0.18 : 0.12)}, ${theme.colors.surface} 55%, ${theme.colors.bg})`,
      }}
    >
      <div className={`${embedded ? 'block' : 'grid gap-10 lg:grid-cols-[340px_minmax(0,1fr)]'} items-center`}>
        <div className={`${embedded ? 'px-4 pt-6' : 'px-6 pt-8 md:px-10 md:pt-10 lg:pb-10'}`}>
          <div
            className={`relative mx-auto overflow-hidden shadow-2xl ${
              embedded ? 'h-56 w-56 rounded-[28px]' : 'h-[320px] w-[320px] rounded-[36px]'
            }`}
            style={{
              background: `linear-gradient(160deg, ${theme.preview.from}, ${theme.preview.to})`,
              border: `1px solid ${hexToRgba(theme.colors.accent, 0.3)}`,
            }}
          >
            {heroImage ? (
              <RawImage
                src={heroImage}
                alt={[identite?.prenom, identite?.nom].filter(Boolean).join(' ').trim() || 'Portrait'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-sm uppercase tracking-[0.25em]"
                style={{ color: currentTemplate.colors.textSecondary }}
              >
                Portrait
              </div>
            )}
          </div>
        </div>
        {heroShared}
      </div>
    </section>
  );

  const heroAlbum = (
    <section
      className="relative overflow-hidden rounded-[36px] border shadow-[0_24px_80px_rgba(15,23,38,0.08)]"
      style={{
        borderColor: theme.colors.border,
        background: `linear-gradient(135deg, ${theme.preview.from}, ${theme.preview.via}, ${theme.preview.to})`,
        minHeight: embedded ? '280px' : '460px',
      }}
    >
      {/* Photo de fond si disponible */}
      {heroImage ? (
        <>
          <div className="absolute inset-0">
            <RawImage
              src={heroImage}
              alt={[identite?.prenom, identite?.nom].filter(Boolean).join(' ').trim() || 'Souvenir'}
              className="h-full w-full object-cover"
            />
          </div>
          {/* Overlay plus fort pour lisibilité */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(10,15,30,0.25) 0%, rgba(10,15,30,0.75) 60%, rgba(10,15,30,0.92) 100%)',
            }}
          />
        </>
      ) : null}

      {/* Texte en bas, toujours lisible */}
      <div className="absolute inset-0 flex items-end">
        <div
          style={{
            '--hero-text': heroImage ? '#FFFFFF' : currentTemplate.colors.text,
            '--hero-text-secondary': heroImage ? 'rgba(255,255,255,0.82)' : currentTemplate.colors.textSecondary,
            '--hero-accent': heroImage ? 'rgba(255,255,255,0.7)' : currentTemplate.colors.accent,
          } as React.CSSProperties}
          className={`w-full ${embedded ? 'px-4 py-6' : 'px-6 py-8 md:px-10 md:py-12'}`}
        >
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span
              className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{
                borderColor: heroImage ? 'rgba(255,255,255,0.3)' : hexToRgba(theme.colors.accent, 0.26),
                backgroundColor: heroImage ? 'rgba(255,255,255,0.15)' : hexToRgba(theme.colors.accent, 0.12),
                color: 'var(--hero-text)',
              }}
            >
              {communLabel}
            </span>
            {showCompositionBadges ? (
              <span
                className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{
                  borderColor: heroImage ? 'rgba(255,255,255,0.3)' : hexToRgba(theme.colors.accent, 0.26),
                  backgroundColor: heroImage ? 'rgba(255,255,255,0.15)' : hexToRgba(theme.colors.accent, 0.12),
                  color: 'var(--hero-text)',
                }}
              >
                {model.label}
              </span>
            ) : null}
            {showCompositionBadges ? (
              <span
                className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{
                  borderColor: heroImage ? 'rgba(255,255,255,0.3)' : hexToRgba(theme.colors.accent, 0.2),
                  backgroundColor: heroImage ? 'rgba(255,255,255,0.1)' : hexToRgba(theme.colors.accent, 0.08),
                  color: 'var(--hero-text)',
                }}
              >
                {editorialTone.label}
              </span>
            ) : null}
          </div>

          {/* Nom */}
          <h1
            className={`${embedded ? 'text-4xl' : 'text-5xl md:text-[5.25rem] lg:text-[6.4rem]'} font-serif leading-[0.92] tracking-[-0.03em]`}
            style={{ color: 'var(--hero-text)' }}
          >
            {[identite?.prenom, identite?.nom].filter(Boolean).join(' ').trim() || 'Commun Vivant'}
          </h1>

          {/* Dates */}
          {(identite?.dateNaissance || identite?.dateDeces) ? (
            <p
              className={`${embedded ? 'mt-3 text-sm' : 'mt-4 text-base md:text-lg'} uppercase tracking-[0.22em]`}
              style={{ color: 'var(--hero-accent)' }}
            >
              {[identite?.dateNaissance, identite?.dateDeces].filter(Boolean).join(' — ')}
            </p>
          ) : null}

          {/* Citation */}
          {quoteText ? (
            <p
              className={`${embedded ? 'mt-5 text-lg' : 'mt-8 text-2xl md:text-[2rem]'} max-w-3xl font-serif italic leading-[1.55]`}
              style={{ color: 'var(--hero-text-secondary)' }}
            >
              &ldquo;{quoteText}&rdquo;
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );

  const heroTransmission = (
    <section
      className="overflow-hidden rounded-[36px] border shadow-[0_24px_80px_rgba(15,23,38,0.08)]"
      style={{
        borderColor: theme.colors.border,
        background: `linear-gradient(140deg, ${theme.colors.surface}, ${hexToRgba(theme.colors.accent, theme.id === 'night-cinematic' ? 0.14 : 0.08)})`,
      }}
    >
      <div className={`${embedded ? 'block' : 'grid lg:grid-cols-[minmax(0,1.15fr)_380px]'} items-stretch`}>
        {heroShared}
        <div
          className={`${embedded ? 'mx-4 mb-6 h-56 rounded-[28px]' : 'm-6 rounded-[30px]'} overflow-hidden border`}
          style={{
            borderColor: hexToRgba(theme.colors.accent, 0.24),
            background: `linear-gradient(165deg, ${theme.preview.from}, ${theme.preview.to})`,
          }}
        >
          {heroImage ? (
            <RawImage
              src={heroImage}
              alt={[identite?.prenom, identite?.nom].filter(Boolean).join(' ').trim() || 'Document'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-end p-6">
              <div
                className="rounded-[24px] border px-5 py-4"
                style={{
                  borderColor: hexToRgba(theme.colors.accent, 0.22),
                  backgroundColor: hexToRgba(theme.colors.surface, 0.78),
                }}
              >
                <p className="text-xs uppercase tracking-[0.22em]" style={{ color: currentTemplate.colors.accent }}>
                  Transmission
                </p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: currentTemplate.colors.textSecondary }}>
                  Un espace pensé pour relier récit, repères et documents de famille.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const hero =
    model.id === 'memory-album'
      ? heroAlbum
      : model.id === 'heritage-transmission'
        ? heroTransmission
        : heroPortrait;

  const LOCKED_BLOCKS = ['profile', 'text'];

  const blockNodeMap: Record<string, ReactNode> = {
    profile: hero,
    text: textBlock,
    gallery: galleryBlock,
    gouts: musicBlock,
    family: familyBlock,
    links: linksBlock,
    location: locationBlock,
    messages: messagesBlock,
    candle: tributeBlock,
    contribute: contributeBlock,
  };

  const editBlocks = blockOrder ?? [];

  const editLayout = (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={sectionSpacing}>
        <div
          className="sticky top-0 z-20 flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium backdrop-blur-md"
          style={{
            borderColor: hexToRgba(currentTemplate.colors.accent, 0.25),
            backgroundColor: hexToRgba(currentTemplate.colors.bg, 0.9),
            color: currentTemplate.colors.accent,
          }}
        >
          <span className="text-base">✦</span>
          Mode édition — glissez les blocs pour réorganiser la page
        </div>

        <SortableContext items={editBlocks} strategy={verticalListSortingStrategy}>
          <div className="space-y-6">
            {editBlocks.map((blockId) => {
              const node = blockNodeMap[blockId];
              if (!node) return null;
              const locked = LOCKED_BLOCKS.includes(blockId);
              return (
                <SortableBlockItem
                  key={blockId}
                  id={blockId}
                  locked={locked}
                  accentColor={currentTemplate.colors.accent}
                  iconName={blockIcons[blockId]}
                >
                  {node}
                </SortableBlockItem>
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId && blockNodeMap[activeId] ? (
            <div className="rounded-2xl opacity-90 shadow-2xl ring-2" style={{ '--tw-ring-color': currentTemplate.colors.accent } as React.CSSProperties}>
              {blockNodeMap[activeId]}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );

  const portraitLayout = (
    <div className={sectionSpacing}>
      {hero}
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_340px]">
        <div className="space-y-8">
          {textBlock}
          {galleryBlock}
        </div>
        <aside className="space-y-6">
          {musicBlock}
          {familyBlock}
          {linksBlock}
          {locationBlock}
        </aside>
      </section>
      <section className="grid gap-8 lg:grid-cols-2">
        {messagesBlock}
        {tributeBlock}
      </section>
      {contributeBlock}
    </div>
  );

  const albumLayout = (
    <div className={sectionSpacing}>
      {hero}
      <section className="space-y-8">
        {galleryBlock}
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="space-y-8">
            {textBlock}
            {messagesBlock}
          </div>
          <aside className="space-y-6">
            {musicBlock}
            {linksBlock}
            {tributeBlock}
          </aside>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          {familyBlock}
          {contributeBlock}
        </div>
      </section>
    </div>
  );

  const transmissionLayout = (
    <div className={sectionSpacing}>
      {hero}
      <section className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-6">
          {familyBlock}
          {locationBlock}
          {linksBlock}
          {musicBlock}
        </aside>
        <div className="space-y-8">
          {textBlock}
          {galleryBlock}
          {messagesBlock}
        </div>
      </section>
      <section className="grid gap-8 lg:grid-cols-2">
        {tributeBlock}
        {contributeBlock}
      </section>
    </div>
  );

  return (
    <div className={edgePadding}>
      <div className={`relative mx-auto ${layoutWidth}`}>
        {!embedded ? (
          <div
            className="pointer-events-none absolute inset-x-12 top-10 -z-10 h-40 rounded-[48px] blur-3xl"
            style={{
              background: `linear-gradient(90deg, ${hexToRgba(theme.colors.accent, theme.id === 'night-cinematic' ? 0.18 : 0.12)}, transparent 48%, ${hexToRgba(theme.colors.accentSoft, theme.id === 'night-cinematic' ? 0.22 : 0.16)})`,
            }}
          />
        ) : null}

        {showActions ? (
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: currentTemplate.colors.accent }}
            >
              <Home className="h-4 w-4" />
              {backLabel}
            </Link>

            <button
              onClick={onShare}
              disabled={shareDisabled || !onShare}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: currentTemplate.colors.accent,
                color: theme.id === 'night-cinematic' ? '#0E1626' : '#FFFFFF',
              }}
            >
              <Share2 className="h-4 w-4" />
              {shareDisabled ? 'Partager (désactivé)' : 'Partager'}
            </button>
          </div>
        ) : null}

        {!embedded && showCompositionBadges ? (
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: currentTemplate.colors.accent }} />
            <p className="text-sm" style={{ color: currentTemplate.colors.textSecondary }}>
              {theme.badge} · {editorialTone.label}
            </p>
          </div>
        ) : null}

        {editMode
          ? editLayout
          : model.id === 'memory-album'
            ? albumLayout
            : model.id === 'heritage-transmission'
              ? transmissionLayout
              : portraitLayout}
      </div>
    </div>
  );
}
