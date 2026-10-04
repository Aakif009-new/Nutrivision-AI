import { AnalysisResponse } from './backendClient';

const DB_NAME = 'nutrivision_db';
const STORE_NAME = 'analysis_store';
const KEY = 'latest_analysis';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// In-memory global fallback
let memoryFallback: AnalysisResponse | null = null;

export async function saveLatestAnalysis(data: AnalysisResponse): Promise<void> {
  memoryFallback = data;

  // 1. Try IndexedDB (Unlimited quota on modern mobile & desktop browsers)
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return;
  } catch (err) {
    console.warn('[Storage] IndexedDB write failed, attempting sessionStorage fallback:', err);
  }

  // 2. Safe sessionStorage fallback
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('nutrivision_latest_analysis', JSON.stringify(data));
    } catch {
      try {
        // Trim large base64 visual steps if mobile storage quota is strict
        const trimmed = {
          ...data,
          visual_steps: {},
          cv_analysis_overlay: undefined,
        };
        sessionStorage.setItem('nutrivision_latest_analysis', JSON.stringify(trimmed));
      } catch (finalErr) {
        console.warn('[Storage] Stored in memory fallback:', finalErr);
      }
    }
  }
}

export async function getLatestAnalysis(): Promise<AnalysisResponse | null> {
  // 1. Try IndexedDB
  try {
    const db = await openDB();
    const data = await new Promise<AnalysisResponse | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    if (data) return data;
  } catch (err) {
    console.warn('[Storage] IndexedDB read failed, trying sessionStorage:', err);
  }

  // 2. Try sessionStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem('nutrivision_latest_analysis');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('[Storage] Error reading sessionStorage', e);
    }
  }

  // 3. Fallback to in-memory
  return memoryFallback;
}
