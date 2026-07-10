import { useMemo, useState } from 'react';

import { generateAmortizationSchedule } from '../../core/amortization';

export interface LoanCalculatorResult {
  monthlyPayment: number;
  totalInterest: number;
}

export interface UseLoanCalculator {
  principalInput: string;
  aprInput: string;
  termInput: string;
  setPrincipalInput: (value: string) => void;
  setAprInput: (value: string) => void;
  setTermInput: (value: string) => void;
  result: LoanCalculatorResult | null;
  error: string | null;
}

export function useLoanCalculator(): UseLoanCalculator {
  const [principalInput, setPrincipalInput] = useState('');
  const [aprInput, setAprInput] = useState('');
  const [termInput, setTermInput] = useState('');

  const { result, error } = useMemo<{
    result: LoanCalculatorResult | null;
    error: string | null;
  }>(() => {
    if (!principalInput || !aprInput || !termInput) {
      return { result: null, error: null };
    }

    const principal = Number(principalInput);
    const aprPercent = Number(aprInput);
    const termMonths = Number(termInput);

    if (
      !Number.isFinite(principal) ||
      !Number.isFinite(aprPercent) ||
      !Number.isFinite(termMonths)
    ) {
      return { result: null, error: 'Enter valid numbers for principal, APR, and term.' };
    }

    try {
      const schedule = generateAmortizationSchedule(principal, aprPercent, termMonths);
      return {
        result: { monthlyPayment: schedule.monthlyPayment, totalInterest: schedule.totalInterest },
        error: null,
      };
    } catch (err) {
      return {
        result: null,
        error: err instanceof RangeError ? err.message : 'Unable to compute payment.',
      };
    }
  }, [principalInput, aprInput, termInput]);

  return {
    principalInput,
    aprInput,
    termInput,
    setPrincipalInput,
    setAprInput,
    setTermInput,
    result,
    error,
  };
}
