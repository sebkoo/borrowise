/**
 * U.S. Treasury FiscalData client (no-auth tier).
 *
 * Endpoint: the "Average Interest Rates on U.S. Treasury Securities" v2 dataset
 * (https://fiscaldata.treasury.gov/datasets/average-interest-rates-treasury-securities/average-interest-rates-on-u-s-treasury-securities),
 * sorted by `record_date` descending with `page[size]=1` to fetch only the single
 * most recently published record. No API key required.
 */

export interface AverageRateSnapshot {
  averageRatePercent: number;
  securityDesc: string;
  recordDate: string;
  fetchedAt: string;
}

export interface FiscalDataReading {
  snapshot: AverageRateSnapshot;
  stale: boolean;
}

export interface RateCache {
  get(): AverageRateSnapshot | null;
  set(snapshot: AverageRateSnapshot): void;
}

export class FiscalDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FiscalDataError';
  }
}

const ENDPOINT =
  'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates' +
  '?sort=-record_date&page%5Bsize%5D=1';

export async function fetchAverageInterestRate(
  cache?: RateCache,
  fetchImpl: typeof fetch = fetch,
): Promise<FiscalDataReading> {
  try {
    const response = await fetchImpl(ENDPOINT);
    if (!response.ok) {
      throw new FiscalDataError(`FiscalData request failed with status ${response.status}`);
    }

    const snapshot = parseSnapshot(await response.json());
    cache?.set(snapshot);
    return { snapshot, stale: false };
  } catch (err) {
    const cached = cache?.get();
    if (cached) {
      return { snapshot: cached, stale: true };
    }
    if (err instanceof FiscalDataError) {
      throw err;
    }
    throw new FiscalDataError('Unable to reach FiscalData and no cached rate is available.');
  }
}

function parseSnapshot(payload: unknown): AverageRateSnapshot {
  const record = (payload as { data?: unknown[] })?.data?.[0] as
    { record_date?: unknown; avg_interest_rate_amt?: unknown; security_desc?: unknown } | undefined;

  const averageRatePercent = Number(record?.avg_interest_rate_amt);

  if (!record || typeof record.record_date !== 'string' || !Number.isFinite(averageRatePercent)) {
    throw new FiscalDataError('FiscalData returned a malformed payload.');
  }

  return {
    averageRatePercent,
    securityDesc: typeof record.security_desc === 'string' ? record.security_desc : 'Unknown',
    recordDate: record.record_date,
    fetchedAt: new Date().toISOString(),
  };
}
