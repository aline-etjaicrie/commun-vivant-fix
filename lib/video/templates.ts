export type VideoTemplateId = 'classique-sobre' | 'galerie-vivante' | 'cinematique-douce' | 'polaroid';

export interface VideoTemplateConfig {
  id: VideoTemplateId;
  label: string;
  photoDurationSeconds: number;
  transition: 'fade' | 'crossfade';
  transitionSeconds: number;
  maxPhotos: number;
  kenBurns: boolean;
  textMode: 'simple' | 'chapters' | 'interstitial_card';
}

export const FAMILY_VIDEO_MAX_PHOTOS = 30;

export const VIDEO_TEMPLATES: Record<VideoTemplateId, VideoTemplateConfig> = {
  'classique-sobre': {
    id: 'classique-sobre',
    label: 'Classique sobre',
    photoDurationSeconds: 3.5,
    transition: 'fade',
    transitionSeconds: 0.6,
    maxPhotos: FAMILY_VIDEO_MAX_PHOTOS,
    kenBurns: false,
    textMode: 'simple',
  },
  'galerie-vivante': {
    id: 'galerie-vivante',
    label: 'Galerie vivante',
    photoDurationSeconds: 3.0,
    transition: 'fade',
    transitionSeconds: 0.4,
    maxPhotos: FAMILY_VIDEO_MAX_PHOTOS,
    kenBurns: false,
    textMode: 'chapters',
  },
  'cinematique-douce': {
    id: 'cinematique-douce',
    label: 'Cinematique douce',
    photoDurationSeconds: 4.0,
    transition: 'crossfade',
    transitionSeconds: 0.8,
    maxPhotos: FAMILY_VIDEO_MAX_PHOTOS,
    kenBurns: true,
    textMode: 'simple',
  },
  polaroid: {
    id: 'polaroid',
    label: 'Polaroid',
    photoDurationSeconds: 4.0,
    transition: 'fade',
    transitionSeconds: 0.8,
    maxPhotos: FAMILY_VIDEO_MAX_PHOTOS,
    kenBurns: true,
    textMode: 'interstitial_card',
  },
};

export function isValidVideoTemplate(value: string): value is VideoTemplateId {
  return value in VIDEO_TEMPLATES;
}

