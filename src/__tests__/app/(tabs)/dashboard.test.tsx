import { render, screen } from '@testing-library/react-native';

import DashboardScreen from '@/app/(tabs)/dashboard';

jest.mock('../../../../integration/fiscaldata');
jest.mock('../../../../integration/fred');
jest.mock('../../../utils/env');
jest.mock('../../../../integration/rate-cache-storage', () => ({
  PersistentRateCache: jest.fn().mockImplementation(() => ({
    hydrate: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
    set: jest.fn(),
  })),
}));

describe('DashboardScreen', () => {
  it('renders the title and the not-financial-advice disclaimer', async () => {
    await render(<DashboardScreen />);

    expect(screen.getByText('Market rates')).toBeOnTheScreen();
    expect(screen.getByText('Educational tool — not financial advice.')).toBeOnTheScreen();
  });
});
