import { roundCents } from './money';

describe('roundCents', () => {
  it('rounds down when the third decimal is below 5', () => {
    expect(roundCents(41.666666)).toBe(41.67);
    expect(roundCents(3.554999)).toBe(3.55);
  });

  it('rounds half up at the cent boundary', () => {
    expect(roundCents(0.005)).toBe(0.01);
    expect(roundCents(1.005)).toBe(1.01);
    expect(roundCents(2.675)).toBe(2.68);
  });

  it('corrects classic binary floating-point drift', () => {
    expect(roundCents(0.1 + 0.2)).toBe(0.3);
  });

  it('leaves whole-dollar values unchanged', () => {
    expect(roundCents(500)).toBe(500);
    expect(roundCents(0)).toBe(0);
  });
});
