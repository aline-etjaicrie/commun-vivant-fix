import { resolveIdentity } from '@/lib/memorialRuntime';

const list = (values: any): string => {
  if (!values) return '';
  if (Array.isArray(values)) return values.filter(Boolean).join(', ');
  return String(values || '').trim();
};

const ucfirst = (value: string): string => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const clean = (value: any): string => String(value || '').trim();

function buildSection(title: string, content: string): string {
  const cleaned = clean(content);
  if (!cleaned) return '';
  return `${title}\n${cleaned}`;
}

export function buildMemoryFallbackText(data: any): string {
  const identity = resolveIdentity(data || {});
  const prenom = ucfirst(identity?.prenom || 'cette personne');
  const nom = ucfirst(identity?.nom || '');
  const title = [prenom, nom].filter(Boolean).join(' ').trim() || 'Cette histoire';

  const resume =
    data?.resume ||
    data?.message?.content ||
    data?.messageLibre ||
    data?.liens?.anecdotes ||
    data?.liensVie?.anecdotes ||
    '';

  const qualities = list(data?.caractere?.adjectifs);
  const values = list(data?.valeurs?.selected);
  const talents = [
    list(data?.talents?.carriere),
    list(data?.talents?.sport),
    list(data?.talents?.blagues),
  ]
    .filter(Boolean)
    .join(' • ');

  const relationships =
    data?.liens?.personnesQuiComptent ||
    data?.liensVie?.personnesQuiComptent ||
    data?.liens?.amis ||
    data?.liensVie?.amis ||
    '';

  const places = list(data?.liens?.lieuxDeVie || data?.liensVie?.lieuxDeVie);
  const voyages = list(data?.liens?.voyages || data?.liensVie?.voyages);
  const occasions = clean(data?.occasion?.type || '');
  const occasionDetails = clean(data?.occasion?.details || '');

  const themes = list(data?.imageThemes || data?.memoryImageEnergies);
  const musique = clean(data?.gouts?.musique || data?.medias?.audioTitle || '');
  const citation = clean(data?.gouts?.citation || data?.gouts?.phrase || '');

  const sections = [
    `# ${title}`,
    `${prenom} mérite un texte sensible et fidèle. Cette base reprend vos réponses, les médias et les éléments déjà saisis pour que vous puissiez relire et compléter sereinement.`,
    buildSection('Ce qui ressort déjà', [qualities, values].filter(Boolean).join(' • ')),
    buildSection('Repères de vie', [places, voyages].filter(Boolean).join(' • ')),
    buildSection('Liens et proches', relationships),
    buildSection('Talents et passions', talents),
    buildSection('Thèmes des images', themes),
    buildSection('Musique ou ambiance', musique),
    buildSection('Citation ou phrase', citation),
    buildSection('Occasion', [occasions, occasionDetails].filter(Boolean).join(' — ')),
    buildSection('Vos mots déjà posés', resume),
    `Cette version est volontairement synthétique. Vous pouvez enrichir, corriger et mettre au ton juste, puis ouvrir l’aperçu pour voir le rendu avant partage.`,
  ].filter(Boolean);

  return sections.join('\n\n');
}
