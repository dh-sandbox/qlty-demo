import { describe, it, expect } from 'vitest';
import { clamp, lerp, roundTo, average, factorial } from '../utils/math';

describe('clamp', () => {
  it('returns the value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to minimum when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to maximum when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it('returns max when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('lerp', () => {
  it('returns start when t is 0', () => {
    expect(lerp(0, 10, 0)).toBe(0);
  });

  it('returns end when t is 1', () => {
    expect(lerp(0, 10, 1)).toBe(10);
  });

  it('returns the midpoint when t is 0.5', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it('works with negative values', () => {
    expect(lerp(-10, 10, 0.5)).toBe(0);
  });

  it('extrapolates when t is greater than 1', () => {
    expect(lerp(0, 10, 2)).toBe(20);
  });
});

describe('roundTo', () => {
  it('rounds to 2 decimal places', () => {
    expect(roundTo(3.14159, 2)).toBe(3.14);
  });

  it('rounds to 0 decimal places', () => {
    expect(roundTo(3.7, 0)).toBe(4);
  });

  it('rounds to 3 decimal places', () => {
    expect(roundTo(1.23456, 3)).toBe(1.235);
  });

  it('handles already rounded values', () => {
    expect(roundTo(5.0, 2)).toBe(5);
  });
});

describe('average', () => {
  it('computes the average of an array of numbers', () => {
    expect(average([1, 2, 3, 4, 5])).toBe(3);
  });

  it('computes the average of a single-element array', () => {
    expect(average([42])).toBe(42);
  });

  it('handles decimal results', () => {
    expect(average([1, 2])).toBe(1.5);
  });

  it('throws an error for an empty array', () => {
    expect(() => average([])).toThrow(
      'Cannot compute average of an empty array'
    );
  });
});

describe('factorial', () => {
  it('returns 1 for factorial(0)', () => {
    expect(factorial(0)).toBe(1);
  });

  it('returns 1 for factorial(1)', () => {
    expect(factorial(1)).toBe(1);
  });

  it('computes factorial(5) correctly', () => {
    expect(factorial(5)).toBe(120);
  });

  it('computes factorial(10) correctly', () => {
    expect(factorial(10)).toBe(3628800);
  });

  it('throws an error for negative numbers', () => {
    expect(() => factorial(-1)).toThrow(
      'Factorial is not defined for negative numbers'
    );
  });

  it('throws an error for non-integer values', () => {
    expect(() => factorial(2.5)).toThrow(
      'Factorial is only defined for integers'
    );
  });
});
