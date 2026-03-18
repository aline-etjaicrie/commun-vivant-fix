import { Step, ADJECTIFS, VALEURS, STYLE_EXEMPLES } from '@/lib/schema';
import { QuestionnaireData } from '@/lib/schema';
import { resolveCommunTypeFromPayload } from '@/lib/almaProfiles';
import { resolveCommunTypeFromContext } from '@/lib/communTypes';
import {
  buildFeterQuestionnaireSteps,
  buildHonorerQuestionnaireSteps,
  buildTransmettreQuestionnaireSteps,
} from '@/lib/questionnaireJourneys';

export const getSteps = (
  contextStr: string,
  data: Partial<QuestionnaireData> = {},
  onlyTeaser: boolean = false,
  communType?: string
): Step[] => {
  const steps: Step[] = [];
  const resolvedCommunType = communType
    ? resolveCommunTypeFromPayload(communType)
    : resolveCommunTypeFromContext(contextStr);

  if (resolvedCommunType === 'deces') {
    return buildHonorerQuestionnaireSteps({ data, onlyTeaser });
  }

  if (resolvedCommunType === 'hommage-vivant') {
    return buildFeterQuestionnaireSteps({ data, onlyTeaser });
  }

  if (resolvedCommunType === 'transmission-familiale') {
    return buildTransmettreQuestionnaireSteps({ data, onlyTeaser });
  }

  const isProCeremony = resolvedCommunType === 'pro-ceremonie';
  // Source unique de verite: le type choisi en entree de parcours.
  // On ne re-demande pas le "type de commun" dans le questionnaire.
  const isCelebrationContext = contextStr === 'celebration' || contextStr === 'living_story' || contextStr === 'feter';
  const isObjectContext = contextStr === 'object_memory' || contextStr === 'heritage' || contextStr === 'transmettre';

  const isObject = resolvedCommunType === 'memoire-objet' || (!communType && isObjectContext);
  const isLiving = !communType && isCelebrationContext;
  const isPerson = !isObject;

  // STEP 1: Contextualisation
  if (isProCeremony) {
    steps.push({
      id: 'ceremonyContext',
      title: 'Contexte de cérémonie',
      description: 'Cadrez rapidement les paramètres utiles pour votre texte de cérémonie.',
      questions: [
        {
          id: 'type',
          label: 'Type de cérémonie',
          type: 'radio',
          options: [
            'Cérémonie religieuse',
            'Cérémonie civile',
            'Hommage en salon',
            'Commémoration',
          ],
          path: 'ceremonyContext.type',
        },
        {
          id: 'duree',
          label: 'Durée cible du texte (minutes)',
          type: 'text',
          placeholder: 'Ex: 5 à 7',
          path: 'ceremonyContext.duration',
        }
      ]
    });
  }

  // STEP 2: Repères essentiels
  steps.push({
    id: 'identite',
    title: isProCeremony ? 'Repères du défunt' : 'Repères essentiels',
    description: isProCeremony
      ? 'Informations validées avec la famille pour rédiger un texte juste.'
      : (isObject ? 'Identifions cet objet ou ce lieu.' : 'Identifions la personne.'),
    questions: [
      // Person Fields
      ...(isPerson ? [
        {
          id: 'prenom',
          label: isProCeremony ? 'Prénom du défunt' : 'Prénom',
          type: 'text',
          placeholder: 'Ex: Jean',
          path: 'identite.prenom',
        },
        {
          id: 'nom',
          label: 'Nom',
          type: 'text',
          optional: true,
          placeholder: 'Ex: Dupont',
          path: 'identite.nom',
        },
        {
          id: 'dateNaissance',
          label: 'Année de naissance',
          type: 'text',
          placeholder: 'Ex: 1954',
          path: 'identite.dateNaissance',
        },
      ] : []),

      // Object Fields
      ...(isObject ? [
        {
          id: 'prenom', // Reuse 'prenom' for Name
          label: 'Nom de l\'objet ou du lieu',
          type: 'text',
          placeholder: 'Ex: La montre de Grand-Père',
        },
        {
          id: 'dateNaissance', // Start date
          label: 'Depuis quand est-il dans la famille ?',
          type: 'text',
          placeholder: 'Ex: 1920, ou "depuis toujours"',
        }
      ] : []),

      /* Conditional Death Date removed from here */
    ].map(q => ({ ...q, type: q.type as any }))
  });

  // STEP: Lien avec la personne (SKIPPED IN TEASER)
  if (isPerson && !onlyTeaser && !isProCeremony) {
    steps.push({
      id: 'lienPersonne',
      title: 'Votre lien',
      description: 'Qui êtes-vous par rapport à cette personne ?',
      questions: [
        {
          id: 'type',
          label: 'Vous êtes...',
          type: 'select',
          options: [],
          path: 'lienPersonne.type'
        },
        {
          id: 'precision',
          label: 'Précisez (si besoin)',
          type: 'text',
          optional: true,
          path: 'lienPersonne.precisionAutre'
        }
      ]
    });
  }

  // STEP: Mode contributeur (SKIPPED IN TEASER)
  if (!isObject && !onlyTeaser && !isProCeremony) {
    steps.push({
      id: 'modeContributeur',
      title: 'Participation',
      description: 'Comment souhaitez-vous construire ce mémorial ?',
      questions: [
        {
          id: 'mode',
          label: 'Mode de participation',
          type: 'radio',
          options: ['Juste moi (je rédige seul·e)', 'Avec d\'autres personnes'],
          path: 'modeContributeur.mode'
        }
      ]
    });
  }

  if (isLiving && isPerson && !isProCeremony) {
    steps.push({
      id: 'occasion',
      title: 'Contexte de célébration',
      description: 'Pour quelle occasion créez-vous cet espace ?',
      questions: [
        {
          id: 'type',
          label: 'Occasion principale',
          type: 'radio',
          options: [
            'Anniversaire',
            'Retraite',
            'Merci / gratitude',
            'Hommage surprise',
            'Étape importante',
            'Autre',
          ],
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
    });
  }

  // STEP 3: Trois mots
  steps.push({
    id: 'caractere',
    title: isProCeremony ? 'Trois traits majeurs' : 'Trois mots',
    description: isProCeremony
      ? 'Trois traits à faire entendre dans la cérémonie.'
      : (isObject ? 'Choisissez 3 mots qui définissent cet objet.' : 'Choisissez 3 mots pour le/la décrire.'),
    questions: [
      {
        id: 'adjectifs',
        label: 'Sélectionnez 3 mots',
        type: 'checkbox',
        options: ADJECTIFS,
      },
      {
        id: 'autre',
        label: 'Ou ajoutez un autre mot',
        type: 'text',
        optional: true,
        placeholder: 'Votre mot...',
      }
    ]
  });

  // STEP 5: Une valeur
  steps.push({
    id: 'valeurs',
    title: isProCeremony ? 'Valeurs à transmettre' : 'Une valeur',
    description: isProCeremony
      ? 'Quels messages doivent ressortir clairement pendant la cérémonie ?'
      : (isObject ? 'Quelle valeur cet objet représente-t-il ?' : `Quelle valeur lui ${isLiving ? 'tient' : 'tenait'} le plus à cœur ?`),
    questions: [
      {
        id: 'selected',
        label: 'Sélectionnez une ou plusieurs valeurs',
        type: 'checkbox', // The prompt implies single selection (radio circles) but checkbox is safer for hesitation. Let's keep checkbox or switch to radio if strict.
        options: VALEURS,
      },
      {
        id: 'autre',
        label: 'Autre',
        type: 'text',
        optional: true,
        placeholder: 'Autre valeur...',
      }
    ]
  });

  // STEP 6 (Final Teaser Step): En une phrase
  steps.push({
    id: 'message',
    title: isProCeremony ? 'Noyau de cérémonie' : 'En une phrase',
    description: isProCeremony
      ? 'En une phrase, quel souvenir ou quel message doit absolument être entendu ?'
      : (isObject ? 'Pourquoi cet objet est-il important pour vous ?' : (isPerson ? `Si vous deviez résumer ${data.identite?.prenom || 'cette personne'} en une phrase ?` : 'Votre résumé')),
    questions: [
      {
        id: 'content',
        label: 'Votre résumé',
        type: 'textarea',
        placeholder: '________________________________',
        path: 'resume'
      }
    ]
  });

  if (onlyTeaser) {
    if (isPerson && !isProCeremony) {
      steps.push({
        id: 'liensVie',
        title: isLiving ? 'Entourage & lieux clés' : 'Liens & lieux de vie',
        description: isLiving
          ? 'Quelques repères concrets pour personnaliser l’hommage.'
          : 'Les personnes importantes et les lieux qui ont compté.',
        questions: [
          {
            id: 'amis',
            label: isLiving ? 'Ami·e·s ou proches à citer' : 'Ami·e·s marquant·e·s',
            type: 'textarea',
            optional: true,
            placeholder: 'Prénoms, surnoms, relation...',
            path: 'liens.amis'
          },
          {
            id: 'personnesQuiComptent',
            label: 'Les personnes qui comptent',
            type: 'textarea',
            optional: true,
            placeholder: 'Famille choisie, mentors, voisins, collègues proches...',
            path: 'liens.personnesQuiComptent'
          },
          {
            id: 'lieuxDeVie',
            label: isLiving ? 'Lieux qui comptent aujourd’hui' : 'Lieux de vie importants',
            type: 'textarea',
            optional: true,
            placeholder: 'Ville d’enfance, maison familiale, pays, quartier...',
            path: 'liens.lieuxDeVie'
          }
        ]
      });

      steps.push({
        id: 'talents',
        title: isLiving ? 'Ce qui la/le rend unique' : 'Talents & Passions',
        description: isLiving
          ? 'Humour, passions et petits signes qui donnent du relief au portrait.'
          : `Qu'est-ce qui l'${isLiving ? 'anime' : 'animait'} au quotidien ?`,
        questions: [
          {
            id: 'talent',
            label: 'Un talent, une passion ou un goût marquant',
            type: 'text',
            optional: true,
            placeholder: 'Ex: le piano, le jardinage, l’accueil des autres...',
            path: 'talents.talent'
          },
          {
            id: 'blagues',
            label: 'Blagues, expressions ou traits d’humour',
            type: 'textarea',
            optional: true,
            placeholder: 'Une phrase drôle, une blague récurrente, un running gag...',
            path: 'talents.blagues'
          }
        ]
      });
    }
    return steps;
  }

  // --- PREMIUM STEPS (Post-Paiement) ---

  // STEP 7: Galerie Photos
  if (!isProCeremony) {
    steps.push({
      id: 'galerie',
      title: 'Galerie Souvenirs',
      description: 'Partagez quelques photos marquantes (max 15 pour commencer).',
      questions: [
        {
          id: 'photos',
          label: 'Vos photos',
          type: 'file', // Assuming 'file' type is handled or will be
          optional: true,
          path: 'galerie'
        }
      ]
    });
  }

  // STEP 8: Arbre Généalogique (Famille)
  if (isPerson && !isProCeremony) {
    steps.push({
      id: 'famille',
      title: 'Racines & Famille',
      description: 'Pour situer cette personne dans son histoire familiale.',
      questions: [
        {
          id: 'parents',
          label: 'Noms des parents',
          type: 'text',
          optional: true,
          placeholder: 'Ex: Marie & Pierre Dupont',
          path: 'famille.parents'
        },
        {
          id: 'conjoint',
          label: 'Conjoint(e) / Partenaire',
          type: 'text',
          optional: true,
          placeholder: 'Ex: Sophie',
          path: 'famille.conjoint'
        },
        {
          id: 'enfants',
          label: 'Enfants (prénoms)',
          type: 'textarea',
          optional: true,
          placeholder: 'Ex: Lucas, Emma, Thomas...',
          path: 'famille.enfants'
        }
      ]
    });
  }

  // STEP 9: Talents & Passions
  steps.push({
    id: 'talents',
    title: 'Talents & Passions',
    description: isObject ? 'A quoi cet objet servait-il ?' : `Qu'est-ce qui l'${isLiving ? 'anime' : 'animait'} au quotidien ?`,
    questions: [
      {
        id: 'talent',
        label: isObject ? 'Usage principal' : 'Un talent ou une passion ?',
        type: 'text',
        placeholder: isObject ? 'Ex: Coudre, écrire...' : 'Ex: Le piano, le jardinage...',
        path: 'talents.talent'
      },
      {
        id: 'carriere',
        label: 'Parcours / carrière marquante',
        type: 'textarea',
        optional: true,
        placeholder: 'Métiers, engagements, réalisations professionnelles...',
        path: 'talents.carriere'
      },
      {
        id: 'sport',
        label: 'Sports ou activités physiques',
        type: 'text',
        optional: true,
        placeholder: 'Ex: randonnée, natation, tennis...',
        path: 'talents.sport'
      },
      {
        id: 'blagues',
        label: 'Blagues, expressions ou traits d’humour',
        type: 'textarea',
        optional: true,
        placeholder: 'Une phrase drôle, une blague récurrente, un running gag...',
        path: 'talents.blagues'
      },
      {
        id: 'detail',
        label: 'Quelques détails',
        type: 'textarea',
        optional: true,
        path: 'talents.details'
      }
    ]
  });

  if (isPerson && !isProCeremony) {
    steps.push({
      id: 'liensVie',
      title: 'Liens & lieux de vie',
      description: 'Les personnes importantes et les lieux qui ont compté.',
      questions: [
        {
          id: 'amis',
          label: 'Ami·e·s marquant·e·s',
          type: 'textarea',
          optional: true,
          placeholder: 'Prénoms, surnoms, relation...',
          path: 'liens.amis'
        },
        {
          id: 'personnesQuiComptent',
          label: 'Les personnes qui comptent dans son histoire',
          type: 'textarea',
          optional: true,
          placeholder: 'Famille choisie, mentors, voisins, collegues proches...',
          path: 'liens.personnesQuiComptent'
        },
        {
          id: 'lieuxDeVie',
          label: 'Lieux de vie importants',
          type: 'textarea',
          optional: true,
          placeholder: 'Ville d’enfance, maison familiale, pays, quartier...',
          path: 'liens.lieuxDeVie'
        },
        {
          id: 'voyages',
          label: 'Voyages marquants',
          type: 'textarea',
          optional: true,
          placeholder: 'Pays, villes, souvenirs de voyage, habitudes de deplacement...',
          path: 'liens.voyages'
        },
        {
          id: 'anecdotes',
          label: 'Anecdotes marquantes',
          type: 'textarea',
          optional: true,
          placeholder: 'Une scène qui vous revient, un souvenir concret, un détail vivant...',
          path: 'liens.anecdotes'
        }
      ]
    });
  }

  if (isProCeremony) {
    steps.push({
      id: 'contraintesCeremonie',
      title: 'Contraintes de lecture',
      description: 'Aide-mémoire pratique pour la personne qui prononcera le texte.',
      questions: [
        {
          id: 'speaker',
          label: 'Qui lira le texte ?',
          type: 'text',
          optional: true,
          placeholder: 'Ex: maître de cérémonie, proche, officiant',
          path: 'ceremonyContext.speaker'
        },
        {
          id: 'mustAvoid',
          label: 'Éléments à éviter',
          type: 'textarea',
          optional: true,
          placeholder: 'Mots, épisodes, sujets sensibles...',
          path: 'ceremonyContext.mustAvoid'
        }
      ]
    });
  }

  // STEP 10: Une Fierté / Réalisation
  steps.push({
    id: 'fierte',
    title: 'Une Fierté',
    description: isObject ? 'Quel est son détail le plus remarquable ?' : `Quelle ${isLiving ? 'est' : 'était'} sa plus grande fierté ou réalisation ?`,
    questions: [
      {
        id: 'content',
        label: 'Racontez-nous',
        type: 'textarea',
        placeholder: 'Ex: Avoir construit sa maison, ses enfants, un voyage...',
        path: 'fierte'
      }
    ]
  });

  // STEP 11: Goûts & Signes de vie
  if (isPerson && !isProCeremony) {
    steps.push({
      id: 'gouts',
      title: 'Jardin Secret',
      description: `Ces petits détails qui n'${isLiving ? 'appartiennent' : 'appartenaient'} qu'à elle/lui.`,
      questions: [
        {
          id: 'musique',
          label: `Une musique qu'il/elle ${isLiving ? 'aime' : 'aimait'} ?`,
          type: 'text',
          optional: true,
          placeholder: 'Titre ou artiste',
          path: 'gouts.musique'
        },
        {
          id: 'citation',
          label: 'Une expression ou citation favorite ?',
          type: 'text',
          optional: true,
          placeholder: 'Ex: "La vie est belle"',
          path: 'gouts.citation'
        },
        {
          id: 'lieu',
          label: 'Son lieu préféré ?',
          type: 'text',
          optional: true,
          path: 'gouts.lieu'
        },
        {
          id: 'plat',
          label: 'Son plat signature ?',
          type: 'text',
          optional: true,
          path: 'gouts.plat'
        }
      ]
    });
  }

  // STEP: Date de décès (uniquement pour Honorer)
  if (isPerson && !isLiving) {
    steps.push({
      id: 'dateDecesStep',
      title: 'Une date importante',
      description: 'Pour situer ce mémorial dans le temps.',
      questions: [
        {
          id: 'dateDeces',
          label: 'Année de décès',
          type: 'text',
          optional: true,
          placeholder: 'Ex: 2023',
          path: 'identite.dateDeces'
        }
      ]
    });
  }

  // STEP 12: Message Libre
  steps.push({
    id: 'messageLibre',
    title: isProCeremony ? 'Clôture de cérémonie' : 'Message Libre',
    description: isProCeremony
      ? 'Ajoutez la formule de clôture attendue (remerciements, transition, silence, musique).'
      : 'Avez-vous un dernier message à transmettre ?',
    questions: [
      {
        id: 'contenu',
        label: 'Votre message (ou celui que vous auriez voulu lui dire)',
        type: 'textarea',
        optional: true,
        placeholder: 'Écrivez librement ici...',
        path: 'messageLibre'
      }
    ]
  });

  return steps;
};
