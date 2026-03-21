'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Scénarios de test neutres — aucun deuil, aucune émotion requise
const SCENARIOS = [
  {
    id: 'feter-alex',
    label: '🎉 Fêter — Alex, 40 ans',
    description: 'Anniversaire, mise en page album, ambiance festive',
    data: {
      questionnaire: {
        communType: 'hommage-vivant',
        context: 'celebration',
        identite: { prenom: 'Alex', nom: 'Dupont', dateNaissance: '1984' },
        style: 'narratif',
        caractere: { adjectifs: ['curieux', 'généreux', 'drôle'] },
        valeurs: { selected: ['famille', 'créativité'] },
        gouts: {
          musique: 'Daft Punk — Get Lucky',
          lieu: 'Bretagne et Paris',
          phrase: 'La vie est trop courte pour les mauvais cafés.',
          saison: 'été',
        },
        talents: { carriere: 'Designer', passions: 'Cuisine et randonnée' },
        liens: {
          personnesQuiComptent: 'Famille et amis proches',
          constellation: [
            { prenom: 'Sam', role: 'Partenaire de vie' },
            { prenom: 'Jordan', role: 'Meilleur·e ami·e' },
            { prenom: 'Morgan', role: 'Frère' },
          ],
        },
        resume: 'Alex fête ses 40 ans entouré·e des siens.',
      },
      finalization: {
        source: 'questionnaire',
        context: 'celebration',
        communType: 'hommage-vivant',
        style: 'narratif',
      },
      flow: { source: 'questionnaire', context: 'celebration', communType: 'hommage-vivant' },
      generatedText: `Alex avance dans la vie avec une énergie communicative et un sens du détail qui force l'admiration. Designer de métier, cuisinier du dimanche et randonneur du weekend, il ou elle a construit autour d'elle un univers fait de curiosité et de générosité.

Ce qui frappe chez Alex, c'est autant la capacité à rassembler les gens que l'humour toujours présent. Alex sait transformer un repas ordinaire en moment mémorable, une balade en aventure, une réunion en célébration.

Pour ces 40 ans, la famille et les amis se sont rassemblés pour dire tout ce qu'ils n'ont pas toujours le temps de dire : merci d'être là, merci d'être vous.`,
      previewData: {
        communType: 'hommage-vivant',
        context: 'celebration',
        compositionModel: 'memory-album',
        visualTheme: 'celebration-vivid',
        writingStyle: 'lumineux-celebrant',
        textTypography: 'sans',
        tributeMode: 'flower',
        identite: { prenom: 'Alex', nom: 'Dupont', dateNaissance: '1984' },
      },
    },
  },
  {
    id: 'transmettre-lampe',
    label: '🏺 Transmettre — La lampe de grand-mère',
    description: 'Objet de famille, mise en page patrimoine, ambiance nuit cinématographique',
    data: {
      questionnaire: {
        communType: 'memoire-objet',
        context: 'object_memory',
        identite: { prenom: 'La lampe Tiffany', nom: '', dateNaissance: '1920' },
        style: 'sobre',
        caractere: { adjectifs: ['précieux', 'intemporel', 'familial'] },
        valeurs: { selected: ['transmission', 'mémoire'] },
        gouts: {
          musique: 'Satie — Gymnopédie n°1',
          lieu: 'Maison de Provence',
          phrase: 'Les objets gardent la forme des gestes.',
        },
        talents: { passions: 'Art nouveau, vitrail' },
        resume: 'Une lampe Tiffany transmise de génération en génération.',
        liens: {
          personnesQuiComptent: 'Transmise de génération en génération',
          constellation: [
            { prenom: 'Grand-mère Lucie', role: 'Première propriétaire' },
            { prenom: 'Maman', role: 'Héritière' },
            { prenom: 'Clara', role: 'Petite-fille' },
          ],
        },
      },
      finalization: {
        source: 'questionnaire',
        context: 'object_memory',
        communType: 'memoire-objet',
        style: 'sobre',
      },
      flow: { source: 'questionnaire', context: 'object_memory', communType: 'memoire-objet' },
      generatedText: `Cette lampe Tiffany a traversé le XXe siècle sans en perdre l'éclat. Fabriquée dans les années 1920, elle a d'abord éclairé le salon d'une maison de Provence avant de rejoindre, par héritage, les appartements successifs d'une même famille.

Ce qui frappe, c'est la permanence de sa lumière. Que ce soit dans les fêtes de famille, les soirs de lecture solitaires ou les veillées d'hiver, elle a toujours été là — présence discrète et rassurante dans le fond de la pièce.

Aujourd'hui, cette lampe ne vaut pas seulement pour son style art nouveau ou la finesse de ses vitraux. Elle vaut pour tout ce qu'elle a éclairé, tout ce qu'elle a vu, et pour la continuité qu'elle rend visible entre ceux qui sont partis et ceux qui restent.`,
      previewData: {
        communType: 'memoire-objet',
        context: 'object_memory',
        compositionModel: 'heritage-transmission',
        visualTheme: 'night-cinematic',
        writingStyle: 'narratif-patrimonial',
        textTypography: 'serif',
        tributeMode: 'none',
        identite: { prenom: 'La lampe Tiffany', nom: '', dateNaissance: '1920' },
      },
    },
  },
  {
    id: 'honorer-maquette',
    label: '🕯️ Honorer — Test rendu mémoriel',
    description: 'Données fictives neutres, mise en page portrait sensible',
    data: {
      questionnaire: {
        communType: 'deces',
        context: 'funeral',
        identite: { prenom: 'Camille', nom: 'Martin', dateNaissance: '1945', dateDeces: '2024' },
        style: 'poetique',
        caractere: { adjectifs: ['doux', 'attentionné', 'discret'] },
        valeurs: { selected: ['famille', 'nature', 'paix'] },
        gouts: {
          musique: 'Chopin — Nocturne Op. 9',
          lieu: 'La campagne normande',
          phrase: 'La douceur est une force.',
          saison: 'automne',
        },
        talents: { carriere: 'Instituteur·rice', passions: 'Jardinage et lecture' },
        resume: 'Une vie simple et profondément humaine.',
        liens: {
          personnesQuiComptent: 'Ses élèves, sa famille, ses voisins de longue date',
          constellation: [
            { prenom: 'Élise', role: 'Fille' },
            { prenom: 'Thomas', role: 'Petit-fils' },
            { prenom: 'René', role: 'Ami de 40 ans' },
          ],
        },
      },
      finalization: {
        source: 'questionnaire',
        context: 'funeral',
        communType: 'deces',
        style: 'poetique',
      },
      flow: { source: 'questionnaire', context: 'funeral', communType: 'deces' },
      generatedText: `Camille Martin a traversé la vie avec une douceur rare et une attention constante aux autres. Instituteur·rice de métier, jardinier·ère du week-end, lecteur·rice du soir, il·elle a fait de chaque geste ordinaire une forme de soin.

Ce qui reste de Camille, c'est d'abord cette capacité à écouter vraiment, sans se presser, sans juger. Ses élèves se souviennent d'une présence calme et encourageante. Sa famille, de repas pris le temps qu'il faut, de promenades en forêt et de leçons données sans en avoir l'air.

La campagne normande qu'il·elle aimait tant garde encore, quelque part, la forme de ses pas.`,
      previewData: {
        communType: 'deces',
        context: 'funeral',
        compositionModel: 'portrait-sensitive',
        visualTheme: 'memorial-soft',
        writingStyle: 'poetique-lumineux',
        textTypography: 'serif',
        tributeMode: 'both',
        identite: { prenom: 'Camille', nom: 'Martin', dateNaissance: '1945', dateDeces: '2024' },
      },
    },
  },
];

const TEST_MEMORY_ID = 'test-atelier-fixture';

export default function TestAtelierPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState<string | null>(null);

  const loadScenario = (scenario: (typeof SCENARIOS)[0]) => {
    const { data } = scenario;

    // Nettoyer d'abord tout l'ancien
    const keysToClear = [
      'generatedMemorialText', 'questionnaireData', 'vivantQuestionnaireData',
      'transmissionQuestionnaireData', 'objetQuestionnaireData', 'solennQuestionnaireData',
      'memorial_finalization', 'mediaData', 'currentMemorialId', 'creation_flow',
      'memorialPreviewData', 'alma_context', 'alma_commun_type', 'context',
    ];
    keysToClear.forEach((key) => localStorage.removeItem(key));
    Object.keys(localStorage)
      .filter((k) => k.startsWith('questionnaire-memoire-') || k.startsWith('almaConversation_'))
      .forEach((k) => localStorage.removeItem(k));

    // Charger les nouvelles données
    localStorage.setItem('questionnaireData', JSON.stringify(data.questionnaire));
    localStorage.setItem('memorial_finalization', JSON.stringify(data.finalization));
    localStorage.setItem('creation_flow', JSON.stringify(data.flow));
    localStorage.setItem('generatedMemorialText', data.generatedText);
    localStorage.setItem('memorialPreviewData', JSON.stringify({
      ...data.previewData,
      texteGenere: data.generatedText,
    }));
    localStorage.setItem('currentMemorialId', TEST_MEMORY_ID);

    setLoaded(scenario.id);
  };

  const goToAtelier = () => {
    router.push(`/dashboard/validate?memoryId=${TEST_MEMORY_ID}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F4F2] px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 rounded-2xl border border-[#E7E1D7] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🧪</span>
            <h1 className="text-xl font-semibold text-[#0F2A44]">Page de test — Atelier</h1>
          </div>
          <p className="text-sm text-[#5E6B78]">
            Charge un scénario fictif dans le navigateur et ouvre l'atelier directement.
            Aucune donnée réelle, aucun deuil. Juste pour tester l'interface.
          </p>
          <p className="mt-2 text-xs text-[#9E9585] italic">
            ⚠️ Cette page n'est pas accessible depuis la navigation principale. URL directe : /test-atelier
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {SCENARIOS.map((scenario) => (
            <div
              key={scenario.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                loaded === scenario.id
                  ? 'border-[#2B5F7D] bg-[#F0F5F9]'
                  : 'border-[#E7E1D7] hover:border-[#C9A24D]/50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#0F2A44]">{scenario.label}</p>
                  <p className="mt-1 text-sm text-[#5E6B78]">{scenario.description}</p>
                </div>
                <button
                  onClick={() => loadScenario(scenario)}
                  className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    loaded === scenario.id
                      ? 'bg-[#2B5F7D] text-white'
                      : 'bg-[#0F2A44]/10 text-[#0F2A44] hover:bg-[#0F2A44]/20'
                  }`}
                >
                  {loaded === scenario.id ? '✓ Chargé' : 'Charger'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {loaded && (
          <div className="rounded-2xl border border-[#D7EAD8] bg-[#F4FBF4] p-5 text-center">
            <p className="text-sm font-medium text-[#2F5B35] mb-4">
              ✓ Scénario chargé. L'atelier est prêt.
            </p>
            <button
              onClick={goToAtelier}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F2A44] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1D334B] transition"
            >
              Ouvrir l'atelier →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
