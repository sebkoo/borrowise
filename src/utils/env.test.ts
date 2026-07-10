import Constants from 'expo-constants';

import { getFredApiKey } from './env';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: {} } },
}));

describe('getFredApiKey', () => {
  it('returns the key when present in expo config extra', () => {
    (Constants as unknown as { expoConfig: { extra: Record<string, unknown> } }).expoConfig.extra =
      { fredApiKey: 'test-key-123' };

    expect(getFredApiKey()).toBe('test-key-123');
  });

  it('returns undefined when extra.fredApiKey is an empty string', () => {
    (Constants as unknown as { expoConfig: { extra: Record<string, unknown> } }).expoConfig.extra =
      { fredApiKey: '' };

    expect(getFredApiKey()).toBeUndefined();
  });

  it('returns undefined when extra.fredApiKey is missing entirely', () => {
    (Constants as unknown as { expoConfig: { extra: Record<string, unknown> } }).expoConfig.extra =
      {};

    expect(getFredApiKey()).toBeUndefined();
  });

  it('returns undefined when expoConfig itself is null', () => {
    (Constants as unknown as { expoConfig: unknown }).expoConfig = null;

    expect(getFredApiKey()).toBeUndefined();
  });
});
