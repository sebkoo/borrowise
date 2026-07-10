import { act, renderHook } from '@testing-library/react-native';

import { useLoanCalculator } from './use-loan-calculator';

describe('useLoanCalculator', () => {
  it('returns no result and no error until all three fields are filled', async () => {
    const { result } = await renderHook(() => useLoanCalculator());

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('computes monthly payment and total interest once all fields are filled', async () => {
    const { result } = await renderHook(() => useLoanCalculator());

    await act(() => result.current.setPrincipalInput('10000'));
    await act(() => result.current.setAprInput('5'));
    await act(() => result.current.setTermInput('12'));

    expect(result.current.result).toEqual({ monthlyPayment: 856.07, totalInterest: 272.89 });
    expect(result.current.error).toBeNull();
  });

  it('computes a zero-interest payment when APR is 0, without dividing by zero', async () => {
    const { result } = await renderHook(() => useLoanCalculator());

    await act(() => result.current.setPrincipalInput('12000'));
    await act(() => result.current.setAprInput('0'));
    await act(() => result.current.setTermInput('24'));

    expect(result.current.result).toEqual({ monthlyPayment: 500, totalInterest: 0 });
    expect(result.current.error).toBeNull();
  });

  it('surfaces the domain validation error for a non-positive principal instead of throwing', async () => {
    const { result } = await renderHook(() => useLoanCalculator());

    await act(() => result.current.setPrincipalInput('-100'));
    await act(() => result.current.setAprInput('5'));
    await act(() => result.current.setTermInput('12'));

    expect(result.current.result).toBeNull();
    expect(result.current.error).toMatch(/greater than 0/);
  });

  it('reports a clear message for non-numeric input', async () => {
    const { result } = await renderHook(() => useLoanCalculator());

    await act(() => result.current.setPrincipalInput('abc'));
    await act(() => result.current.setAprInput('5'));
    await act(() => result.current.setTermInput('12'));

    expect(result.current.result).toBeNull();
    expect(result.current.error).toMatch(/valid numbers/);
  });
});
