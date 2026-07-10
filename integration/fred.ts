/**
 * FRED (Federal Reserve Economic Data) client (apiKey tier).
 *
 * Auth model: `api_key` passed as a query parameter (FRED has no header-based
 * auth option). A missing key is a distinct, non-throwing outcome — US-05's AC
 * requires a graceful empty state explaining setup, not a crash — while every
 * other failure (HTTP error, malformed payload) throws a FredError.
 */

const BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

export class FredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FredError';
  }
}

export interface FredObservation {
  seriesId: string;
  value: number;
  date: string;
  fetchedAt: string;
}

export type FredReading =
  { status: 'ok'; observation: FredObservation } | { status: 'missing-key' };

export async function fetchFredSeries(
  seriesId: string,
  apiKey: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<FredReading> {
  if (!apiKey) {
    return { status: 'missing-key' };
  }

  const url = new URL(BASE_URL);
  url.searchParams.set('series_id', seriesId);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('file_type', 'json');
  url.searchParams.set('sort_order', 'desc');
  url.searchParams.set('limit', '1');

  const response = await fetchImpl(url.toString());
  if (!response.ok) {
    throw new FredError(`FRED request failed with status ${response.status}`);
  }

  const observation = parseObservation(seriesId, await response.json());
  return { status: 'ok', observation };
}

function parseObservation(seriesId: string, payload: unknown): FredObservation {
  const latest = (payload as { observations?: unknown[] })?.observations?.[0] as
    { date?: unknown; value?: unknown } | undefined;

  const value = Number(latest?.value);

  if (!latest || typeof latest.date !== 'string' || !Number.isFinite(value)) {
    throw new FredError(`FRED returned no usable observation for series ${seriesId}.`);
  }

  return {
    seriesId,
    value,
    date: latest.date,
    fetchedAt: new Date().toISOString(),
  };
}
