import { render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/(tabs)/index';

describe('HomeScreen', () => {
  it('renders the app name, tagline, and the not-financial-advice disclaimer', async () => {
    await render(<HomeScreen />);

    expect(screen.getByText('Borrowise')).toBeOnTheScreen();
    expect(screen.getByText('See your loans clearly. Borrow wisely.')).toBeOnTheScreen();
    expect(screen.getByText('Educational tool — not financial advice.')).toBeOnTheScreen();
  });
});
