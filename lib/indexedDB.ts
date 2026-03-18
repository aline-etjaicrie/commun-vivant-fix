// Gestion IndexedDB pour les photos

const DB_NAME = 'et-jai-crie-db';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

export interface PhotoRecord {
  id: string;
  memorialId: string;
  type: 'profile' | 'gallery' | 'audio';
  blob: Blob;
  nom?: string;
  description?: string;
  date?: string;
}

// Ouvrir la base de données
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('memorialId', 'memorialId', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

// Sauvegarder une photo
export async function savePhoto(photo: PhotoRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(photo);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Récupérer une photo
export async function getPhoto(id: string): Promise<PhotoRecord | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

// Récupérer toutes les photos d'un mémorial
export async function getPhotosByMemorial(memorialId: string): Promise<PhotoRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('memorialId');
    const request = index.getAll(memorialId);
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// Supprimer une photo
export async function deletePhoto(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Supprimer toutes les photos d'un mémorial
export async function deletePhotosByMemorial(memorialId: string): Promise<void> {
  const photos = await getPhotosByMemorial(memorialId);
  await Promise.all(photos.map(photo => deletePhoto(photo.id)));
}

// Convertir un Blob en URL temporaire
export function blobToURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

// Convertir un File en Blob
export function fileToBlob(file: File): Promise<Blob> {
  return Promise.resolve(file);
}
