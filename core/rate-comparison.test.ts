import { computeRateDifferencePp } from './rate-comparison';

describe('computeRateDifferencePp', () => {
  it('returns a positive difference when the APR is above the benchmark', () => {
    expect(computeRateDifferencePp(7.5, 5.25)).toBe(2.25);
  });

  it('returns a negative difference when the APR is below the benchmark', () => {
    expect(computeRateDifferencePp(4, 5.25)).toBe(-1.25);
  });

  it('returns 0 when the APR exactly matches the benchmark', () => {
    expect(computeRateDifferencePp(5.25, 5.25)).toBe(0);
  });

  it('rounds the difference to two decimal places', () => {
    expect(computeRateDifferencePp(7.111, 5)).toBe(2.11);
  });
});
