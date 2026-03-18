export const PROMPT_SYSTEME = `Tu es un auteur discret et attentif.
Tu écris pour un projet mémoriel intitulé « Et j'ai crié — Mémoire ».

CONTEXTE
À partir des réponses à un questionnaire, tu dois écrire un TEXTE CONTINU, sensible et incarné.
Les réponses ne doivent JAMAIS apparaître comme une liste, ni comme une suite d'informations.
Elles servent de matière invisible pour composer un récit fluide, humain, digne.
Il ne s'agit pas d'un hommage grandiloquent.
Il s'agit de faire apparaître une présence, une manière d'être au monde.

RÈGLES ABSOLUES
- Interdiction de produire une liste ou des phrases juxtaposées.
- Interdiction de reprendre mécaniquement les réponses ("Il aimait X, Y, Z").
- Le texte doit être lisible comme un texte littéraire autonome.
- Ton juste, jamais emphatique, jamais religieux, jamais pompe funèbre.
- Aucune invention de faits non fournis.
- Si une information manque, tu l'ignores avec élégance.
- Aucun jugement moral.
- Pas de métaphores lourdes, pas de pathos.

STRUCTURE ATTENDUE
- 1 à 3 paragraphes maximum.
- Une ouverture douce (présence, manière d'être).
- Un corps de texte qui tisse caractère, valeurs, relations, gestes, goûts.
- Une conclusion ouverte (ce qui reste, ce qui circule encore).

STYLE À RESPECTER
Tu dois écrire UNE version du texte selon le style demandé ci-dessous.

=== STYLE : SOBRE ===
- Écriture épurée, phrases claires.
- Peu d'adjectifs, mais choisis.
- Rythme lent, presque silencieux.
- Impression de stabilité, de retenue.
- Le texte pourrait être gravé sans être figé.

=== STYLE : NARRATIF ===
- Écriture fluide, chaleureuse.
- Sens du lien, du quotidien, des scènes discrètes.
- On sent une trajectoire de vie sans la raconter chronologiquement.
- Le texte donne l'impression d'une voix qui raconte doucement.

=== STYLE : POÉTIQUE ===
- Écriture plus sensorielle, mais concrète.
- Les adjectifs deviennent atmosphère.
- Les détails comptent plus que les faits.
- Le texte suggère plus qu'il n'explique.
- Poésie simple, jamais abstraite.

IMPORTANT
Les adjectifs, valeurs et détails doivent être DISSOUTS dans le texte.
Ils ne sont jamais cités comme tels.
Ils orientent la manière d'écrire, pas le contenu explicite.

LONGUEUR
Entre 120 et 220 mots maximum.

SORTIE
Donne uniquement le texte final.
Aucun commentaire, aucun titre, aucune explication.
`;

export function construirePromptUtilisateur(data: any, style: string): string {
  let prompt = `STYLE DEMANDÉ : ${style.toUpperCase()}\n\n`;
  
  prompt += `DONNÉES À UTILISER (matière brute)\n\n`;

  // Identité
  if (data.identite) {
    if (data.identite.prenom) {
      prompt += `Prénom : ${data.identite.prenom}\n`;
    }
    if (data.identite.nom) {
      prompt += `Nom : ${data.identite.nom}\n`;
    }
    
    // Dates / repères
    const dates = [];
    if (data.identite.dateNaissance) dates.push(`né(e) en ${new Date(data.identite.dateNaissance).getFullYear()}`);
    if (data.identite.dateDeces) dates.push(`décédé(e) en ${new Date(data.identite.dateDeces).getFullYear()}`);
    if (data.identite.lieuNaissance) dates.push(`lieu de naissance : ${data.identite.lieuNaissance}`);
    if (data.identite.lieuSymbolique) dates.push(`lieu symbolique : ${data.identite.lieuSymbolique}`);
    if (dates.length > 0) {
      prompt += `Dates / repères : ${dates.join(', ')}\n`;
    }
  }

  // Adjectifs choisis
  if (data.caractere?.adjectifs?.length > 0) {
    prompt += `Adjectifs choisis : ${data.caractere.adjectifs.join(', ')}`;
    if (data.caractere.autre) {
      prompt += `, ${data.caractere.autre}`;
    }
    prompt += `\n`;
  }

  // Valeurs
  if (data.valeurs?.selected?.length > 0) {
    prompt += `Valeurs : ${data.valeurs.selected.join(', ')}`;
    if (data.valeurs.autre) {
      prompt += `, ${data.valeurs.autre}`;
    }
    prompt += `\n`;
  }

  // Talents / passions
  const talentsPassions = [];
  if (data.talents?.talent) talentsPassions.push(data.talents.talent);
  if (data.talents?.passions) talentsPassions.push(data.talents.passions);
  if (talentsPassions.length > 0) {
    prompt += `Talents / passions : ${talentsPassions.join(' — ')}\n`;
  }

  // Relations
  if (data.liens?.personnes) {
    prompt += `Relations importantes : ${data.liens.personnes}`;
    if (data.liens.noms) {
      prompt += ` (noms : ${data.liens.noms})`;
    }
    prompt += `\n`;
  }

  // Fierté
  if (data.realisation) {
    prompt += `Fierté ou réalisation : ${data.realisation}\n`;
  }

  // Goûts, signes, détails
  const details = [];
  if (data.gouts?.musique) details.push(`musique : ${data.gouts.musique}`);
  if (data.gouts?.phrase) details.push(`phrase aimée : "${data.gouts.phrase}"`);
  if (data.gouts?.lieu) details.push(`lieu marquant : ${data.gouts.lieu}`);
  if (data.gouts?.habitude) details.push(`habitude : ${data.gouts.habitude}`);
  if (data.gouts?.saison) details.push(`saison préférée : ${data.gouts.saison}`);
  if (details.length > 0) {
    prompt += `Goûts, signes, détails : ${details.join(' — ')}\n`;
  }

  // Message libre
  if (data.message?.content) {
    prompt += `Message libre éventuel : ${data.message.content}\n`;
  }

  const themes = (data.image_themes || data.memory_image_energies || data.image_energies || [])
    .filter((v: unknown) => typeof v === 'string' && v.trim().length > 0)
    .slice(0, 12);
  if (themes.length > 0) {
    prompt += `Thèmes dominants validés : ${themes.join(', ')}\n`;
    prompt += `Utilise ces thèmes comme lignes de force du texte sans mentionner les images.\n`;
  }

  prompt += `\n---\n\nÉcris maintenant le texte en style ${style.toUpperCase()}.`;

  return prompt;
}
