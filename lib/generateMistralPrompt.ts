import { generateSignature } from './generateSignature';

export function generateMistralPrompt(data: any): string {
  const prenom = data.identite?.prenom || data.prenom || '';
  const nom = data.identite?.nom || data.nom || '';
  const pronom = data.identite?.pronom || data.pronom || 'Il';
  const dateNaissance = data.identite?.dateNaissance || data.dateNaissance || data.repereBio?.dateNaissance || '';
  const dateDeces = data.identite?.dateDeces || data.dateDeces || data.repereBio?.dateDeces || '';
  const lieuNaissance = data.identite?.lieuNaissance || data.lieuNaissance || data.repereBio?.lieuNaissance || '';
  const lieuSymbolique = data.identite?.lieuSymbolique || data.lieuSymbolique || data.repereBio?.lieuSymbolique || '';
  const context = String(data.context || data.contextType || '').trim();
  const communType = String(data.communType || data.context_type || '').trim();

  const typeHommage = data.typeHommage?.type || '';
  const lienType = data.lienPersonne?.type || '';
  const modeContributeur = data.modeContributeur?.mode || '';
  const isMulti = modeContributeur.includes('autres personnes');
  const quiContribue = data.modeContributeur?.quiContribue || [];
  const isInconnu = lienType.includes('connu personnellement');
  const isProfessionnel = typeHommage.includes('professionnel') && !typeHommage.includes('deux');
  const isLivingJourney = context === 'living_story' || communType === 'hommage-vivant';
  const isObjectJourney = context === 'object_memory' || communType === 'memoire-objet';
  const isTransmissionJourney = communType === 'transmission-familiale';

  const tonalite = data.style || 'sobre';
  const signature = generateSignature(data);

  // Pronoms
  let lui = 'lui';
  let il = pronom === 'Elle' ? 'elle' : pronom === 'Iel' ? 'iel' : 'il';
  let le = pronom === 'Elle' ? 'la' : pronom === 'Iel' ? 'iel' : 'le';
  let son = pronom === 'Elle' ? 'sa' : 'son';
  lui = pronom === 'Elle' ? 'elle' : pronom === 'Iel' ? 'iel' : 'lui';

  // Contenu
  const adjectifs: string[] = data.caractere?.adjectifs || [];
  const anecdote: string = data.caractere?.anecdote || '';
  const valeurs: string[] = data.valeurs?.selected || [];
  const valeursTexte: string = data.valeurs?.valeursTexte || '';
  const liens = data.liens || data.liensVie || {};
  const nomsLiens: string =
    liens?.noms ||
    liens?.personnesQuiComptent ||
    liens?.amis ||
    '';
  const liensTexte: string =
    liens?.liensTexte ||
    liens?.anecdotes ||
    '';
  const passions: string =
    data.talents?.passions ||
    data.talents?.carriere ||
    '';
  const talent: string =
    data.talents?.talent ||
    data.talents?.sport ||
    data.talents?.blagues ||
    '';
  const talentsTexte: string = data.talents?.talentsTexte || '';
  const realisationText: string = data.realisation?.realisationText || '';
  const musique: string = data.gouts?.musique || data.medias?.audioTitle || '';
  const phrase: string = data.gouts?.phrase || data.gouts?.citation || '';
  const lieu: string = data.gouts?.lieu || liens?.lieuxDeVie || '';
  const habitude: string = data.gouts?.habitude || '';
  const saison: string = data.gouts?.saison || '';
  const messagePerso: string = data.message?.content || data.resume || '';
  const occasionType: string = data.occasion?.type || '';
  const occasionDetails: string = data.occasion?.details || '';
  const voyages: string = liens?.voyages || '';
  const imageThemes: string[] = (
    data.imageThemes ||
    data.image_themes ||
    data.memoryImageEnergies ||
    data.memory_image_energies ||
    data.image_energies ||
    data.energies_visuelles ||
    data.medias?.imageThemes ||
    []
  )
    .filter((v: unknown) => typeof v === 'string' && (v as string).trim().length > 0)
    .map((v: string) => v.trim())
    .slice(0, 8);

  const prenom_nom = [prenom, nom].filter(Boolean).join(' ');

  // Construire un bloc "matière brute" lisible, pas une liste numérotée
  const materiaux: string[] = [];

  if (dateNaissance || dateDeces || lieuNaissance) {
    const bio = [
      dateNaissance ? `né${pronom === 'Elle' ? 'e' : ''} le ${dateNaissance}` : '',
      lieuNaissance ? `à ${lieuNaissance}` : '',
      dateDeces ? `décédé${pronom === 'Elle' ? 'e' : ''} le ${dateDeces}` : '',
    ].filter(Boolean).join(', ');
    materiaux.push(`Repères : ${bio}.`);
  }

  if (lieu || lieuSymbolique) {
    materiaux.push(`Lieux qui comptaient : ${[lieu, lieuSymbolique].filter(Boolean).join(', ')}.`);
  }

  if (voyages) {
    materiaux.push(`Voyages, horizons ou lieux traverses : ${voyages}.`);
  }

  if (adjectifs.length > 0) {
    materiaux.push(`Ce que les proches retiennent de ${il === 'elle' ? 'elle' : 'lui'} : ${adjectifs.join(', ')}.`);
  }

  if (anecdote) {
    materiaux.push(`Une anecdote à raconter absolument : « ${anecdote} »`);
  }

  if (valeurs.length > 0) {
    materiaux.push(`Ce qui guidait ${son} existence : ${valeurs.join(', ')}.`);
  }

  if (valeursTexte) {
    materiaux.push(`Sur ses valeurs, voici ce qu'on nous a dit : « ${valeursTexte} »`);
  }

  if (nomsLiens || liensTexte) {
    const liens = [nomsLiens, liensTexte].filter(Boolean).join(' — ');
    materiaux.push(`Les personnes qui comptaient : ${liens}.`);
  }

  if (passions || talent) {
    const p = [passions, talent].filter(Boolean).join(', ');
    materiaux.push(`Ce qu'${il} aimait faire : ${p}.`);
  }

  if (talentsTexte) {
    materiaux.push(`À propos de ses talents : « ${talentsTexte} »`);
  }

  if (habitude) {
    materiaux.push(`Une habitude qui le définissait : ${habitude}.`);
  }

  if (saison) {
    materiaux.push(`${pronom === 'Elle' ? 'Sa' : 'Sa'} saison préférée : ${saison}.`);
  }

  if (musique) {
    materiaux.push(`Musique ou ambiance qui ${le} représente : ${musique}.`);
  }

  if (realisationText) {
    materiaux.push(`Ce dont ${il} était le plus fier${pronom === 'Elle' ? 'e' : ''} : « ${realisationText} »`);
  }

  if (messagePerso) {
    materiaux.push(`Un message personnel à intégrer : « ${messagePerso} »`);
  }

  if (phrase) {
    materiaux.push(`Une phrase ou citation qui ${le} représente : « ${phrase} »`);
  }

  if (imageThemes.length > 0) {
    materiaux.push(`Atmosphères et sensations associées à ${prenom || 'cette personne'} : ${imageThemes.join(', ')}.`);
  }

  if (isMulti && quiContribue.length > 0) {
    materiaux.push(`Ce texte est écrit ensemble par : ${quiContribue.join(', ')}.`);
  }

  if (occasionType || occasionDetails) {
    materiaux.push(`Contexte ou occasion de cette page : ${[occasionType, occasionDetails].filter(Boolean).join(' — ')}.`);
  }

  // Instruction de voix narrative
  let voix = '';
  if (isInconnu) {
    voix = `Écris à la troisième personne, avec un ton factuel et respectueux. Pas d'émotion déclarée ni de souvenir personnel inventé.`;
  } else if (isMulti) {
    voix = `Écris à la première personne du pluriel ("nous"), comme si plusieurs proches parlaient ensemble d'une voix commune.`;
  } else {
    voix = `Écris à la première personne ("je") avec retenue et pudeur, comme si c'était toi qui rendais hommage à quelqu'un que tu aimais vraiment.`;
  }

  let contextePro = '';
  if (isProfessionnel) {
    contextePro = `Le contexte est professionnel : mets en avant le parcours, l'engagement, la transmission et l'impact, sans entrer dans l'intimité familiale.`;
  }

  let contexteParcours = '';
  if (isLivingJourney) {
    contexteParcours = `La personne est vivante. Ecris au present, dans un ton de celebration et de gratitude. N'utilise aucun vocabulaire funeraires ou mortuaire.`;
  } else if (isObjectJourney) {
    contexteParcours = `Le sujet principal peut etre un objet de transmission. Si l'objet est central dans la matiere fournie, raconte ce qu'il porte et transmet sans transformer le texte en fiche technique.`;
  } else if (isTransmissionJourney) {
    contexteParcours = `Le texte doit faire sentir la transmission familiale, les gestes, les repères et ce qui se passe d'une generation a l'autre.`;
  } else {
    contexteParcours = `Le texte est un hommage memoriel. Il doit rester sobre, humain, incarné et lisible dans la duree.`;
  }

  const prompt = `Tu es un écrivain. On te demande d'écrire un texte d'hommage sur ${prenom_nom || 'une personne'}.

${voix}
${contexteParcours}
${contextePro ? contextePro + '\n' : ''}
Ton : ${tonalite}. Le texte doit être humain, intime, émouvant — comme une lettre écrite par quelqu'un qui aimait vraiment cette personne, pas comme un curriculum vitae ou une notice biographique.

Voici la matière première — des informations brutes sur cette personne. Ne les récite pas dans l'ordre. Ne fais pas de liste. Transforme-les en un récit fluide, en prose, où les détails surgissent naturellement dans le texte comme dans une vraie prise de parole :

${materiaux.join('\n')}

Quelques exigences absolues :
— Le texte commence par le prénom : "${prenom || 'Cette personne'}."
— Il fait entre 300 et 500 mots.
— Il est organisé en paragraphes (4 à 6), chaque paragraphe développant une facette de la personne, pas une rubrique.
- Utilise uniquement les informations fournies ci-dessus. N'invente jamais un autre prénom, une autre identité, une autre passion, une autre habitude ou une autre scène.
- Si une information manque, reste sobre et général sur ce point au lieu d'inventer.
— Si une anecdote est mentionnée ci-dessus, elle doit apparaître dans le texte, racontée en quelques phrases vivantes.
— Si un message personnel est mentionné, intègre-le en le reformulant naturellement, jamais mot pour mot entre guillemets dans le texte.
— Aucune liste à puces, aucun titre, aucun sous-titre dans le texte final.
— Pas de phrases creuses du type "ce qui demeure", "tisser", "traverser le temps", "à jamais gravé", "parti trop tôt", "repose en paix", "ange". Ces formules sonnent faux.
— Termine par cette signature exacte, seule sur sa ligne : ${signature}

Génère le texte maintenant, directement, sans introduction ni commentaire.`;

  return prompt;
}
