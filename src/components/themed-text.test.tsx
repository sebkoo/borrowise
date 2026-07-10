import { render, screen } from '@testing-library/react-native';

import { ThemedText, type ThemedTextProps } from './themed-text';

const TYPES: NonNullable<ThemedTextProps['type']>[] = [
  'default',
  'title',
  'small',
  'smallBold',
  'subtitle',
  'link',
  'linkPrimary',
  'code',
];

describe('ThemedText', () => {
  it.each(TYPES)('renders the %s type variant', async (type) => {
    await render(<ThemedText type={type}>Hello</ThemedText>);

    expect(screen.getByText('Hello')).toBeOnTheScreen();
  });

  it('falls back to the theme text color when themeColor is not provided', async () => {
    await render(<ThemedText>Hello</ThemedText>);

    expect(screen.getByText('Hello')).toBeOnTheScreen();
  });

  it('uses the given themeColor', async () => {
    await render(<ThemedText themeColor="textSecondary">Hello</ThemedText>);

    expect(screen.getByText('Hello')).toBeOnTheScreen();
  });
});
