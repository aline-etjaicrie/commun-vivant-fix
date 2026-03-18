export interface Mp3Track {
  id: string;
  title: string;
  artist: string;
  mood: string;
  url: string;
}

export const MEMORIAL_MP3_LIBRARY: Mp3Track[] = [
  {
    id: 'solennite-piano',
    title: 'Solennite Piano',
    artist: 'Archive Instrumental',
    mood: 'Contemplatif',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'douce-lumiere',
    title: 'Douce Lumiere',
    artist: 'Archive Instrumental',
    mood: 'Apaisant',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'presence-sobre',
    title: 'Presence Sobre',
    artist: 'Archive Instrumental',
    mood: 'Sobre',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'aurore-memoire',
    title: 'Aurore Memoire',
    artist: 'Archive Instrumental',
    mood: 'Lumineux',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: 'recueillement',
    title: 'Recueillement',
    artist: 'Archive Instrumental',
    mood: 'Intime',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
];

export function findMp3Track(trackId?: string): Mp3Track | null {
  if (!trackId) return null;
  return MEMORIAL_MP3_LIBRARY.find((t) => t.id === trackId) || null;
}
