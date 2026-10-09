/**
 * IndexedDB storage engine for local desktop video files and PDF documents.
 * Allows persisting large media files (up to hundreds of MBs) safely in the browser sandbox
 * without overflowing localStorage quotas.
 */

const DB_NAME = 'PathfinderMediaDB';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';

interface StoredMedia {
  id: string;
  name: string;
  type: string;
  size: number;
  data: Blob;
  createdAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaFile(id: string, file: File | Blob, name: string): Promise<string> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record: StoredMedia = {
      id,
      name,
      type: file.type,
      size: file.size,
      data: file,
      createdAt: new Date().toISOString(),
    };

    const req = store.put(record);
    req.onsuccess = () => resolve(URL.createObjectURL(file));
    req.onerror = () => reject(req.error);
  });
}

export async function getMediaUrl(id: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);

    req.onsuccess = () => {
      if (req.result && req.result.data) {
        resolve(URL.createObjectURL(req.result.data));
      } else {
        resolve(null);
      }
    };
    req.onerror = () => resolve(null);
  });
}

export async function deleteMediaFile(id: string): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => resolve(false);
  });
}
