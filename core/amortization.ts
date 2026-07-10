import { roundCents } from './money';

export interface AmortizationScheduleEntry {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface AmortizationSchedule {
  monthlyPayment: number;
  schedule: AmortizationScheduleEntry[];
  totalInterest: number;
  totalPaid: number;
  actualTermMonths: number;
}

export interface RefinanceInput {
  currentBalance: number;
  currentAprPercent: number;
  remainingTermMonths: number;
  newAprPercent: number;
  newTermMonths: number;
  fees: number;
}

export interface RefinanceBreakEven {
  monthlySavings: number;
  lifetimeSavings: number;
  hasBreakEven: boolean;
  breakEvenMonth: number | null;
}

function validateLoanInputs(principal: number, aprPercent: number, termMonths: number): void {
  if (principal <= 0) {
    throw new RangeError('principal must be greater than 0');
  }
  if (!Number.isInteger(termMonths) || termMonths <= 0) {
    throw new RangeError('termMonths must be a positive integer');
  }
  if (aprPercent < 0) {
    throw new RangeError('aprPercent must not be negative');
  }
}

/**
 * Standard fixed-rate amortized monthly payment, rounded to the nearest cent.
 * APR = 0 degrades to an even split of principal across the term (no
 * divide-by-zero, since the compound-interest denominator is skipped entirely).
 */
export function calculateMonthlyPayment(
  principal: number,
  aprPercent: number,
  termMonths: number,
): number {
  validateLoanInputs(principal, aprPercent, termMonths);

  const monthlyRate = aprPercent / 100 / 12;
  if (monthlyRate === 0) {
    return roundCents(principal / termMonths);
  }

  const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
  return roundCents(payment);
}

/**
 * Builds the full per-month amortization schedule.
 *
 * Money precision: every monetary value (payment, interest, principal,
 * balance) is rounded to the nearest cent immediately after it is derived,
 * and each period's interest accrues on the *previous period's rounded
 * balance* — matching how a real loan servicer's statement is produced, and
 * ensuring rounding error never silently accumulates across periods.
 *
 * The fixed scheduled payment (`monthlyPayment + extraPayment`) will not, in
 * general, zero out the balance exactly at the scheduled term: 12 periods of
 * cent-rounded interest can leave a few cents of drift. The final period
 * therefore always pays exactly `balance + interest` instead of the fixed
 * amount, so the schedule's ending balance is always precisely 0.00. An
 * extra payment large enough to overpay the remaining balance early
 * triggers the same "final period" handling, which shortens the term.
 */
export function generateAmortizationSchedule(
  principal: number,
  aprPercent: number,
  termMonths: number,
  extraPayment = 0,
): AmortizationSchedule {
  validateLoanInputs(principal, aprPercent, termMonths);
  if (extraPayment < 0) {
    throw new RangeError('extraPayment must not be negative');
  }

  const monthlyPayment = calculateMonthlyPayment(principal, aprPercent, termMonths);
  const monthlyRate = aprPercent / 100 / 12;
  const scheduledPayment = roundCents(monthlyPayment + extraPayment);

  const schedule: AmortizationScheduleEntry[] = [];
  let balance = roundCents(principal);
  let month = 0;

  while (balance > 0 && month < termMonths) {
    month++;
    const interest = roundCents(balance * monthlyRate);
    const isFinalPeriod =
      month === termMonths || scheduledPayment >= roundCents(balance + interest);

    const payment = isFinalPeriod ? roundCents(balance + interest) : scheduledPayment;
    const principalPortion = roundCents(payment - interest);
    balance = isFinalPeriod ? 0 : roundCents(balance - principalPortion);

    schedule.push({ month, payment, interest, principal: principalPortion, balance });
  }

  const totalInterest = roundCents(schedule.reduce((sum, row) => sum + row.interest, 0));
  const totalPaid = roundCents(schedule.reduce((sum, row) => sum + row.payment, 0));

  return {
    monthlyPayment,
    schedule,
    totalInterest,
    totalPaid,
    actualTermMonths: schedule.length,
  };
}

/**
 * Break-even analysis for refinancing: how many months of lower payments it
 * takes to recoup the refinance fees, given the new loan is kept for its
 * full new term. If the new payment isn't actually lower, or the fees
 * outweigh the total savings over the new term, there is no break-even.
 */
export function calculateRefinanceBreakEven(input: RefinanceInput): RefinanceBreakEven {
  const {
    currentBalance,
    currentAprPercent,
    remainingTermMonths,
    newAprPercent,
    newTermMonths,
    fees,
  } = input;

  if (fees < 0) {
    throw new RangeError('fees must not be negative');
  }

  const currentPayment = calculateMonthlyPayment(
    currentBalance,
    currentAprPercent,
    remainingTermMonths,
  );
  const newPayment = calculateMonthlyPayment(currentBalance, newAprPercent, newTermMonths);
  const monthlySavings = roundCents(currentPayment - newPayment);

  const totalSavingsOverNewTerm = roundCents(monthlySavings * newTermMonths);
  const lifetimeSavings = roundCents(totalSavingsOverNewTerm - fees);
  const hasBreakEven = monthlySavings > 0 && lifetimeSavings >= 0;
  const breakEvenMonth = hasBreakEven ? Math.ceil(fees / monthlySavings) : null;

  return { monthlySavings, lifetimeSavings, hasBreakEven, breakEvenMonth };
}
