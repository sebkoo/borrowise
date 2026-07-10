import { PersistentRateCache } from './rate-cache-storage';

const snapshot = {
  averageRatePercent: 3.706,
  securityDesc: 'Treasury Bills',
  recordDate: '2026-06-30',
  fetchedAt: '2026-07-10T19:08:37.000Z',
};

function makeStorage(overrides: Partial<{ getItem: jest.Mock; setItem: jest.Mock }> = {}) {
  return {
    getItem: overrides.getItem ?? jest.fn().mockResolvedValue(null),
    setItem: overrides.setItem ?? jest.fn().mockResolvedValue(undefined),
  };
}

describe('PersistentRateCache', () => {
  it('returns null before hydration', () => {
    const cache = new PersistentRateCache(makeStorage());

    expect(cache.get()).toBeNull();
  });

  it('hydrates the last-persisted snapshot from storage', async () => {
    const storage = makeStorage({ getItem: jest.fn().mockResolvedValue(JSON.stringify(snapshot)) });
    const cache = new PersistentRateCache(storage);

    await cache.hydrate();

    expect(cache.get()).toEqual(snapshot);
    expect(storage.getItem).toHaveBeenCalledWith('borrowise:fiscaldata:average-rate');
  });

  it('hydrates to null when nothing has been persisted yet', async () => {
    const cache = new PersistentRateCache(makeStorage());

    await cache.hydrate();

    expect(cache.get()).toBeNull();
  });

  it('hydrates to null (without throwing) if storage read fails', async () => {
    const storage = makeStorage({ getItem: jest.fn().mockRejectedValue(new Error('disk error')) });
    const cache = new PersistentRateCache(storage);

    await expect(cache.hydrate()).resolves.toBeUndefined();
    expect(cache.get()).toBeNull();
  });

  it('set() updates the in-memory value synchronously and persists it in the background', () => {
    const storage = makeStorage();
    const cache = new PersistentRateCache(storage);

    cache.set(snapshot);

    expect(cache.get()).toEqual(snapshot);
    expect(storage.setItem).toHaveBeenCalledWith(
      'borrowise:fiscaldata:average-rate',
      JSON.stringify(snapshot),
    );
  });

  it('set() does not throw synchronously even if the background persist rejects', () => {
    const storage = makeStorage({ setItem: jest.fn().mockRejectedValue(new Error('disk full')) });
    const cache = new PersistentRateCache(storage);

    expect(() => cache.set(snapshot)).not.toThrow();
    expect(cache.get()).toEqual(snapshot);
  });
});
