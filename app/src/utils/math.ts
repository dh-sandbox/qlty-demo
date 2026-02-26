/**
 * Clamp a number to a given range [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linearly interpolate between two values.
 * When t = 0, returns start. When t = 1, returns end.
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Round a number to a specified number of decimal places.
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate the arithmetic mean of an array of numbers.
 * Throws an error if the array is empty.
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('Cannot compute average of an empty array');
  }
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}

/**
 * Compute the factorial of a non-negative integer.
 * Throws an error for negative numbers.
 */
export function factorial(n: number): number {
  if (n < 0) {
    throw new Error('Factorial is not defined for negative numbers');
  }
  if (!Number.isInteger(n)) {
    throw new Error('Factorial is only defined for integers');
  }
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
