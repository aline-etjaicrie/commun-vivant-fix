import { ADJECTIFS, VALEURS, type QuestionnaireData, type Step } from '@/lib/schema';

type PersonJourneyKind = 'honorer' | 'feter' | 'transmettre';

type JourneyArgs = {
  data?: Partial<QuestionnaireData>;
  onlyTeaser?: boolean;
};

type JourneyCopy = {
  identityDescription: string;
  includeOccasion: boolean;
  caractereDescription: string;
  valeursTitle: string;
  valeursDescription: string;
  messageDescription: (subjectName: string) => string;
  teaserLinksTitle: string;
  teaserLinksDescription: string;
  teaserTalentsDescription: string;
  talentsDescription: string;
  liensDescription: string;
  fierteTitle: string;
  fierteDescription: string;
  goutsTitle: string;
  goutsDescription: string;
  messageLibreTitle: string;
  messageLibreDescription: string;
  includeDateDeces: boolean;
};

const JOURNEY_COPY: Record<PersonJourneyKind, JourneyCopy> = {
  honorer: {
    identityDescription: 'Commençons par quelques repères simples sur la personne.',
    includeOccasion: false,
    caractereDescription: 'Trois mots pour dessiner sa présence et sa manière d’être.',
    valeursTitle: 'Valeurs',
    valeursDescription: 'Quelles valeurs lui tenaient le plus à cœur ?',
    messageDescription: (subjectName) => `Si vous deviez résumer ${subjectName} en une phrase, laquelle garderiez-vous ?`,
    teaserLinksTitle: 'Liens & lieux de vie',
    teaserLinksDescription: 'Les personnes et les lieux qui ont compté dans sa vie.',
    teaserTalentsDescription: 'Talents, passions et traits d’humour qui donnent du relief au portrait.',
    talentsDescription: "Qu'est-ce qui l'animait, ce qu'il ou elle aimait faire et transmettre.",
    liensDescription: 'Les personnes importantes et les lieux qui ont compté.',
    fierteTitle: 'Une fierté',
    fierteDescription: 'Quelle réalisation ou quelle trace vous semble essentielle à transmettre ?',
    goutsTitle: 'Jardin secret',
    goutsDescription: 'Les petits détails qui n’appartenaient qu’à elle ou lui.',
    messageLibreTitle: 'Message libre',
    messageLibreDescription: 'Avez-vous un dernier message à transmettre ?',
    includeDateDeces: true,
  },
  feter: {
    identityDescription: 'Identifions la personne que vous souhaitez célébrer.',
    includeOccasion: true,
    caractereDescription: 'Trois mots qui rendent cette personne vivante, singulière et joyeuse.',
    valeursTitle: 'Ce qui compte pour elle ou lui',
    valeursDescription: 'Quelles valeurs rayonnent chez cette personne aujourd’hui ?',
    messageDescription: (subjectName) => `En une phrase, pourquoi avez-vous envie de célébrer ${subjectName} ?`,
    teaserLinksTitle: 'Entourage & lieux clés',
    teaserLinksDescription: 'Les proches et les lieux qui donnent du relief à la célébration.',
    teaserTalentsDescription: 'Humour, passions et signes distinctifs qui font sourire ou émeuvent.',
    talentsDescription: 'Ce qui la ou le rend unique au quotidien : passions, humour, présence, énergie.',
    liensDescription: 'Les personnes et les lieux qui nourrissent cette célébration.',
    fierteTitle: 'Ce que vous admirez',
    fierteDescription: 'Quelle qualité, étape ou réussite mérite d’être mise en lumière ?',
    goutsTitle: 'Ses détails signatures',
    goutsDescription: 'Musiques, habitudes et préférences qui donnent un portrait vivant.',
    messageLibreTitle: 'Votre mot pour elle ou lui',
    messageLibreDescription: 'Un mot de gratitude, de fête ou de tendresse pour conclure.',
    includeDateDeces: false,
  },
  transmettre: {
    identityDescription: 'Identifions la personne et les repères qui comptent dans ce récit de transmission.',
    includeOccasion: false,
    caractereDescription: 'Trois mots pour raconter ce que cette personne transmet autour d’elle.',
    valeursTitle: 'Valeurs à transmettre',
    valeursDescription: 'Quelles valeurs mérite-t-elle de laisser en héritage ?',
    messageDescription: (subjectName) => `En une phrase, que souhaitez-vous transmettre à travers le portrait de ${subjectName} ?`,
    teaserLinksTitle: 'Repères de transmission',
    teaserLinksDescription: 'Les proches, les lieux et les repères qui traversent l’histoire familiale.',
    teaserTalentsDescription: 'Talents, gestes, habitudes et humour qui méritent de passer aux générations suivantes.',
    talentsDescription: 'Ce qu’elle ou il savait faire, raconter, transmettre ou faire aimer.',
    liensDescription: 'Les personnes, les lieux et les souvenirs qui structurent la transmission.',
    fierteTitle: 'Ce qui mérite de durer',
    fierteDescription: 'Quel héritage, quel geste ou quelle réalisation vous semble essentiel à transmettre ?',
    goutsTitle: 'Habitudes & signes de vie',
    goutsDescription: 'Les détails concrets qui donnent chair à la mémoire et à la transmission.',
    messageLibreTitle: 'Le mot à transmettre',
    messageLibreDescription: 'Avez-vous un dernier message ou un passage de relais à formuler ?',
    includeDateDeces: false,
  },
};

function buildIdentityStep(copy: JourneyCopy): Step {
  return {
    id: 'identite',
    title: 'Repères essentiels',
    description: copy.identityDescription,
    questions: [
      { id: 'prenom', label: 'Prénom', type: 'text', placeholder: 'Ex. : Jean', path: 'identite.prenom' },
      { id: 'nom', label: 'Nom (facultatif)', type: 'text', optional: true, placeholder: 'Ex. : Dupont', path: 'identite.nom' },
      { id: 'dateNaissance', label: 'Année de naissance', type: 'text', placeholder: 'Ex. : 1954', path: 'identite.dateNaissance' },
    ],
  };
}

function buildLinkStep(): Step {
  return {
    id: 'lienPersonne',
    title: 'Votre lien',
    description: 'Qui êtes-vous par rapport à cette personne ?',
    questions: [
      { id: 'type', label: 'Vous êtes…', type: 'select', options: [], path: 'lienPersonne.type' },
      { id: 'precision', label: 'Précisez (si besoin)', type: 'text', optional: true, path: 'lienPersonne.precisionAutre' },
    ],
  };
}

function buildContributorStep(): Step {
  return {
    id: 'modeContributeur',
    title: 'Participation',
    description: 'Comment souhaitez-vous construire ce portrait ?',
    questions: [
      {
        id: 'mode',
        label: 'Mode de participation',
        type: 'radio',
        options: ['Juste moi (je rédige seul·e)', "Avec d'autres personnes"],
        path: 'modeContributeur.mode',
      },
    ],
  };
}

function buildOccasionStep(): Step {
  return {
    id: 'occasion',
    title: 'Contexte de célébration',
    description: 'Pour quelle occasion créez-vous cet espace ?',
    questions: [
      {
        id: 'type',
        label: 'Occasion principale',
        type: 'radio',
        options: ['Anniversaire', 'Retraite', 'Merci / gratitude', 'Hommage surprise', 'Étape importante', 'Autre'],
        path: 'occasion.type',
      },
      {
        id: 'details',
        label: 'Précisions utiles',
        type: 'textarea',
        optional: true,
        placeholder: 'Date, intention, surprise, ambiance souhaitée...',
        path: 'occasion.details',
      },
    ],
  };
}

function buildCaractereStep(copy: JourneyCopy): Step {
  return {
    id: 'caractere',
    title: 'Trois mots',
    description: copy.caractereDescription,
    preserveDescription: true,
    questions: [
      { id: 'adjectifs', label: 'Sélectionnez 3 mots', type: 'checkbox', options: ADJECTIFS },
      { id: 'autre', label: 'Ou ajoutez un autre mot', type: 'text', optional: true, placeholder: 'Votre mot...' },
    ],
  };
}

function buildValeursStep(copy: JourneyCopy): Step {
  return {
    id: 'valeurs',
    title: copy.valeursTitle,
    description: copy.valeursDescription,
    preserveDescription: true,
    questions: [
      { id: 'selected', label: 'Sélectionnez une ou plusieurs valeurs', type: 'checkbox', options: VALEURS },
      { id: 'autre', label: 'Autre', type: 'text', optional: true, placeholder: 'Autre valeur...' },
    ],
  };
}

function buildResumeStep(copy: JourneyCopy, data: Partial<QuestionnaireData>): Step {
  const subjectName = data.identite?.prenom || 'cette personne';

  return {
    id: 'message',
    title: 'En une phrase',
    description: copy.messageDescription(subjectName),
    questions: [
      { id: 'content', label: 'Votre résumé', type: 'textarea', placeholder: '________________________________', path: 'resume' },
    ],
  };
}

function buildTeaserLinksStep(copy: JourneyCopy): Step {
  return {
    id: 'liensVie',
    title: copy.teaserLinksTitle,
    description: copy.teaserLinksDescription,
    questions: [
      { id: 'amis', label: 'Ami·e·s ou proches à citer', type: 'textarea', optional: true, placeholder: 'Prénoms, surnoms, relation...', path: 'liens.amis' },
      { id: 'personnesQuiComptent', label: 'Les personnes qui comptent', type: 'textarea', optional: true, placeholder: 'Famille choisie, mentors, voisins, collègues proches...', path: 'liens.personnesQuiComptent' },
      { id: 'lieuxDeVie', label: 'Lieux importants', type: 'textarea', optional: true, placeholder: "Ville d'enfance, maison familiale, pays, quartier...", path: 'liens.lieuxDeVie' },
    ],
  };
}

function buildTeaserTalentsStep(copy: JourneyCopy): Step {
  return {
    id: 'talents',
    title: 'Ce qui rend ce portrait vivant',
    description: copy.teaserTalentsDescription,
    preserveDescription: true,
    questions: [
      { id: 'talent', label: 'Un talent, une passion ou un goût marquant', type: 'text', optional: true, placeholder: "Ex. : le piano, le jardinage, l'accueil des autres...", path: 'talents.talent' },
      { id: 'blagues', label: 'Blagues, expressions ou traits d’humour', type: 'textarea', optional: true, placeholder: 'Une phrase drôle, une blague récurrente, un running gag...', path: 'talents.blagues' },
    ],
  };
}

function buildGalleryStep(): Step {
  return {
    id: 'galerie',
    title: 'Galerie souvenirs',
    description: 'Partagez quelques photos marquantes (max 15 pour commencer).',
    questions: [{ id: 'photos', label: 'Vos photos', type: 'file', optional: true, path: 'galerie' }],
  };
}

function buildFamilyStep(): Step {
  return {
    id: 'famille',
    title: 'Racines & famille',
    description: 'Pour situer cette personne dans son histoire familiale.',
    questions: [
      { id: 'parents', label: 'Noms des parents', type: 'text', optional: true, placeholder: 'Ex. : Marie & Pierre Dupont', path: 'famille.parents' },
      { id: 'conjoint', label: 'Conjoint(e) / partenaire', type: 'text', optional: true, placeholder: 'Ex. : Sophie', path: 'famille.conjoint' },
      { id: 'enfants', label: 'Enfants (prénoms)', type: 'textarea', optional: true, placeholder: 'Ex. : Lucas, Emma, Thomas...', path: 'famille.enfants' },
    ],
  };
}

function buildTalentsStep(copy: JourneyCopy): Step {
  return {
    id: 'talents',
    title: 'Talents & passions',
    description: copy.talentsDescription,
    preserveDescription: true,
    questions: [
      { id: 'talent', label: 'Un talent ou une passion', type: 'text', placeholder: 'Ex. : le piano, le jardinage...', path: 'talents.talent' },
      { id: 'carriere', label: 'Parcours / carrière marquante', type: 'textarea', optional: true, placeholder: 'Métiers, engagements, réalisations professionnelles...', path: 'talents.carriere' },
      { id: 'sport', label: 'Sports ou activités physiques', type: 'text', optional: true, placeholder: 'Ex. : randonnée, natation, tennis...', path: 'talents.sport' },
      { id: 'blagues', label: 'Blagues, expressions ou traits d’humour', type: 'textarea', optional: true, placeholder: 'Une phrase drôle, une blague récurrente, un running gag...', path: 'talents.blagues' },
      { id: 'detail', label: 'Quelques détails', type: 'textarea', optional: true, path: 'talents.details' },
    ],
  };
}

function buildLiensStep(copy: JourneyCopy): Step {
  return {
    id: 'liensVie',
    title: 'Liens & lieux de vie',
    description: copy.liensDescription,
    questions: [
      { id: 'amis', label: 'Ami·e·s marquant·e·s', type: 'textarea', optional: true, placeholder: 'Prénoms, surnoms, relation...', path: 'liens.amis' },
      { id: 'personnesQuiComptent', label: 'Les personnes qui comptent dans son histoire', type: 'textarea', optional: true, placeholder: 'Famille choisie, mentors, voisins, collègues proches...', path: 'liens.personnesQuiComptent' },
      { id: 'lieuxDeVie', label: 'Lieux de vie importants', type: 'textarea', optional: true, placeholder: "Ville d'enfance, maison familiale, pays, quartier...", path: 'liens.lieuxDeVie' },
      { id: 'voyages', label: 'Voyages marquants', type: 'textarea', optional: true, placeholder: 'Pays, villes, souvenirs de voyage, habitudes de déplacement...', path: 'liens.voyages' },
      { id: 'anecdotes', label: 'Anecdotes marquantes', type: 'textarea', optional: true, placeholder: 'Une scène qui vous revient, un souvenir concret, un détail vivant...', path: 'liens.anecdotes' },
    ],
  };
}

function buildFierteStep(copy: JourneyCopy): Step {
  return {
    id: 'fierte',
    title: copy.fierteTitle,
    description: copy.fierteDescription,
    questions: [{ id: 'content', label: 'Racontez-nous', type: 'textarea', placeholder: 'Ex. : avoir construit sa maison, élevé ses enfants, entrepris un voyage...', path: 'fierte' }],
  };
}

function buildGoutsStep(copy: JourneyCopy): Step {
  return {
    id: 'gouts',
    title: copy.goutsTitle,
    description: copy.goutsDescription,
    preserveDescription: true,
    questions: [
      { id: 'musique', label: 'Une musique importante ?', type: 'text', optional: true, placeholder: 'Titre ou artiste', path: 'gouts.musique' },
      { id: 'citation', label: 'Une expression ou citation favorite ?', type: 'text', optional: true, placeholder: 'Ex. : "La vie est belle"', path: 'gouts.citation' },
      { id: 'lieu', label: 'Un lieu préféré ?', type: 'text', optional: true, path: 'gouts.lieu' },
      { id: 'plat', label: 'Un plat signature ?', type: 'text', optional: true, path: 'gouts.plat' },
    ],
  };
}

function buildDateDecesStep(): Step {
  return {
    id: 'dateDecesStep',
    title: 'Une date importante',
    description: 'Pour situer cet hommage dans le temps.',
    questions: [{ id: 'dateDeces', label: 'Année de décès', type: 'text', optional: true, placeholder: 'Ex. : 2023', path: 'identite.dateDeces' }],
  };
}

function buildMessageLibreStep(copy: JourneyCopy): Step {
  return {
    id: 'messageLibre',
    title: copy.messageLibreTitle,
    description: copy.messageLibreDescription,
    questions: [{ id: 'contenu', label: 'Votre message', type: 'textarea', optional: true, placeholder: 'Écrivez librement ici...', path: 'messageLibre' }],
  };
}

function buildPersonJourneySteps(kind: PersonJourneyKind, args: JourneyArgs): Step[] {
  const data = args.data || {};
  const onlyTeaser = args.onlyTeaser || false;
  const copy = JOURNEY_COPY[kind];
  const steps: Step[] = [buildIdentityStep(copy)];

  if (!onlyTeaser) {
    steps.push(buildLinkStep(), buildContributorStep());
  }

  if (copy.includeOccasion) {
    steps.push(buildOccasionStep());
  }

  steps.push(buildCaractereStep(copy), buildValeursStep(copy), buildResumeStep(copy, data));

  if (onlyTeaser) {
    steps.push(buildTeaserLinksStep(copy), buildTeaserTalentsStep(copy));
    return steps;
  }

  steps.push(buildGalleryStep(), buildFamilyStep(), buildTalentsStep(copy), buildLiensStep(copy), buildFierteStep(copy), buildGoutsStep(copy));

  if (copy.includeDateDeces) {
    steps.push(buildDateDecesStep());
  }

  steps.push(buildMessageLibreStep(copy));

  return steps;
}

export function buildHonorerQuestionnaireSteps(args: JourneyArgs = {}): Step[] {
  return buildPersonJourneySteps('honorer', args);
}

export function buildFeterQuestionnaireSteps(args: JourneyArgs = {}): Step[] {
  return buildPersonJourneySteps('feter', args);
}

export function buildTransmettreQuestionnaireSteps(args: JourneyArgs = {}): Step[] {
  return buildPersonJourneySteps('transmettre', args);
}
