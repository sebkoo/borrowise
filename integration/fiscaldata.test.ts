import { FiscalDataError, fetchAverageInterestRate, type RateCache } from './fiscaldata';

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

function makeCache(initial: ReturnType<RateCache['get']> = null): RateCache {
  let stored = initial;
  return {
    get: () => stored,
    set: (snapshot) => {
      stored = snapshot;
    },
  };
}

const validPayload = {
  data: [
    {
      record_date: '2026-06-30',
      security_desc: 'Treasury Bills',
      avg_interest_rate_amt: '5.123',
    },
  ],
};

describe('fetchAverageInterestRate', () => {
  it('returns a fresh snapshot and caches it on success', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(validPayload));
    const cache = makeCache();

    const reading = await fetchAverageInterestRate(cache, fetchImpl);

    expect(reading.stale).toBe(false);
    expect(reading.snapshot.averageRatePercent).toBe(5.123);
    expect(reading.snapshot.securityDesc).toBe('Treasury Bills');
    expect(reading.snapshot.recordDate).toBe('2026-06-30');
    expect(cache.get()).toEqual(reading.snapshot);
  });

  it('throws FiscalDataError on an HTTP error response with no cache to fall back on', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({}, false, 500));

    await expect(fetchAverageInterestRate(makeCache(), fetchImpl)).rejects.toThrow(FiscalDataError);
  });

  it('throws FiscalDataError on a malformed payload with no cache to fall back on', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ data: [] }));

    await expect(fetchAverageInterestRate(makeCache(), fetchImpl)).rejects.toThrow(FiscalDataError);
  });

  it('falls back to the last-cached snapshot, marked stale, when the network fetch fails', async () => {
    const cachedSnapshot = {
      averageRatePercent: 4.9,
      securityDesc: 'Treasury Bills',
      recordDate: '2026-06-01',
      fetchedAt: '2026-06-01T00:00:00.000Z',
    };
    const fetchImpl = jest.fn().mockRejectedValue(new Error('network unreachable'));
    const cache = makeCache(cachedSnapshot);

    const reading = await fetchAverageInterestRate(cache, fetchImpl);

    expect(reading.stale).toBe(true);
    expect(reading.snapshot).toEqual(cachedSnapshot);
  });

  it('throws FiscalDataError when the fetch fails and there is no cached snapshot', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new Error('network unreachable'));

    await expect(fetchAverageInterestRate(makeCache(), fetchImpl)).rejects.toThrow(FiscalDataError);
  });
});
