import type { CommunType } from '@/lib/communTypes';
import type {
  CompositionModelId,
  VisualThemeId,
  WritingStyleId,
} from '@/lib/compositionStudio';
import type { TextTypography, TributeDisplayMode } from '@/lib/memorialRuntime';

export interface ExampleMemorial {
  slug: string;
  cardLabel: string;
  cardTitle: string;
  cardDescription: string;
  coverImage: string;
  communType: CommunType;
  compositionModel: CompositionModelId;
  visualTheme: VisualThemeId;
  writingStyle: WritingStyleId;
  textTypography: TextTypography;
  tributeMode: TributeDisplayMode;
  audioTitle?: string | null;
  audioUrl?: string | null;
  memorial: any;
  gallery: Array<{ id: string; url: string; type: 'image'; caption?: string }>;
}

export const EXAMPLE_MEMORIALS: ExampleMemorial[] = [
  {
    slug: 'transmettre-jean-jacques',
    cardLabel: 'Transmettre',
    cardTitle: 'Le secrétaire de Jean-Jacques',
    cardDescription:
      "Un espace de transmission pour raconter l'histoire d'un objet et la manière dont il traverse plusieurs générations.",
    coverImage: '/meuble.jpg',
    communType: 'memoire-objet',
    compositionModel: 'heritage-transmission',
    visualTheme: 'night-cinematic',
    writingStyle: 'narratif-patrimonial',
    textTypography: 'serif',
    tributeMode: 'none',
    audioTitle: 'Bach, Suite pour violoncelle n° 1',
    memorial: {
      identite: {
        prenom: 'Jean-Jacques',
        nom: 'Martin',
        dateNaissance: '1928',
        dateDeces: '2012',
      },
      citation:
        "Les objets gardent la forme des gestes et la patience des générations.",
      texteGenere:
        "Ce secretaire en noyer massif a d'abord appartenu a l'arriere-grand-pere de Jean-Jacques. Installe dans une etude lyonnaise a la fin du XIXe siecle, il a longtemps accompagne les papiers importants, les lettres de famille et les comptes du quotidien.\n\nQuand Jean-Jacques le recupere apres la guerre, le meuble change de vie sans perdre sa gravite. Il devient le lieu des courriers soigneusement replies, des carnets, des photos et des souvenirs que l'on ne jette pas. Ses tiroirs, ses marques d'usure et son plateau legerement creuse racontent une presence, une discipline et un attachement profond aux choses bien faites.\n\nAujourd'hui encore, ce secretaire relie plusieurs generations. Il ne vaut pas seulement pour sa matiere ou son epoque, mais pour la continuite qu'il rend visible: un meuble, une maison, une facon de transmettre ce qui compte.",
      gouts: {
        musique: 'Bach, Suite pour violoncelle no 1',
        lieu: 'Lyon, Beaune, puis Paris',
        phrase:
          "Un meuble peut devenir un repere, presque un membre silencieux de la famille.",
      },
      family: {
        story:
          "Ce meuble a relie quatre generations, de l'etude du notaire a l'appartement familial ou il repose aujourd'hui.",
        members: [
          { prenom: 'Henri', nom: 'Martin', role: 'Arriere-grand-pere' },
          { prenom: 'Jean-Jacques', nom: 'Martin', role: 'Grand-pere' },
          { prenom: 'Claire', nom: 'Martin', role: 'Petite-fille' },
        ],
        pdfUrl: 'https://example.com/arbre-famille-martin.pdf',
        pdfName: 'Arbre familial Martin',
      },
      liensWeb: [
        {
          id: 'trans-1',
          titre: 'Notice de restauration',
          description: 'Le carnet qui retrace les interventions faites sur le meuble.',
          url: 'https://example.com/restauration-secretaire',
        },
        {
          id: 'trans-2',
          titre: 'Album de documents',
          description: 'Photos anciennes et lettres conservees dans les tiroirs.',
          url: 'https://example.com/album-documents-famille',
        },
      ],
      message: {
        hasMessage: true,
        content:
          "Ce secretaire nous rappelle qu'un patrimoine se transmet autant par les usages que par les choses elles-memes.",
      },
      tributeMode: 'none',
      textTypography: 'serif',
    },
    gallery: [
      { id: 'jj-1', url: '/meuble.jpg', type: 'image', caption: 'Le secretaire aujourd hui' },
      {
        id: 'jj-2',
        url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=1200&q=80',
        type: 'image',
        caption: 'Carnets et papiers de famille',
      },
      {
        id: 'jj-3',
        url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&q=80',
        type: 'image',
        caption: 'Details de bois et de marqueterie',
      },
    ],
  },
  {
    slug: 'feter-marie',
    cardLabel: 'Fêter',
    cardTitle: 'Marie, 50 ans de vie et d’élan',
    cardDescription:
      "Un hommage vivant pour célébrer une personne entourée de ses proches, avec images, messages et une énergie très lumineuse.",
    coverImage: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=1600&q=85',
    communType: 'hommage-vivant',
    compositionModel: 'memory-album',
    visualTheme: 'celebration-vivid',
    writingStyle: 'lumineux-celebrant',
    textTypography: 'sans',
    tributeMode: 'flower',
    audioTitle: 'La vie en rose - version instrumentale',
    memorial: {
      identite: {
        prenom: 'Marie',
        nom: 'Durand',
        dateNaissance: '1974',
      },
      citation:
        "Celebrer une personne, c'est rassembler tout ce qu'elle met en mouvement autour d'elle.",
      texteGenere:
        "Marie avance avec une energie rare, une maniere de faire de la place aux autres tout en donnant une forme tres personnelle a sa vie. Architecte d'interieur, mere attentive, amie fidele, elle a construit autour d'elle un univers fait d'exigence, de curiosite et de generosite.\n\nCe qui frappe chez elle, c'est autant son regard que son elan. Marie sait organiser, relier, encourager, choisir les couleurs justes comme les mots justes. Elle aime les villes qui vibrent, les tables que l'on partage, les expositions improvisees, les conversations qui s'etirent et les anniversaires qui deviennent des souvenirs a part entiere.\n\nCet hommage vivant a ete pense comme une celebration en mouvement: des images, des voix, des messages et des scenes du quotidien pour dire tout ce qu'elle incarne deja pour les siens.",
      gouts: {
        musique: 'La vie en rose - version instrumentale',
        lieu: 'Paris et les bords du canal',
        phrase: "Elle transforme les occasions simples en moments que l'on retient longtemps.",
      },
      family: {
        story:
          "Autour de Marie, les liens se tissent dans les repas, les projets et les attentions du quotidien.",
        members: [
          { prenom: 'Camille', role: 'Fille' },
          { prenom: 'Lucas', role: 'Fils' },
          { prenom: 'Sophie', role: 'Amie de toujours' },
        ],
        pdfUrl: 'https://example.com/constellation-marie.pdf',
        pdfName: 'Constellation affective de Marie',
      },
      liensWeb: [
        {
          id: 'marie-1',
          titre: 'Laisser un mot',
          description: 'Un espace pour ajouter un souvenir ou une pensee.',
          url: 'https://example.com/messages-marie',
        },
        {
          id: 'marie-2',
          titre: 'Album de la celebration',
          description: 'Retrouver toutes les photos partagees pour cette journee.',
          url: 'https://example.com/album-marie',
        },
      ],
      message: {
        hasMessage: true,
        content:
          "Merci d'etre cette presence vive, elegante et genereuse qui donne envie d'avancer.",
      },
      tributeMode: 'flower',
      textTypography: 'sans',
    },
    gallery: [
      {
        id: 'marie-1',
        url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=1200&q=80',
        type: 'image',
        caption: 'Portrait de Marie',
      },
      {
        id: 'marie-2',
        url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80',
        type: 'image',
        caption: 'Moments partagés en famille',
      },
      {
        id: 'marie-3',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
        type: 'image',
        caption: 'Dans son atelier',
      },
    ],
  },
  {
    slug: 'honorer-mina',
    cardLabel: 'Honorer',
    cardTitle: 'Mina, une présence de douceur',
    cardDescription:
      "Un mémorial sobre et enveloppant, pensé pour honorer un proche disparu avec dignité, chaleur familiale et gestes symboliques.",
    coverImage: '/capture-mina.png',
    communType: 'deces',
    compositionModel: 'portrait-sensitive',
    visualTheme: 'memorial-soft',
    writingStyle: 'sensible-poetique',
    textTypography: 'serif',
    tributeMode: 'both',
    audioTitle: 'Cheb Hasni - Instrumental doux',
    memorial: {
      identite: {
        prenom: 'Mina',
        nom: 'Benali',
        dateNaissance: '1945',
        dateDeces: '2024',
      },
      citation:
        "Certaines presences continuent d'eclairer une famille bien apres leur depart.",
      texteGenere:
        "Mina etait une femme de douceur, de tenue et de chaleur. Née en Algerie, puis installee en France, elle a porte toute sa vie un art d'accueillir, d'ecouter et de tenir la maison comme on tient une promesse.\n\nAutour d'elle, les repas devenaient des retrouvailles, les silences ne pesaient jamais, et chacun savait qu'il trouverait un regard attentif ou une parole simple pour se relever. Mina n'occupait pas l'espace par le bruit, mais par une presence stable, rassurante et profondement aimante.\n\nCe memorial a ete compose pour garder vivants ses gestes, sa tendresse et tout ce qu'elle a transmis a sa famille. Il ne cherche pas a remplacer l'absence. Il cherche a offrir un lieu juste, ou la memoire puisse rester digne, partagee et apaisante.",
      gouts: {
        musique: 'Cheb Hasni - Instrumental doux',
        lieu: 'Entre Algerie, Lyon et la maison familiale',
        phrase: "Sa lumiere tenait dans une facon d'etre la pour chacun, simplement.",
      },
      family: {
        story:
          "Mina laisse derriere elle une lignee de gestes, de recettes, d'expressions et de rendez-vous familiaux qui continuent de faire maison.",
        members: [
          { prenom: 'Karim', role: 'Fils' },
          { prenom: 'Sarah', role: 'Petite-fille' },
          { prenom: 'Amine', role: 'Petit-fils' },
        ],
        pdfUrl: 'https://example.com/arbre-mina.pdf',
        pdfName: 'Arbre de famille de Mina',
      },
      liensWeb: [
        {
          id: 'mina-1',
          titre: 'Faire livrer des fleurs',
          description: "Un geste de presence pour la ceremonie et les jours qui suivent.",
          url: 'https://example.com/fleurs-mina',
        },
        {
          id: 'mina-2',
          titre: 'Cagnotte de soutien',
          description: 'Participer aux attentions prevues pour la famille.',
          url: 'https://example.com/cagnotte-mina',
        },
      ],
      message: {
        hasMessage: true,
        content:
          "Nous gardons ta lumiere dans nos coeurs, et la maison porte encore la douceur de ta presence.",
      },
      tributeMode: 'both',
      textTypography: 'serif',
    },
    gallery: [
      { id: 'mina-1', url: '/mina.jpg', type: 'image', caption: 'Portrait de Mina' },
      {
        id: 'mina-2',
        url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&q=80',
        type: 'image',
        caption: 'Reunion de famille',
      },
      {
        id: 'mina-3',
        url: 'https://images.unsplash.com/photo-1473830394358-91588751b241?w=1200&q=80',
        type: 'image',
        caption: 'Dans la cuisine, son royaume',
      },
    ],
  },
];

export function getExampleMemorialBySlug(slug: string): ExampleMemorial | undefined {
  return EXAMPLE_MEMORIALS.find((example) => example.slug === slug);
}
