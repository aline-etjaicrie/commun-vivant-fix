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
    identityDescription: 'Identifions la personne et les reperes qui aideront a raconter sa vie.',
    includeOccasion: false,
    caractereDescription: 'Trois mots pour dessiner sa presence et sa maniere d etre.',
    valeursTitle: 'Valeurs',
    valeursDescription: 'Quelles valeurs lui tenaient le plus a coeur ?',
    messageDescription: (subjectName) => `Si vous deviez resumer ${subjectName} en une phrase, laquelle garderiez-vous ?`,
    teaserLinksTitle: 'Liens & lieux de vie',
    teaserLinksDescription: 'Les personnes et les lieux qui ont compte dans sa vie.',
    teaserTalentsDescription: 'Talents, passions et traits d humour qui donnent du relief au portrait.',
    talentsDescription: "Qu'est-ce qui l'animait, ce qu'il ou elle aimait faire et transmettre.",
    liensDescription: 'Les personnes importantes et les lieux qui ont compte.',
    fierteTitle: 'Une fierte',
    fierteDescription: 'Quelle realisation ou quelle trace vous semble essentielle a transmettre ?',
    goutsTitle: 'Jardin secret',
    goutsDescription: 'Les petits details qui n appartenaient qu a elle ou lui.',
    messageLibreTitle: 'Message libre',
    messageLibreDescription: 'Avez-vous un dernier message a transmettre ?',
    includeDateDeces: true,
  },
  feter: {
    identityDescription: 'Identifions la personne que vous souhaitez celebrer.',
    includeOccasion: true,
    caractereDescription: 'Trois mots qui rendent cette personne vivante, singuliere et joyeuse.',
    valeursTitle: 'Ce qui compte pour elle ou lui',
    valeursDescription: 'Quelles valeurs rayonnent chez cette personne aujourd hui ?',
    messageDescription: (subjectName) => `En une phrase, pourquoi avez-vous envie de celebrer ${subjectName} ?`,
    teaserLinksTitle: 'Entourage & lieux cles',
    teaserLinksDescription: 'Les proches et les lieux qui donnent du relief a la celebration.',
    teaserTalentsDescription: 'Humour, passions et signes distinctifs qui font sourire ou emeuvent.',
    talentsDescription: 'Ce qui la ou le rend unique au quotidien : passions, humour, presence, energie.',
    liensDescription: 'Les personnes et les lieux qui nourrissent cette celebration.',
    fierteTitle: 'Ce que vous admirez',
    fierteDescription: 'Quelle qualite, etape ou reussite merite d etre mise en lumiere ?',
    goutsTitle: 'Ses details signatures',
    goutsDescription: 'Musiques, habitudes et preferences qui donnent un portrait vivant.',
    messageLibreTitle: 'Votre mot pour elle ou lui',
    messageLibreDescription: 'Un mot de gratitude, de fete ou de tendresse pour conclure.',
    includeDateDeces: false,
  },
  transmettre: {
    identityDescription: 'Identifions la personne et les reperes qui comptent dans ce recit de transmission.',
    includeOccasion: false,
    caractereDescription: 'Trois mots pour raconter ce que cette personne transmet autour d elle.',
    valeursTitle: 'Valeurs a transmettre',
    valeursDescription: 'Quelles valeurs merite-t-elle de laisser en heritage ?',
    messageDescription: (subjectName) => `En une phrase, que souhaitez-vous transmettre a travers le portrait de ${subjectName} ?`,
    teaserLinksTitle: 'Reperes de transmission',
    teaserLinksDescription: 'Les proches, les lieux et les reperes qui traversent l histoire familiale.',
    teaserTalentsDescription: 'Talents, gestes, habitudes et humour qui meritent de passer aux generations suivantes.',
    talentsDescription: 'Ce qu elle ou il savait faire, raconter, transmettre ou faire aimer.',
    liensDescription: 'Les personnes, les lieux et les souvenirs qui structurent la transmission.',
    fierteTitle: 'Ce qui merite de durer',
    fierteDescription: 'Quel heritage, quel geste ou quelle realisation vous semble essentiel a transmettre ?',
    goutsTitle: 'Habitudes & signes de vie',
    goutsDescription: 'Les details concrets qui donnent chair a la memoire et a la transmission.',
    messageLibreTitle: 'Le mot a transmettre',
    messageLibreDescription: 'Avez-vous un dernier message ou un passage de relai a formuler ?',
    includeDateDeces: false,
  },
};

function buildIdentityStep(copy: JourneyCopy): Step {
  return {
    id: 'identite',
    title: 'Reperes essentiels',
    description: copy.identityDescription,
    questions: [
      { id: 'prenom', label: 'Prenom', type: 'text', placeholder: 'Ex: Jean', path: 'identite.prenom' },
      { id: 'nom', label: 'Nom', type: 'text', optional: true, placeholder: 'Ex: Dupont', path: 'identite.nom' },
      { id: 'dateNaissance', label: 'Annee de naissance', type: 'text', placeholder: 'Ex: 1954', path: 'identite.dateNaissance' },
    ],
  };
}

function buildLinkStep(): Step {
  return {
    id: 'lienPersonne',
    title: 'Votre lien',
    description: 'Qui etes-vous par rapport a cette personne ?',
    questions: [
      { id: 'type', label: 'Vous etes...', type: 'select', options: [], path: 'lienPersonne.type' },
      { id: 'precision', label: 'Precisez (si besoin)', type: 'text', optional: true, path: 'lienPersonne.precisionAutre' },
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
        options: ['Juste moi (je redige seul·e)', "Avec d'autres personnes"],
        path: 'modeContributeur.mode',
      },
    ],
  };
}

function buildOccasionStep(): Step {
  return {
    id: 'occasion',
    title: 'Contexte de celebration',
    description: 'Pour quelle occasion creez-vous cet espace ?',
    questions: [
      {
        id: 'type',
        label: 'Occasion principale',
        type: 'radio',
        options: ['Anniversaire', 'Retraite', 'Merci / gratitude', 'Hommage surprise', 'Etape importante', 'Autre'],
        path: 'occasion.type',
      },
      {
        id: 'details',
        label: 'Precisions utiles',
        type: 'textarea',
        optional: true,
        placeholder: 'Date, intention, surprise, ambiance souhaitee...',
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
      { id: 'adjectifs', label: 'Selectionnez 3 mots', type: 'checkbox', options: ADJECTIFS },
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
      { id: 'selected', label: 'Selectionnez une ou plusieurs valeurs', type: 'checkbox', options: VALEURS },
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
      { id: 'content', label: 'Votre resume', type: 'textarea', placeholder: '________________________________', path: 'resume' },
    ],
  };
}

function buildTeaserLinksStep(copy: JourneyCopy): Step {
  return {
    id: 'liensVie',
    title: copy.teaserLinksTitle,
    description: copy.teaserLinksDescription,
    questions: [
      { id: 'amis', label: 'Ami·e·s ou proches a citer', type: 'textarea', optional: true, placeholder: 'Prenoms, surnoms, relation...', path: 'liens.amis' },
      { id: 'personnesQuiComptent', label: 'Les personnes qui comptent', type: 'textarea', optional: true, placeholder: 'Famille choisie, mentors, voisins, collegues proches...', path: 'liens.personnesQuiComptent' },
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
      { id: 'talent', label: 'Un talent, une passion ou un gout marquant', type: 'text', optional: true, placeholder: "Ex: le piano, le jardinage, l'accueil des autres...", path: 'talents.talent' },
      { id: 'blagues', label: 'Blagues, expressions ou traits d humour', type: 'textarea', optional: true, placeholder: 'Une phrase drole, une blague recurrente, un running gag...', path: 'talents.blagues' },
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
      { id: 'parents', label: 'Noms des parents', type: 'text', optional: true, placeholder: 'Ex: Marie & Pierre Dupont', path: 'famille.parents' },
      { id: 'conjoint', label: 'Conjoint(e) / Partenaire', type: 'text', optional: true, placeholder: 'Ex: Sophie', path: 'famille.conjoint' },
      { id: 'enfants', label: 'Enfants (prenoms)', type: 'textarea', optional: true, placeholder: 'Ex: Lucas, Emma, Thomas...', path: 'famille.enfants' },
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
      { id: 'talent', label: 'Un talent ou une passion', type: 'text', placeholder: 'Ex: Le piano, le jardinage...', path: 'talents.talent' },
      { id: 'carriere', label: 'Parcours / carriere marquante', type: 'textarea', optional: true, placeholder: 'Metiers, engagements, realisations professionnelles...', path: 'talents.carriere' },
      { id: 'sport', label: 'Sports ou activites physiques', type: 'text', optional: true, placeholder: 'Ex: randonnee, natation, tennis...', path: 'talents.sport' },
      { id: 'blagues', label: 'Blagues, expressions ou traits d humour', type: 'textarea', optional: true, placeholder: 'Une phrase drole, une blague recurrente, un running gag...', path: 'talents.blagues' },
      { id: 'detail', label: 'Quelques details', type: 'textarea', optional: true, path: 'talents.details' },
    ],
  };
}

function buildLiensStep(copy: JourneyCopy): Step {
  return {
    id: 'liensVie',
    title: 'Liens & lieux de vie',
    description: copy.liensDescription,
    questions: [
      { id: 'amis', label: 'Ami·e·s marquant·e·s', type: 'textarea', optional: true, placeholder: 'Prenoms, surnoms, relation...', path: 'liens.amis' },
      { id: 'personnesQuiComptent', label: 'Les personnes qui comptent dans son histoire', type: 'textarea', optional: true, placeholder: 'Famille choisie, mentors, voisins, collegues proches...', path: 'liens.personnesQuiComptent' },
      { id: 'lieuxDeVie', label: 'Lieux de vie importants', type: 'textarea', optional: true, placeholder: "Ville d'enfance, maison familiale, pays, quartier...", path: 'liens.lieuxDeVie' },
      { id: 'voyages', label: 'Voyages marquants', type: 'textarea', optional: true, placeholder: 'Pays, villes, souvenirs de voyage, habitudes de deplacement...', path: 'liens.voyages' },
      { id: 'anecdotes', label: 'Anecdotes marquantes', type: 'textarea', optional: true, placeholder: 'Une scene qui vous revient, un souvenir concret, un detail vivant...', path: 'liens.anecdotes' },
    ],
  };
}

function buildFierteStep(copy: JourneyCopy): Step {
  return {
    id: 'fierte',
    title: copy.fierteTitle,
    description: copy.fierteDescription,
    questions: [{ id: 'content', label: 'Racontez-nous', type: 'textarea', placeholder: 'Ex: Avoir construit sa maison, ses enfants, un voyage...', path: 'fierte' }],
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
      { id: 'citation', label: 'Une expression ou citation favorite ?', type: 'text', optional: true, placeholder: 'Ex: "La vie est belle"', path: 'gouts.citation' },
      { id: 'lieu', label: 'Un lieu prefere ?', type: 'text', optional: true, path: 'gouts.lieu' },
      { id: 'plat', label: 'Un plat signature ?', type: 'text', optional: true, path: 'gouts.plat' },
    ],
  };
}

function buildDateDecesStep(): Step {
  return {
    id: 'dateDecesStep',
    title: 'Une date importante',
    description: 'Pour situer cet hommage dans le temps.',
    questions: [{ id: 'dateDeces', label: 'Annee de deces', type: 'text', optional: true, placeholder: 'Ex: 2023', path: 'identite.dateDeces' }],
  };
}

function buildMessageLibreStep(copy: JourneyCopy): Step {
  return {
    id: 'messageLibre',
    title: copy.messageLibreTitle,
    description: copy.messageLibreDescription,
    questions: [{ id: 'contenu', label: 'Votre message', type: 'textarea', optional: true, placeholder: 'Ecrivez librement ici...', path: 'messageLibre' }],
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
