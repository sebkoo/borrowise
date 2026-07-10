/**
 * Rounds a non-negative dollar amount to the nearest cent (round-half-up).
 *
 * The `Number.EPSILON` nudge corrects for binary floating-point values that
 * land a hair below the true `.5` boundary (e.g. `1.005` is actually stored
 * as `1.00499999999999989...`), which would otherwise round down instead of up.
 */
export function roundCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
