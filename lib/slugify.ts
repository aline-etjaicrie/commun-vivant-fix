export const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // enlève les accents
    .replace(/['’]/g, '')           // enlève apostrophes
    .replace(/[^a-z0-9]+/g, '-')    // remplace le reste par tirets
    .replace(/^-+|-+$/g, '');
