// Fonction pour adapter les pronoms selon le genre choisi

export function adaptPronom(
  genre: 'Elle' | 'Il' | 'Sans genre spécifié' | undefined,
  type: 'sujet' | 'complement' | 'possessif'
): string {
  if (!genre || genre === 'Sans genre spécifié') {
    switch (type) {
      case 'sujet':
        return 'Cette personne';
      case 'complement':
        return 'la personne';
      case 'possessif':
        return 'sa/son';
    }
  }

  if (genre === 'Elle') {
    switch (type) {
      case 'sujet':
        return 'Elle';
      case 'complement':
        return 'elle';
      case 'possessif':
        return 'sa/son';
    }
  }

  // Il
  switch (type) {
    case 'sujet':
      return 'Il';
    case 'complement':
      return 'lui';
    case 'possessif':
      return 'son/sa';
  }
}

export function adaptQuestion(question: string, genre: 'Elle' | 'Il' | 'Sans genre spécifié' | undefined): string {
  if (!genre || genre === 'Sans genre spécifié') {
    return question
      .replace(/il\/elle/gi, 'cette personne')
      .replace(/\bil\b/gi, 'cette personne')
      .replace(/\belle\b/gi, 'cette personne');
  }

  const pronom = genre === 'Elle' ? 'elle' : 'il';
  return question
    .replace(/il\/elle/gi, pronom)
    .replace(/\bil\b/gi, pronom)
    .replace(/\belle\b/gi, pronom);
}
