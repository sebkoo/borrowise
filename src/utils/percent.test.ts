import { formatPercent } from './percent';

describe('formatPercent', () => {
  it('formats a rate with two decimal places and a percent sign', () => {
    expect(formatPercent(3.706)).toBe('3.71%');
  });

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('0.00%');
  });

  it('keeps the sign for negative values', () => {
    expect(formatPercent(-1.25)).toBe('-1.25%');
  });
});
