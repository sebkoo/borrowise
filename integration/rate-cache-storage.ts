import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AverageRateSnapshot, RateCache } from './fiscaldata';

const STORAGE_KEY = 'borrowise:fiscaldata:average-rate';

type Storage = Pick<typeof AsyncStorage, 'getItem' | 'setItem'>;

/**
 * AsyncStorage-backed RateCache. AsyncStorage is inherently async, but
 * RateCache's get()/set() are synchronous (integration/fiscaldata.ts's
 * fetchAverageInterestRate calls them inline, no await) -- so this adapter
 * hydrates once from disk into an in-memory value, then serves get()
 * synchronously from memory. set() persists in the background
 * (fire-and-forget); callers must `await hydrate()` once before first use.
 */
export class PersistentRateCache implements RateCache {
  private snapshot: AverageRateSnapshot | null = null;

  constructor(private readonly storage: Storage = AsyncStorage) {}

  async hydrate(): Promise<void> {
    try {
      const raw = await this.storage.getItem(STORAGE_KEY);
      this.snapshot = raw ? (JSON.parse(raw) as AverageRateSnapshot) : null;
    } catch {
      this.snapshot = null;
    }
  }

  get(): AverageRateSnapshot | null {
    return this.snapshot;
  }

  set(snapshot: AverageRateSnapshot): void {
    this.snapshot = snapshot;
    void this.storage.setItem(STORAGE_KEY, JSON.stringify(snapshot)).catch(() => {});
  }
}
