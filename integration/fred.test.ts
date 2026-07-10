import { FredError, fetchFredSeries } from './fred';

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

const validPayload = {
  observations: [{ date: '2026-05-01', value: '11.99' }],
};

describe('fetchFredSeries', () => {
  it('returns a missing-key result without calling fetch when no API key is provided', async () => {
    const fetchImpl = jest.fn();

    const reading = await fetchFredSeries('TERMCBPER24NS', undefined, fetchImpl);

    expect(reading).toEqual({ status: 'missing-key' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns a missing-key result for an empty-string API key', async () => {
    const fetchImpl = jest.fn();

    const reading = await fetchFredSeries('TERMCBPER24NS', '', fetchImpl);

    expect(reading).toEqual({ status: 'missing-key' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('signs the request with the API key as a query param and returns the latest observation', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(validPayload));

    const reading = await fetchFredSeries('TERMCBPER24NS', 'test-key-123', fetchImpl);

    expect(reading).toEqual({
      status: 'ok',
      observation: {
        seriesId: 'TERMCBPER24NS',
        value: 11.99,
        date: '2026-05-01',
        fetchedAt: expect.any(String),
      },
    });

    const calledUrl = new URL(fetchImpl.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('series_id')).toBe('TERMCBPER24NS');
    expect(calledUrl.searchParams.get('api_key')).toBe('test-key-123');
    expect(calledUrl.searchParams.get('sort_order')).toBe('desc');
    expect(calledUrl.searchParams.get('limit')).toBe('1');
  });

  it('throws FredError on an HTTP error response', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({}, false, 401));

    await expect(fetchFredSeries('TERMCBPER24NS', 'test-key-123', fetchImpl)).rejects.toThrow(
      FredError,
    );
  });

  it('throws FredError when observations are empty', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ observations: [] }));

    await expect(fetchFredSeries('TERMCBPER24NS', 'test-key-123', fetchImpl)).rejects.toThrow(
      FredError,
    );
  });

  it('throws FredError when the latest observation value is FRED\'s missing-data marker "."', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(jsonResponse({ observations: [{ date: '2026-05-01', value: '.' }] }));

    await expect(fetchFredSeries('TERMCBPER24NS', 'test-key-123', fetchImpl)).rejects.toThrow(
      FredError,
    );
  });
});
