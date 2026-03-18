// Définition de la structure des données du questionnaire

export interface QuestionnaireData {
  // Bloc A - Repères essentiels
  identite: {
    prenom: string;
    nom?: string;
    dateNaissance?: string;
    dateDeces?: string;
    lieuNaissance?: string;
    lieuSymbolique?: string;
    pronom?: 'il' | 'elle' | 'iel' | 'prenom';
  };

  // Contexte du Commun
  context?: 'funeral' | 'living_story' | 'object_memory';
  occasion?: {
    type?: string;
    details?: string;
  };

  // Nouveau - Type d'hommage
  typeHommage?: 'personnel' | 'professionnel' | 'mixte';

  // Heritage Type
  heritageType?: 'person' | 'object';

  // Resume (En une phrase)
  resume?: string;

  // Nouveau - Lien avec la personne
  lienPersonne?: {
    type: 'pere-mere' | 'fils-fille' | 'frere-soeur' | 'conjoint' | 'ami' | 'collegue' | 'autre' | 'inconnu';
    precisionAutre?: string;
  };

  // Nouveau - Mode contributeur
  modeContributeur?: {
    mode: 'solo' | 'multi';
    quiContribue?: string[]; // Array pour checkbox multiple
    quiContribueLibre?: string; // Champ libre si "Autre"
  };

  // Bloc B - Style d'écriture
  style: 'sobre' | 'narratif' | 'poetique' | null;

  // Bloc C - Caractère
  caractere: {
    adjectifs: string[];
    autre?: string;
  };

  // Bloc D - Valeurs
  valeurs: {
    selected: string[];
    autre?: string;
  };

  // Bloc E - Liens et relations
  liens: {
    personnes: string;
    noms?: string;
  };

  // Bloc F - Talents et passions
  talents: {
    talent?: string;
    passions?: string;
  };

  // Bloc G - Réalisation / Fierté
  realisation?: string;
  fierte?: string; // Alias pour le questionnaire

  // Nouveau - Arbre Généalogique
  famille?: {
    parents?: string;
    conjoint?: string;
    enfants?: string;
  };

  // Bloc H - Goûts et signes de vie
  gouts: {
    musique?: string;
    phrase?: string;
    citation?: string; // Alias pour phrase/citation
    lieu?: string;
    habitude?: string;
    plat?: string; // Nouveau
    saison?: string;
  };

  // Bloc I - Message libre
  message: {
    hasMessage: boolean;
    type?: 'text' | 'audio' | 'video';
    content?: string;
  };
  messageLibre?: string; // Champ simple pour le questionnaire

  // Médias et liens
  photoProfil?: { photoProfilId?: string };
  musiqueAudio?: { musiqueFileId?: string };
  galerie?: string | { photos?: any[] } | any; // Flexible pour l'upload
  medias?: any[];
  liensWeb?: any[];
};

export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  nom?: string;
}

export interface Question {
  id: string;
  label: string;
  type: 'text' | 'date' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file' | 'photo' | 'gallery';
  optional?: boolean;
  options?: string[];
  placeholder?: string;
  helper?: string;
  path?: string;
}

export interface Step {
  id: string;
  title: string;
  description?: string;
  type?: 'default' | 'style-picker';
  preserveDescription?: boolean;
  questions?: Question[];
}

export const ADJECTIFS = [
  'Généreux·se',
  'Drôle',
  'Passionné·e',
  'Libre',
  'Protecteur·rice',
  'Créatif·ve',
  'Audacieux·se',
  'Calme',
  'Solaire',
  'Tendre',
  'Sportif·ve',
];

export const VALEURS = [
  'Liberté',
  'Famille',
  'Transmission',
  'Créativité',
  'Justice',
  'Loyauté',
  'Simplicité',
  'Courage',
  'Dépassement de soi',
];

export const SAISONS = [
  'Printemps',
  'Été',
  'Automne',
  'Hiver',
];

export const STYLE_EXEMPLES = [
  {
    id: 'sobre',
    titre: 'Sobre / Factuel',
    texte: 'Né en 1958, il a traversé sa vie avec discrétion et constance. Il aimait les choses simples, les liens durables, et les moments partagés sans bruit.',
  },
  {
    id: 'narratif',
    titre: 'Narratif / Humain',
    texte: 'Il aimait être entouré. Les repas qui s\'éternisent, les conversations qui comptent, et cette façon bien à lui d\'être présent sans s\'imposer.',
  },
  {
    id: 'poetique',
    titre: 'Poétique / Sensible',
    texte: 'Il avançait doucement, laissant derrière lui des gestes simples et des traces discrètes. Ce qui demeure aujourd\'hui, ce sont ces présences invisibles qui continuent de nous accompagner.',

  },
];
