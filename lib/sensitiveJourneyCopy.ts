import { resolveCommunTypeFromPayload } from '@/lib/almaProfiles';
import { resolveCommunTypeFromContext, type CommunType } from '@/lib/communTypes';

export interface SensitiveJourneyCopy {
  spaceLabel: string;
  paymentTypeLabel: string;
  successTitle: string;
  successLead: string;
  successBody: string;
  nextSteps: string[];
  continueToMediaLabel: string;
  continueToDraftLabel: string;
  generateTitle: string;
  generateSubtitle: string;
  generatePreparing: string;
  generateInProgress: string;
  generateFinishing: string;
  generationErrorTitle: string;
  generationErrorBody: string;
  missingDataTitle: string;
  missingDataBody: string;
  retryPaymentLabel: string;
}

const DEFAULT_COPY: SensitiveJourneyCopy = {
  spaceLabel: "espace d'hommage",
  paymentTypeLabel: 'Hommage à un proche',
  successTitle: "Votre espace d'hommage peut maintenant prendre forme",
  successLead: 'Merci pour votre confiance. Vous pouvez avancer à votre rythme, sans rien brusquer.',
  successBody:
    "Ajoutez quelques photos, une ambiance musicale si vous le souhaitez, puis relisez tranquillement la première version du texte avant publication.",
  nextSteps: [
    'Ajouter quelques photos ou souvenirs visuels',
    'Poser une ambiance sonore si cela a du sens pour vous',
    'Relire la première version du texte en toute liberté',
    'Partager le lien quand vous vous sentirez prêt(e)',
  ],
  continueToMediaLabel: 'Ajouter des photos et des repères',
  continueToDraftLabel: 'Relire ma première version',
  generateTitle: 'Préparer une première version du texte',
  generateSubtitle:
    'Nous allons rédiger une base sensible et fidèle à ce que vous avez déjà partagé. Vous pourrez ensuite tout relire et ajuster.',
  generatePreparing: 'Nous rassemblons les éléments importants...',
  generateInProgress: 'Nous rédigeons une première version avec délicatesse...',
  generateFinishing: 'Nous mettons le texte en forme pour la relecture...',
  generationErrorTitle: "Le texte n'a pas encore pu être préparé",
  generationErrorBody:
    "Rien n'est perdu. Vos réponses et vos médias sont conservés. Vous pouvez réessayer dans un instant.",
  missingDataTitle: 'Il manque encore quelques repères',
  missingDataBody:
    "Pour proposer un texte juste, nous avons besoin d'une trame issue du questionnaire ou de la conversation avec Alma.",
  retryPaymentLabel: 'Revenir au paiement',
};

const JOURNEY_COPIES: Record<CommunType, SensitiveJourneyCopy> = {
  deces: DEFAULT_COPY,
  'pro-ceremonie': {
    ...DEFAULT_COPY,
    spaceLabel: 'texte de cérémonie',
    paymentTypeLabel: 'Cérémonie professionnelle',
    successTitle: 'Votre base de cérémonie est prête à être enrichie',
    successLead: 'Vous pouvez poursuivre sereinement et ajuster ensuite le texte avec finesse.',
    continueToMediaLabel: 'Ajouter des éléments de contexte',
  },
  'hommage-vivant': {
    ...DEFAULT_COPY,
    spaceLabel: 'espace de célébration',
    paymentTypeLabel: 'Hommage vivant',
    successTitle: 'Votre hommage vivant est prêt à être enrichi',
    successLead: 'Le plus important est déjà là. Il reste à lui donner sa chaleur, son rythme et ses images.',
    successBody:
      'Ajoutez des photos, une musique ou quelques détails personnels, puis relisez le texte pour lui donner le ton juste.',
    nextSteps: [
      'Ajouter des photos qui donnent le sourire',
      'Choisir une ambiance musicale si vous en avez envie',
      'Relire le portrait et ajuster le ton',
      'Partager au moment qui vous semble juste',
    ],
    continueToMediaLabel: 'Ajouter des photos et une ambiance',
    continueToDraftLabel: 'Relire le portrait',
    generateTitle: 'Préparer un premier portrait',
    generateSubtitle:
      'Nous allons rédiger une base chaleureuse et personnalisée, fidèle à la personne que vous célébrez.',
    generateInProgress: 'Nous rédigeons un portrait vivant et nuancé...',
    generationErrorTitle: "Le portrait n'a pas encore pu être préparé",
    missingDataBody:
      "Pour écrire un portrait vivant et juste, nous avons besoin d'une trame issue du questionnaire ou de la conversation avec Alma.",
  },
  'transmission-familiale': {
    ...DEFAULT_COPY,
    spaceLabel: 'espace de transmission',
    paymentTypeLabel: 'Transmission familiale',
    successTitle: 'Votre espace de transmission est prêt à se construire',
    successLead: 'Les repères sont là. Nous pouvons maintenant les mettre en forme avec clarté et sensibilité.',
    successBody:
      'Ajoutez des photos, quelques traces importantes, puis relisez le texte pour vérifier que la transmission vous ressemble vraiment.',
    nextSteps: [
      'Ajouter des photos, archives ou objets marquants',
      'Préciser les liens, lieux ou repères utiles',
      'Relire le texte pour vérifier la fidélité de la transmission',
      'Partager plus tard avec la famille si vous le souhaitez',
    ],
    continueToMediaLabel: 'Ajouter des repères et des archives',
    continueToDraftLabel: 'Relire le récit de transmission',
    generateTitle: 'Préparer un premier récit de transmission',
    generateSubtitle:
      'Nous allons mettre en forme les éléments familiaux déjà confiés, avec un ton clair, sensible et durable.',
    generateInProgress: 'Nous relions les souvenirs, les liens et les repères...',
    generationErrorTitle: "Le récit n'a pas encore pu être préparé",
    missingDataBody:
      "Pour préparer un récit de transmission cohérent, nous avons besoin d'une base issue du questionnaire ou de la conversation avec Alma.",
  },
  'memoire-objet': {
    ...DEFAULT_COPY,
    spaceLabel: 'mémoire d’objet',
    paymentTypeLabel: "Mémoire d'objet",
    successTitle: "Votre mémoire d'objet est prête à être enrichie",
    successLead: "Le cadre est posé. Nous pouvons maintenant lui donner sa matière, son histoire et sa présence.",
    successBody:
      "Ajoutez des images, quelques détails concrets et relisez le texte pour retrouver la juste place de cet objet ou de ce lieu.",
    nextSteps: [
      "Ajouter des images de l'objet, du lieu ou de ses détails",
      'Préciser la matière, le contexte et les souvenirs associés',
      "Relire le texte pour retrouver la bonne présence de l'objet",
      'Partager quand vous sentez que le récit est prêt',
    ],
    continueToMediaLabel: 'Ajouter des images et des détails',
    continueToDraftLabel: "Relire l'histoire de l'objet",
    generateTitle: "Préparer une première histoire d'objet",
    generateSubtitle:
      "Nous allons rédiger une base concrète et sensible, en respectant la charge affective de cet objet ou de ce lieu.",
    generateInProgress: "Nous mettons en récit l'objet, sa matière et ce qu'il transmet...",
    generationErrorTitle: "L'histoire n'a pas encore pu être préparée",
    missingDataBody:
      "Pour raconter cet objet ou ce lieu avec justesse, nous avons besoin d'une base issue du questionnaire ou de la conversation avec Alma.",
  },
};

export function resolveSensitiveJourneyCopy(params: {
  context?: string | null;
  communType?: string | null;
}): SensitiveJourneyCopy {
  const resolvedCommunType = params.communType
    ? resolveCommunTypeFromPayload(params.communType)
    : resolveCommunTypeFromContext(params.context);

  return JOURNEY_COPIES[resolvedCommunType] || DEFAULT_COPY;
}
