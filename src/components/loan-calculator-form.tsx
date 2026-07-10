import { StyleSheet, TextInput, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLoanCalculator } from '@/hooks/use-loan-calculator';
import { formatCurrency } from '@/utils/currency';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export function LoanCalculatorForm() {
  const theme = useTheme();
  const {
    principalInput,
    aprInput,
    termInput,
    setPrincipalInput,
    setAprInput,
    setTermInput,
    result,
    error,
  } = useLoanCalculator();

  const inputStyle = [
    styles.input,
    { color: theme.text, backgroundColor: theme.backgroundElement },
  ];

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Add a loan</ThemedText>

      <View style={styles.field}>
        <ThemedText type="smallBold">Principal ($)</ThemedText>
        <TextInput
          accessibilityLabel="Principal amount in dollars"
          keyboardType="decimal-pad"
          placeholder="e.g. 10000"
          placeholderTextColor={theme.textSecondary}
          value={principalInput}
          onChangeText={setPrincipalInput}
          style={inputStyle}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">APR (%)</ThemedText>
        <TextInput
          accessibilityLabel="Annual percentage rate"
          keyboardType="decimal-pad"
          placeholder="e.g. 5"
          placeholderTextColor={theme.textSecondary}
          value={aprInput}
          onChangeText={setAprInput}
          style={inputStyle}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Term (months)</ThemedText>
        <TextInput
          accessibilityLabel="Loan term in months"
          keyboardType="number-pad"
          placeholder="e.g. 12"
          placeholderTextColor={theme.textSecondary}
          value={termInput}
          onChangeText={setTermInput}
          style={inputStyle}
        />
      </View>

      {error && (
        <ThemedText type="small" themeColor="textSecondary" accessibilityRole="alert">
          {error}
        </ThemedText>
      )}

      {result && (
        <ThemedView type="backgroundElement" style={styles.result}>
          <ThemedText type="small" themeColor="textSecondary">
            Monthly payment
          </ThemedText>
          <ThemedText type="title" style={styles.paymentValue}>
            {formatCurrency(result.monthlyPayment)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Total interest
          </ThemedText>
          <ThemedText type="smallBold">{formatCurrency(result.totalInterest)}</ThemedText>
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.three,
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
  result: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  paymentValue: {
    fontSize: 36,
    lineHeight: 40,
  },
});
