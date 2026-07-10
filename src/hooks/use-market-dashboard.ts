import { useEffect, useMemo, useState } from 'react';

import { computeRateDifferencePp } from '../../core/rate-comparison';
import { fetchAverageInterestRate, type AverageRateSnapshot } from '../../integration/fiscaldata';
import { fetchFredSeries, type FredObservation } from '../../integration/fred';
import { PersistentRateCache } from '../../integration/rate-cache-storage';
import { getFredApiKey } from '../utils/env';

const FRED_SERIES_ID = 'TERMCBPER24NS';

export type FiscalDataState =
  | { status: 'loading' }
  | { status: 'ready'; snapshot: AverageRateSnapshot; stale: boolean }
  | { status: 'error'; message: string };

export type FredState =
  | { status: 'loading' }
  | { status: 'ready'; observation: FredObservation }
  | { status: 'missing-key' }
  | { status: 'error'; message: string };

export interface UseMarketDashboard {
  fiscalData: FiscalDataState;
  fred: FredState;
  comparisonAprInput: string;
  setComparisonAprInput: (value: string) => void;
  differencePp: number | null;
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function useMarketDashboard(): UseMarketDashboard {
  const [fiscalData, setFiscalData] = useState<FiscalDataState>({ status: 'loading' });
  const [fred, setFred] = useState<FredState>({ status: 'loading' });
  const [comparisonAprInput, setComparisonAprInput] = useState('');
  const [cache] = useState(() => new PersistentRateCache());

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await cache.hydrate();
      try {
        const reading = await fetchAverageInterestRate(cache, fetch);
        if (!cancelled) {
          setFiscalData({ status: 'ready', snapshot: reading.snapshot, stale: reading.stale });
        }
      } catch (err) {
        if (!cancelled) {
          setFiscalData({
            status: 'error',
            message: errorMessage(err, 'Unable to load Treasury rates.'),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cache]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const reading = await fetchFredSeries(FRED_SERIES_ID, getFredApiKey(), fetch);
        if (cancelled) return;

        setFred(
          reading.status === 'missing-key'
            ? { status: 'missing-key' }
            : { status: 'ready', observation: reading.observation },
        );
      } catch (err) {
        if (!cancelled) {
          setFred({
            status: 'error',
            message: errorMessage(err, 'Unable to load the FRED benchmark.'),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const differencePp = useMemo(() => {
    if (fred.status !== 'ready' || !comparisonAprInput) {
      return null;
    }
    const myApr = Number(comparisonAprInput);
    return Number.isFinite(myApr) ? computeRateDifferencePp(myApr, fred.observation.value) : null;
  }, [fred, comparisonAprInput]);

  return { fiscalData, fred, comparisonAprInput, setComparisonAprInput, differencePp };
}
