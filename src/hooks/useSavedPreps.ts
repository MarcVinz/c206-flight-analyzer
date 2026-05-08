import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MassItem } from '@/types/aircraft';

export interface PrepSnapshot {
  id: string;
  name: string;
  savedAt: string;
  // Flight info
  pilotName: string;
  flightDate: string;
  flightType: 'private' | 'instruction';
  instructorName: string;
  selectedAircraft: string;
  // Route
  routeFrom: string;
  routeTo: string;
  tripDistance: number;
  // Mass & fuel
  massItems: MassItem[];
  fuelGallons: number;
  reserveMinutes: number;
  // Performance
  altitude: number;
  qnh: number;
  oat: number;
}

type SnapshotData = Omit<PrepSnapshot, 'id' | 'name' | 'savedAt'>;

const CACHE_KEY = 'c206-saved-preps-cache-v1';
const COLLECTION = 'c206_saved_preps';

function loadCache(): PrepSnapshot[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function updateCache(preps: PrepSnapshot[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(preps));
  } catch {
    // ignore
  }
}

export function useSavedPreps() {
  const [savedPreps, setSavedPreps] = useState<PrepSnapshot[]>(loadCache);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, COLLECTION),
      orderBy('savedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const preps: PrepSnapshot[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name,
            savedAt: data.savedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
            ...(data.snapshot as SnapshotData),
          };
        });
        setSavedPreps(preps);
        updateCache(preps);
        setIsLoading(false);
        setIsOffline(false);
      },
      () => {
        setIsLoading(false);
        setIsOffline(true);
      }
    );

    return () => unsubscribe();
  }, []);

  const savePrep = async (name: string, snapshot: SnapshotData) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // JSON round-trip strips undefined values that Firestore rejects
      const cleanSnapshot = JSON.parse(JSON.stringify(snapshot));
      await addDoc(collection(db, COLLECTION), {
        name: name.trim(),
        savedAt: serverTimestamp(),
        snapshot: cleanSnapshot,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setSaveError(msg);
      console.error('[useSavedPreps] savePrep error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const deletePrep = async (id: string) => {
    await deleteDoc(doc(db, COLLECTION, id));
  };

  return { savedPreps, isLoading, isSaving, saveError, isOffline, savePrep, deletePrep };
}
