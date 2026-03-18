import { resolveIdentity } from '@/lib/memorialRuntime';

function buildSection(title: string, content: string): string {
  const cleaned = String(content || '').trim();
  if (!cleaned) return '';
  return `${title}\n${cleaned}`;
}

export function buildMemoryFallbackText(data: any): string {
  const identity = resolveIdentity(data || {});
  const prenom = identity?.prenom || 'cette personne';
  const nom = identity?.nom || '';
  const title = [prenom, nom].filter(Boolean).join(' ').trim() || 'Cette histoire';

  const resume =
    data?.resume ||
    data?.message?.content ||
    data?.messageLibre ||
    data?.liens?.anecdotes ||
    data?.liensVie?.anecdotes ||
    '';

  const qualities = Array.isArray(data?.caractere?.adjectifs)
    ? data.caractere.adjectifs.filter(Boolean).join(', ')
    : '';

  const values = Array.isArray(data?.valeurs?.selected)
    ? data.valeurs.selected.filter(Boolean).join(', ')
    : '';

  const relationships =
    data?.liens?.personnesQuiComptent ||
    data?.liensVie?.personnesQuiComptent ||
    data?.liens?.amis ||
    data?.liensVie?.amis ||
    '';

  const places = data?.liens?.lieuxDeVie || data?.liensVie?.lieuxDeVie || '';

  const sections = [
    `# ${title}`,
    `${prenom} merite un texte sensible et juste. Une premiere base a ete preparee a partir des elements deja partages, afin que vous puissiez relire, corriger et enrichir tranquillement cet espace.`,
    buildSection('Ce qui se degage deja', qualities || values),
    buildSection('Ce que vos mots racontent deja', resume),
    buildSection('Les liens qui comptent', relationships),
    buildSection('Les lieux et reperes de vie', places),
    `Cette premiere version est volontairement sobre. Vous pouvez maintenant la retravailler, ajouter des nuances, et inviter d'autres proches a contribuer si vous le souhaitez.`,
  ].filter(Boolean);

  return sections.join('\n\n');
}
