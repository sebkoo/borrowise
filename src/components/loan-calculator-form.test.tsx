import { fireEvent, render, screen } from '@testing-library/react-native';

import { LoanCalculatorForm } from './loan-calculator-form';

describe('LoanCalculatorForm', () => {
  it('computes monthly payment and total interest once all fields are filled', async () => {
    await render(<LoanCalculatorForm />);

    await fireEvent.changeText(screen.getByLabelText('Principal amount in dollars'), '10000');
    await fireEvent.changeText(screen.getByLabelText('Annual percentage rate'), '5');
    await fireEvent.changeText(screen.getByLabelText('Loan term in months'), '12');

    expect(screen.getByText('$856.07')).toBeOnTheScreen();
    expect(screen.getByText('$272.89')).toBeOnTheScreen();
  });

  it('computes a zero-interest payment when APR is 0, without crashing', async () => {
    await render(<LoanCalculatorForm />);

    await fireEvent.changeText(screen.getByLabelText('Principal amount in dollars'), '12000');
    await fireEvent.changeText(screen.getByLabelText('Annual percentage rate'), '0');
    await fireEvent.changeText(screen.getByLabelText('Loan term in months'), '24');

    expect(screen.getByText('$500.00')).toBeOnTheScreen();
    expect(screen.getByText('$0.00')).toBeOnTheScreen();
  });

  it('shows nothing while fields are only partially filled', async () => {
    await render(<LoanCalculatorForm />);

    await fireEvent.changeText(screen.getByLabelText('Principal amount in dollars'), '10000');

    expect(screen.queryByText(/^\$/)).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows a validation error and no result for a non-numeric principal', async () => {
    await render(<LoanCalculatorForm />);

    await fireEvent.changeText(screen.getByLabelText('Principal amount in dollars'), 'abc');
    await fireEvent.changeText(screen.getByLabelText('Annual percentage rate'), '5');
    await fireEvent.changeText(screen.getByLabelText('Loan term in months'), '12');

    expect(screen.getByRole('alert')).toBeOnTheScreen();
    expect(screen.queryByText(/^\$/)).toBeNull();
  });

  it('shows a validation error for a non-positive term', async () => {
    await render(<LoanCalculatorForm />);

    await fireEvent.changeText(screen.getByLabelText('Principal amount in dollars'), '10000');
    await fireEvent.changeText(screen.getByLabelText('Annual percentage rate'), '5');
    await fireEvent.changeText(screen.getByLabelText('Loan term in months'), '0');

    expect(screen.getByText(/positive integer/)).toBeOnTheScreen();
  });
});
