import { formatCurrency } from './currency';

describe('formatCurrency', () => {
  it('formats a dollar amount with two decimal places and a thousands separator', () => {
    expect(formatCurrency(1199.1)).toBe('$1,199.10');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});
