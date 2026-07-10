import { act, renderHook, waitFor } from '@testing-library/react-native';

import { fetchAverageInterestRate } from '../../integration/fiscaldata';
import { fetchFredSeries } from '../../integration/fred';
import { getFredApiKey } from '../utils/env';
import { useMarketDashboard } from './use-market-dashboard';

jest.mock('../../integration/fiscaldata');
jest.mock('../../integration/fred');
jest.mock('../utils/env');
jest.mock('../../integration/rate-cache-storage', () => ({
  PersistentRateCache: jest.fn().mockImplementation(() => ({
    hydrate: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
    set: jest.fn(),
  })),
}));

const mockFetchAverageInterestRate = fetchAverageInterestRate as jest.Mock;
const mockFetchFredSeries = fetchFredSeries as jest.Mock;
const mockGetFredApiKey = getFredApiKey as jest.Mock;

const fiscalSnapshot = {
  averageRatePercent: 3.706,
  securityDesc: 'Treasury Bills',
  recordDate: '2026-06-30',
  fetchedAt: '2026-07-10T19:08:37.000Z',
};

const fredObservation = {
  seriesId: 'TERMCBPER24NS',
  value: 11.86,
  date: '2026-05-01',
  fetchedAt: '2026-07-10T19:13:53.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetFredApiKey.mockReturnValue('test-key-123');
});

describe('useMarketDashboard', () => {
  it('starts in a loading state for both data sources', async () => {
    mockFetchAverageInterestRate.mockReturnValue(new Promise(() => {}));
    mockFetchFredSeries.mockReturnValue(new Promise(() => {}));

    const { result } = await renderHook(() => useMarketDashboard());

    expect(result.current.fiscalData).toEqual({ status: 'loading' });
    expect(result.current.fred).toEqual({ status: 'loading' });
  });

  it('surfaces a fresh FiscalData reading', async () => {
    mockFetchAverageInterestRate.mockResolvedValue({ snapshot: fiscalSnapshot, stale: false });
    mockFetchFredSeries.mockReturnValue(new Promise(() => {}));

    const { result } = await renderHook(() => useMarketDashboard());

    await waitFor(() =>
      expect(result.current.fiscalData).toEqual({
        status: 'ready',
        snapshot: fiscalSnapshot,
        stale: false,
      }),
    );
  });

  it('marks the FiscalData reading stale when the client falls back to cache', async () => {
    mockFetchAverageInterestRate.mockResolvedValue({ snapshot: fiscalSnapshot, stale: true });
    mockFetchFredSeries.mockReturnValue(new Promise(() => {}));

    const { result } = await renderHook(() => useMarketDashboard());

    await waitFor(() => expect(result.current.fiscalData).toMatchObject({ stale: true }));
  });

  it('surfaces a FiscalData error message when the client throws with nothing cached', async () => {
    mockFetchAverageInterestRate.mockRejectedValue(new Error('Unable to reach FiscalData.'));
    mockFetchFredSeries.mockReturnValue(new Promise(() => {}));

    const { result } = await renderHook(() => useMarketDashboard());

    await waitFor(() =>
      expect(result.current.fiscalData).toEqual({
        status: 'error',
        message: 'Unable to reach FiscalData.',
      }),
    );
  });

  it('surfaces a fresh FRED reading', async () => {
    mockFetchAverageInterestRate.mockReturnValue(new Promise(() => {}));
    mockFetchFredSeries.mockResolvedValue({ status: 'ok', observation: fredObservation });

    const { result } = await renderHook(() => useMarketDashboard());

    await waitFor(() =>
      expect(result.current.fred).toEqual({ status: 'ready', observation: fredObservation }),
    );
  });

  it('surfaces a graceful missing-key state without crashing, per US-05', async () => {
    mockGetFredApiKey.mockReturnValue(undefined);
    mockFetchAverageInterestRate.mockReturnValue(new Promise(() => {}));
    mockFetchFredSeries.mockResolvedValue({ status: 'missing-key' });

    const { result } = await renderHook(() => useMarketDashboard());

    await waitFor(() => expect(result.current.fred).toEqual({ status: 'missing-key' }));
  });

  it('surfaces a FRED error message when the client throws', async () => {
    mockFetchAverageInterestRate.mockReturnValue(new Promise(() => {}));
    mockFetchFredSeries.mockRejectedValue(new Error('FRED request failed with status 500'));

    const { result } = await renderHook(() => useMarketDashboard());

    await waitFor(() =>
      expect(result.current.fred).toEqual({
        status: 'error',
        message: 'FRED request failed with status 500',
      }),
    );
  });

  it('computes the pp difference once the FRED reading is ready and a comparison APR is entered', async () => {
    mockFetchAverageInterestRate.mockReturnValue(new Promise(() => {}));
    mockFetchFredSeries.mockResolvedValue({ status: 'ok', observation: fredObservation });

    const { result } = await renderHook(() => useMarketDashboard());

    await waitFor(() => expect(result.current.fred.status).toBe('ready'));

    await act(() => result.current.setComparisonAprInput('14'));

    expect(result.current.differencePp).toBe(2.14);
  });

  it('returns a null difference when no comparison APR has been entered yet', async () => {
    mockFetchAverageInterestRate.mockReturnValue(new Promise(() => {}));
    mockFetchFredSeries.mockResolvedValue({ status: 'ok', observation: fredObservation });

    const { result } = await renderHook(() => useMarketDashboard());

    await waitFor(() => expect(result.current.fred.status).toBe('ready'));

    expect(result.current.differencePp).toBeNull();
  });

  it('returns a null difference for non-numeric comparison input', async () => {
    mockFetchAverageInterestRate.mockReturnValue(new Promise(() => {}));
    mockFetchFredSeries.mockResolvedValue({ status: 'ok', observation: fredObservation });

    const { result } = await renderHook(() => useMarketDashboard());

    await waitFor(() => expect(result.current.fred.status).toBe('ready'));

    await act(() => result.current.setComparisonAprInput('abc'));

    expect(result.current.differencePp).toBeNull();
  });
});
