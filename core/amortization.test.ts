import {
  calculateMonthlyPayment,
  calculateRefinanceBreakEven,
  generateAmortizationSchedule,
} from './amortization';

describe('calculateMonthlyPayment', () => {
  it('computes the standard amortized payment for a 30-year mortgage', () => {
    // $200,000 @ 6% APR / 360mo — textbook reference value.
    expect(calculateMonthlyPayment(200000, 6, 360)).toBe(1199.1);
  });

  it('computes the payment for a short-term loan', () => {
    // $10,000 @ 5% APR / 12mo.
    expect(calculateMonthlyPayment(10000, 5, 12)).toBe(856.07);
  });

  it('divides principal evenly across the term when APR is 0, without dividing by zero', () => {
    expect(calculateMonthlyPayment(12000, 0, 24)).toBe(500);
  });

  it('throws for a non-positive principal', () => {
    expect(() => calculateMonthlyPayment(0, 5, 12)).toThrow(RangeError);
    expect(() => calculateMonthlyPayment(-100, 5, 12)).toThrow(RangeError);
  });

  it('throws for a non-positive or non-integer term', () => {
    expect(() => calculateMonthlyPayment(10000, 5, 0)).toThrow(RangeError);
    expect(() => calculateMonthlyPayment(10000, 5, -12)).toThrow(RangeError);
    expect(() => calculateMonthlyPayment(10000, 5, 12.5)).toThrow(RangeError);
  });

  it('throws for a negative APR', () => {
    expect(() => calculateMonthlyPayment(10000, -1, 12)).toThrow(RangeError);
  });
});

describe('generateAmortizationSchedule', () => {
  it('produces the full per-month schedule with principal/interest/balance reconciling to zero', () => {
    const result = generateAmortizationSchedule(10000, 5, 12);

    expect(result.monthlyPayment).toBe(856.07);
    expect(result.schedule).toHaveLength(12);

    expect(result.schedule[0]).toEqual({
      month: 1,
      payment: 856.07,
      interest: 41.67,
      principal: 814.4,
      balance: 9185.6,
    });

    // Balance strictly decreases every period.
    for (let i = 1; i < result.schedule.length; i++) {
      expect(result.schedule[i].balance).toBeLessThan(result.schedule[i - 1].balance);
    }

    const totalPrincipalPaid = result.schedule.reduce((sum, row) => sum + row.principal, 0);
    expect(Math.round(totalPrincipalPaid * 100) / 100).toBe(10000);
  });

  it('computes total interest that reconciles with the sum of the schedule', () => {
    const result = generateAmortizationSchedule(10000, 5, 12);

    expect(result.totalInterest).toBe(272.89);
    expect(result.totalPaid).toBe(10272.89);
  });

  it('absorbs rounding drift into the final payment so the ending balance is exactly zero', () => {
    const result = generateAmortizationSchedule(10000, 5, 12);
    const finalRow = result.schedule[result.schedule.length - 1];

    // The fixed schedule payment is 856.07, but 12 periods of rounded interest
    // leave a 5-cent shortfall that only the final payment can absorb.
    expect(finalRow.payment).toBe(856.12);
    expect(finalRow.payment).not.toBe(result.monthlyPayment);
    expect(finalRow.balance).toBe(0);
  });

  it('handles APR = 0 across the full schedule with zero interest every period', () => {
    const result = generateAmortizationSchedule(12000, 0, 24);

    expect(result.monthlyPayment).toBe(500);
    expect(result.totalInterest).toBe(0);
    expect(result.totalPaid).toBe(12000);
    expect(result.schedule).toHaveLength(24);
    expect(result.schedule.every((row) => row.interest === 0)).toBe(true);
    expect(result.schedule[23].balance).toBe(0);
  });

  it('shortens the term and reduces total interest when an extra payment is applied', () => {
    const baseline = generateAmortizationSchedule(10000, 5, 12);
    const withExtra = generateAmortizationSchedule(10000, 5, 12, 200);

    expect(withExtra.actualTermMonths).toBe(10);
    expect(withExtra.actualTermMonths).toBeLessThan(baseline.actualTermMonths);
    expect(withExtra.totalInterest).toBe(224.35);
    expect(baseline.totalInterest - withExtra.totalInterest).toBeCloseTo(48.54, 2);

    const finalRow = withExtra.schedule[withExtra.schedule.length - 1];
    expect(finalRow.balance).toBe(0);
    expect(finalRow.payment).toBeLessThan(baseline.monthlyPayment + 200);
  });

  it('throws for a negative extra payment', () => {
    expect(() => generateAmortizationSchedule(10000, 5, 12, -50)).toThrow(RangeError);
  });
});

describe('calculateRefinanceBreakEven', () => {
  it('returns a break-even month when the new loan is cheaper and fees are recouped', () => {
    const result = calculateRefinanceBreakEven({
      currentBalance: 300000,
      currentAprPercent: 6,
      remainingTermMonths: 300,
      newAprPercent: 4.5,
      newTermMonths: 300,
      fees: 4000,
    });

    expect(result.monthlySavings).toBe(265.4);
    expect(result.hasBreakEven).toBe(true);
    expect(result.breakEvenMonth).toBe(16);
    expect(result.lifetimeSavings).toBe(75620);
  });

  it('reports no break-even (net loss) when fees exceed lifetime savings', () => {
    // Positive monthly savings, but too little runway left to recoup the fees.
    const result = calculateRefinanceBreakEven({
      currentBalance: 300000,
      currentAprPercent: 6,
      remainingTermMonths: 6,
      newAprPercent: 4.5,
      newTermMonths: 6,
      fees: 4000,
    });

    expect(result.monthlySavings).toBeGreaterThan(0);
    expect(result.hasBreakEven).toBe(false);
    expect(result.breakEvenMonth).toBeNull();
    expect(result.lifetimeSavings).toBeLessThan(0);
  });

  it('reports no break-even (net loss) when the new rate is not actually better', () => {
    const result = calculateRefinanceBreakEven({
      currentBalance: 300000,
      currentAprPercent: 4,
      remainingTermMonths: 300,
      newAprPercent: 6,
      newTermMonths: 300,
      fees: 4000,
    });

    expect(result.monthlySavings).toBeLessThan(0);
    expect(result.hasBreakEven).toBe(false);
    expect(result.breakEvenMonth).toBeNull();
    expect(result.lifetimeSavings).toBeLessThan(0);
  });

  it('throws for non-positive fees input types outside the domain (negative fees)', () => {
    expect(() =>
      calculateRefinanceBreakEven({
        currentBalance: 300000,
        currentAprPercent: 6,
        remainingTermMonths: 300,
        newAprPercent: 4.5,
        newTermMonths: 300,
        fees: -1,
      }),
    ).toThrow(RangeError);
  });
});
