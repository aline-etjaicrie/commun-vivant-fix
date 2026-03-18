// Fonction pour générer la signature du mémorial
export function generateSignature(data: any): string {
  const prenom = data.identite?.prenom || '';
  const nom = data.identite?.nom || '';
  const fullName = nom ? `${prenom} ${nom}` : prenom;
  
  const lienType = data.lienPersonne?.type;
  const modeContributeur = data.modeContributeur?.mode;
  const quiContribue = data.modeContributeur?.quiContribue || [];
  const quiContribueLibre = data.modeContributeur?.quiContribueLibre;
  
  const isSolo = modeContributeur?.includes('seul·e');
  const isMulti = modeContributeur?.includes('autres personnes');

  // Mode inconnu (pas de lien personnel)
  if (lienType?.includes('connu personnellement')) {
    return `En mémoire de ${fullName}`;
  }

  // Mode multi-contributeurs
  if (isMulti && quiContribue.length > 0) {
    // Si "Autre" est coché et précisé
    if (quiContribue.includes('Autre') && quiContribueLibre) {
      return `De la part de ${quiContribueLibre}`;
    }
    
    // Sinon, prendre le premier groupe
    const premier = quiContribue[0];
    if (premier === 'Ses enfants') return 'De ses enfants';
    if (premier === 'Ses ami·e·s') return 'De ses ami·e·s';
    if (premier === 'Sa famille') return 'De sa famille';
    if (premier === 'Ses collègues') return 'De ses collègues';
    if (premier === 'Ses proches') return 'De ses proches';
  }

  // Mode solo : signature selon le lien
  if (isSolo) {
    if (lienType?.includes('Père')) return `À mon père, ${fullName}`;
    if (lienType?.includes('Mère')) return `À ma mère, ${fullName}`;
    if (lienType?.includes('Fils')) return `À mon fils, ${fullName}`;
    if (lienType?.includes('Fille')) return `À ma fille, ${fullName}`;
    if (lienType?.includes('Frère')) return `À mon frère, ${fullName}`;
    if (lienType?.includes('Sœur')) return `À ma sœur, ${fullName}`;
    if (lienType?.includes('Conjoint') || lienType?.includes('Conjointe') || lienType?.includes('Partenaire')) {
      return `À ${prenom}`;
    }
    if (lienType?.includes('Ami') || lienType?.includes('Amie')) {
      return `À ${prenom}, mon ami${lienType?.includes('Amie') ? 'e' : ''}`;
    }
    if (lienType?.includes('Parent')) return `À mon parent, ${fullName}`;
    if (lienType?.includes('Enfant')) return `À mon enfant, ${fullName}`;
    if (lienType?.includes('Fratrie')) return `À ${prenom}`;
  }

  // Fallback
  return `En mémoire de ${fullName}`;
}
