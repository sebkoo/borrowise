import { StyleSheet, TextInput, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useMarketDashboard } from '@/hooks/use-market-dashboard';
import { formatPercent } from '@/utils/percent';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

const FRED_SERIES_LABEL = 'FRED 24-month personal loan average';

export function MarketDashboard() {
  const theme = useTheme();
  const { fiscalData, fred, comparisonAprInput, setComparisonAprInput, differencePp } =
    useMarketDashboard();

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <ThemedText type="subtitle">U.S. Treasury average rate</ThemedText>

        {fiscalData.status === 'loading' && <ThemedText type="small">Loading…</ThemedText>}

        {fiscalData.status === 'error' && (
          <ThemedText type="small" themeColor="textSecondary" accessibilityRole="alert">
            {fiscalData.message}
          </ThemedText>
        )}

        {fiscalData.status === 'ready' && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="title" style={styles.rateValue}>
              {formatPercent(fiscalData.snapshot.averageRatePercent)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {fiscalData.snapshot.securityDesc} as of {fiscalData.snapshot.recordDate}
            </ThemedText>
            {fiscalData.stale && (
              <ThemedText type="smallBold" themeColor="textSecondary">
                Stale — showing the last cached value while offline
              </ThemedText>
            )}
          </ThemedView>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Compare your rate</ThemedText>

        {fred.status === 'loading' && <ThemedText type="small">Loading…</ThemedText>}

        {fred.status === 'error' && (
          <ThemedText type="small" themeColor="textSecondary" accessibilityRole="alert">
            {fred.message}
          </ThemedText>
        )}

        {fred.status === 'missing-key' && (
          <ThemedText type="small" themeColor="textSecondary">
            Add a FRED_API_KEY to your .env (see .env.example) to compare your rate against the{' '}
            {FRED_SERIES_LABEL}.
          </ThemedText>
        )}

        {fred.status === 'ready' && (
          <>
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="title" style={styles.rateValue}>
                {formatPercent(fred.observation.value)}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {FRED_SERIES_LABEL} as of {fred.observation.date}
              </ThemedText>
            </ThemedView>

            <View style={styles.field}>
              <ThemedText type="smallBold">Your APR (%)</ThemedText>
              <TextInput
                accessibilityLabel="Your APR for comparison"
                keyboardType="decimal-pad"
                placeholder="e.g. 12"
                placeholderTextColor={theme.textSecondary}
                value={comparisonAprInput}
                onChangeText={setComparisonAprInput}
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: theme.backgroundElement },
                ]}
              />
            </View>

            {differencePp !== null && (
              <ThemedText type="default">
                Your rate is {Math.abs(differencePp).toFixed(2)} pp{' '}
                {differencePp >= 0 ? 'above' : 'below'} the {FRED_SERIES_LABEL}.
              </ThemedText>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.four,
  },
  section: {
    width: '100%',
    gap: Spacing.two,
  },
  card: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  rateValue: {
    fontSize: 36,
    lineHeight: 40,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
});
