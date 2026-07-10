import Constants from 'expo-constants';

/**
 * FRED_API_KEY reaches the client bundle via app.config.js -> extra.fredApiKey
 * (it isn't EXPO_PUBLIC_-prefixed, so Metro won't inline it automatically).
 * Returns undefined rather than '' so callers can use a single falsy check.
 */
export function getFredApiKey(): string | undefined {
  const key = Constants.expoConfig?.extra?.fredApiKey;
  return typeof key === 'string' && key.length > 0 ? key : undefined;
}
