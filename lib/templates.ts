import { CommunType } from '@/lib/communTypes';

// Configuration des templates visuels

export interface TemplateConfig {
  id: string;
  name: string;
  communType?: CommunType;
  typography: 'sans-serif' | 'serif' | 'calligraphy';
  colors: {
    bg: string;
    text: string;
    accent: string;
    textSecondary: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    section: string;
    block: string;
  };
}

const legacyTemplates: TemplateConfig[] = [
  {
    id: 'bleu-dore',
    name: 'Bleu Nuit & Doré',
    typography: 'sans-serif',
    colors: { bg: '#243b55', text: '#FAFAFA', accent: '#B8936F', textSecondary: '#D1D5DB' },
    fonts: { heading: 'font-light tracking-wide', body: 'font-normal leading-relaxed' },
    spacing: { section: 'mb-20', block: 'mb-12' },
  },
  {
    id: 'sepia-terre',
    name: 'Sépia & Terre',
    typography: 'serif',
    colors: { bg: '#F5EFE6', text: '#3A2F28', accent: '#9D6B53', textSecondary: '#6B5D54' },
    fonts: { heading: 'font-light tracking-normal', body: 'font-serif leading-loose' },
    spacing: { section: 'mb-24', block: 'mb-14' },
  },
  {
    id: 'encre-manuscrit',
    name: 'Encre & Manuscrit',
    typography: 'calligraphy',
    colors: { bg: '#FFFDF7', text: '#1A1A1A', accent: '#6B6B6B', textSecondary: '#4A4A4A' },
    fonts: { heading: 'font-light italic tracking-wide', body: 'font-serif leading-loose' },
    spacing: { section: 'mb-24', block: 'mb-16' },
  },
  {
    id: 'custom',
    name: 'Personnalisé',
    typography: 'sans-serif',
    colors: { bg: '#ffffff', text: '#000000', accent: '#C9A24D', textSecondary: '#666666' },
    fonts: { heading: 'font-normal tracking-wide', body: 'font-normal leading-relaxed' },
    spacing: { section: 'mb-20', block: 'mb-12' },
  },
];

const communTemplates: TemplateConfig[] = [
  {
    id: 'deces-dignite',
    communType: 'deces',
    name: 'Dignité Classique',
    typography: 'serif',
    colors: { bg: '#F7F4EF', text: '#2D2A26', accent: '#8A6A4A', textSecondary: '#6B6158' },
    fonts: { heading: 'font-serif tracking-normal', body: 'font-serif leading-loose' },
    spacing: { section: 'mb-24', block: 'mb-14' },
  },
  {
    id: 'deces-lumiere',
    communType: 'deces',
    name: 'Lumière Douce',
    typography: 'sans-serif',
    colors: { bg: '#F0F4F7', text: '#213140', accent: '#6E8EA8', textSecondary: '#4F6476' },
    fonts: { heading: 'font-light tracking-wide', body: 'font-normal leading-relaxed' },
    spacing: { section: 'mb-20', block: 'mb-12' },
  },
  {
    id: 'deces-nocturne',
    communType: 'deces',
    name: 'Nocturne Or',
    typography: 'sans-serif',
    colors: { bg: '#1B2530', text: '#F8F5EE', accent: '#C9A46A', textSecondary: '#D3C5AE' },
    fonts: { heading: 'font-light tracking-wide', body: 'font-normal leading-relaxed' },
    spacing: { section: 'mb-20', block: 'mb-12' },
  },
  {
    id: 'vivant-festif',
    communType: 'hommage-vivant',
    name: 'Festif Clair',
    typography: 'serif',
    colors: { bg: '#F6F8FB', text: '#12263A', accent: '#EE135D', textSecondary: '#4E6378' },
    fonts: { heading: 'font-serif italic font-bold tracking-tight', body: 'font-normal leading-relaxed' },
    spacing: { section: 'mb-20', block: 'mb-12' },
  },
  {
    id: 'vivant-pop',
    communType: 'hommage-vivant',
    name: 'Pop Souvenir',
    typography: 'sans-serif',
    colors: { bg: '#F4FBFF', text: '#1A2E3F', accent: '#2DA4D7', textSecondary: '#4E7087' },
    fonts: { heading: 'font-bold tracking-tight', body: 'font-normal leading-relaxed' },
    spacing: { section: 'mb-20', block: 'mb-12' },
  },
  {
    id: 'vivant-carnet',
    communType: 'hommage-vivant',
    name: 'Carnet Chaleureux',
    typography: 'calligraphy',
    colors: { bg: '#FFFDF8', text: '#3A2E22', accent: '#D27E56', textSecondary: '#7A6658' },
    fonts: { heading: 'font-light italic tracking-wide', body: 'font-serif leading-loose' },
    spacing: { section: 'mb-22', block: 'mb-14' },
  },
  {
    id: 'transmission-archive',
    communType: 'transmission-familiale',
    name: 'Archive Familiale',
    typography: 'serif',
    colors: { bg: '#F5F3EF', text: '#1F2B35', accent: '#C9A24D', textSecondary: '#5E6B78' },
    fonts: { heading: 'font-serif italic tracking-normal', body: 'font-serif leading-loose' },
    spacing: { section: 'mb-24', block: 'mb-14' },
  },
  {
    id: 'transmission-lignee',
    communType: 'transmission-familiale',
    name: 'Lignée Moderne',
    typography: 'sans-serif',
    colors: { bg: '#EEF3F5', text: '#1E3138', accent: '#5C8A91', textSecondary: '#567178' },
    fonts: { heading: 'font-light tracking-wide', body: 'font-normal leading-relaxed' },
    spacing: { section: 'mb-20', block: 'mb-12' },
  },
  {
    id: 'transmission-manuscrit',
    communType: 'transmission-familiale',
    name: 'Manuscrit Héritage',
    typography: 'calligraphy',
    colors: { bg: '#FFFDF7', text: '#2A2520', accent: '#A17852', textSecondary: '#706152' },
    fonts: { heading: 'font-light italic tracking-wide', body: 'font-serif leading-loose' },
    spacing: { section: 'mb-24', block: 'mb-16' },
  },
  {
    id: 'objet-musee',
    communType: 'memoire-objet',
    name: 'Musée Sobre',
    typography: 'sans-serif',
    colors: { bg: '#F3F3F1', text: '#222421', accent: '#6F7B66', textSecondary: '#596254' },
    fonts: { heading: 'font-semibold tracking-normal', body: 'font-normal leading-relaxed' },
    spacing: { section: 'mb-20', block: 'mb-12' },
  },
  {
    id: 'objet-atelier',
    communType: 'memoire-objet',
    name: 'Atelier Matière',
    typography: 'serif',
    colors: { bg: '#F8F1E6', text: '#342A23', accent: '#AE7C4D', textSecondary: '#735B4A' },
    fonts: { heading: 'font-serif tracking-normal', body: 'font-serif leading-loose' },
    spacing: { section: 'mb-24', block: 'mb-14' },
  },
  {
    id: 'objet-epure',
    communType: 'memoire-objet',
    name: 'Épure Patrimoine',
    typography: 'sans-serif',
    colors: { bg: '#FAFAFA', text: '#1F2630', accent: '#4F7A9A', textSecondary: '#5E7388' },
    fonts: { heading: 'font-light tracking-wide', body: 'font-normal leading-relaxed' },
    spacing: { section: 'mb-20', block: 'mb-12' },
  },
  {
    id: 'pro-lectern',
    communType: 'pro-ceremonie',
    name: 'Pupitre Classique',
    typography: 'serif',
    colors: { bg: '#FFFFFF', text: '#1D2329', accent: '#425A70', textSecondary: '#596B7A' },
    fonts: { heading: 'font-serif tracking-normal', body: 'font-serif leading-loose' },
    spacing: { section: 'mb-20', block: 'mb-12' },
  },
  {
    id: 'pro-ceremonial',
    communType: 'pro-ceremonie',
    name: 'Cérémonial Neutre',
    typography: 'sans-serif',
    colors: { bg: '#F7F9FB', text: '#1F2B35', accent: '#5F7487', textSecondary: '#6E7D89' },
    fonts: { heading: 'font-semibold tracking-normal', body: 'font-normal leading-relaxed' },
    spacing: { section: 'mb-20', block: 'mb-12' },
  },
  {
    id: 'pro-sobre',
    communType: 'pro-ceremonie',
    name: 'Sobre Lecture',
    typography: 'sans-serif',
    colors: { bg: '#FDFDFD', text: '#222222', accent: '#7B7B7B', textSecondary: '#5A5A5A' },
    fonts: { heading: 'font-medium tracking-normal', body: 'font-normal leading-relaxed' },
    spacing: { section: 'mb-20', block: 'mb-12' },
  },
];

export const TEMPLATES: TemplateConfig[] = [...communTemplates, ...legacyTemplates];

export function getTemplatesForCommunType(communType: CommunType): TemplateConfig[] {
  const scoped = communTemplates.filter((t) => t.communType === communType);
  const custom = legacyTemplates.find((t) => t.id === 'custom');
  return custom ? [...scoped.slice(0, 3), custom] : scoped.slice(0, 3);
}

export function getTemplate(id: string, customColors?: TemplateConfig['colors']): TemplateConfig {
  const base = TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
  if (id === 'custom' && customColors) {
    return { ...base, colors: customColors };
  }
  return base;
}
