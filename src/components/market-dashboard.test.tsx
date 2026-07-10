import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { fetchAverageInterestRate } from '../../integration/fiscaldata';
import { fetchFredSeries } from '../../integration/fred';
import { getFredApiKey } from '../utils/env';
import { MarketDashboard } from './market-dashboard';

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

describe('MarketDashboard', () => {
  it('shows a loading state for both sections before data arrives', async () => {
    mockFetchAverageInterestRate.mockReturnValue(new Promise(() => {}));
    mockFetchFredSeries.mockReturnValue(new Promise(() => {}));

    await render(<MarketDashboard />);

    expect(screen.getAllByText('Loading…').length).toBeGreaterThanOrEqual(2);
  });

  it('shows the FiscalData average rate and record date once loaded', async () => {
    mockFetchAverageInterestRate.mockResolvedValue({ snapshot: fiscalSnapshot, stale: false });
    mockFetchFredSeries.mockReturnValue(new Promise(() => {}));

    await render(<MarketDashboard />);

    await waitFor(() => expect(screen.getByText('3.71%')).toBeOnTheScreen());
    expect(screen.getByText(/2026-06-30/)).toBeOnTheScreen();
    expect(screen.queryByText(/stale/i)).toBeNull();
  });

  it('shows a stale badge when the FiscalData reading came from the offline cache', async () => {
    mockFetchAverageInterestRate.mockResolvedValue({ snapshot: fiscalSnapshot, stale: true });
    mockFetchFredSeries.mockReturnValue(new Promise(() => {}));

    await render(<MarketDashboard />);

    await waitFor(() => expect(screen.getByText(/stale/i)).toBeOnTheScreen());
  });

  it('shows an alert when the FiscalData fetch fails with nothing cached', async () => {
    mockFetchAverageInterestRate.mockRejectedValue(new Error('Unable to reach FiscalData.'));
    mockFetchFredSeries.mockReturnValue(new Promise(() => {}));

    await render(<MarketDashboard />);

    await waitFor(() => expect(screen.getByRole('alert')).toBeOnTheScreen());
    expect(screen.getByText('Unable to reach FiscalData.')).toBeOnTheScreen();
  });

  it('shows a graceful, non-crashing empty state when the FRED API key is missing', async () => {
    mockGetFredApiKey.mockReturnValue(undefined);
    mockFetchAverageInterestRate.mockReturnValue(new Promise(() => {}));
    mockFetchFredSeries.mockResolvedValue({ status: 'missing-key' });

    await render(<MarketDashboard />);

    await waitFor(() => expect(screen.getByText(/FRED_API_KEY/)).toBeOnTheScreen());
  });

  it('shows the pp comparison once a comparison APR is entered', async () => {
    mockFetchAverageInterestRate.mockReturnValue(new Promise(() => {}));
    mockFetchFredSeries.mockResolvedValue({ status: 'ok', observation: fredObservation });

    await render(<MarketDashboard />);

    await waitFor(() => expect(screen.getByText('11.86%')).toBeOnTheScreen());
    expect(screen.queryByText(/above|below/)).toBeNull();

    await fireEvent.changeText(screen.getByLabelText('Your APR for comparison'), '14');

    expect(
      screen.getByText(/2\.14 pp above the FRED 24-month personal loan average/),
    ).toBeOnTheScreen();
  });

  it('phrases a below-average comparison correctly', async () => {
    mockFetchAverageInterestRate.mockReturnValue(new Promise(() => {}));
    mockFetchFredSeries.mockResolvedValue({ status: 'ok', observation: fredObservation });

    await render(<MarketDashboard />);

    await waitFor(() => expect(screen.getByText('11.86%')).toBeOnTheScreen());
    await fireEvent.changeText(screen.getByLabelText('Your APR for comparison'), '9');

    expect(
      screen.getByText(/2\.86 pp below the FRED 24-month personal loan average/),
    ).toBeOnTheScreen();
  });
});
