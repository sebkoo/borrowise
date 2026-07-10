/**
 * Percentage-point difference between a personal APR and a benchmark rate
 * (US-05: "your rate is X pp above/below the <series> average"). Positive =
 * above the benchmark, negative = below. Rounded like `roundCents` but kept
 * separate from `money.ts` since percentage points aren't a monetary value.
 */
export function computeRateDifferencePp(myAprPercent: number, benchmarkAprPercent: number): number {
  return Math.round((myAprPercent - benchmarkAprPercent + Number.EPSILON) * 100) / 100;
}
