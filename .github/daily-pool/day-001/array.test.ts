import { describe, it, expect } from 'vitest';
import { chunk, unique, flatten, groupBy, zip } from '../utils/array';

describe('chunk', () => {
  it('splits an array into chunks of the given size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns a single chunk when size exceeds array length', () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });

  it('returns an empty array for empty input', () => {
    expect(chunk([], 3)).toEqual([]);
  });

  it('throws when chunk size is less than 1', () => {
    expect(() => chunk([1, 2], 0)).toThrow('Chunk size must be at least 1');
  });

  it('handles a chunk size of 1', () => {
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });
});

describe('unique', () => {
  it('removes duplicate numbers', () => {
    expect(unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
  });

  it('removes duplicate strings', () => {
    expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
  });

  it('returns an empty array for empty input', () => {
    expect(unique([])).toEqual([]);
  });

  it('preserves order of first occurrence', () => {
    expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
  });
});

describe('flatten', () => {
  it('flattens one level of nesting', () => {
    expect(flatten([[1, 2], [3], [4, 5]])).toEqual([1, 2, 3, 4, 5]);
  });

  it('handles a mix of nested and flat elements', () => {
    expect(flatten([1, [2, 3], 4])).toEqual([1, 2, 3, 4]);
  });

  it('returns an empty array for empty input', () => {
    expect(flatten([])).toEqual([]);
  });

  it('returns a copy when there is no nesting', () => {
    expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
  });
});

describe('groupBy', () => {
  it('groups numbers by even and odd', () => {
    const result = groupBy([1, 2, 3, 4], (n) => (n % 2 === 0 ? 'even' : 'odd'));
    expect(result).toEqual({ odd: [1, 3], even: [2, 4] });
  });

  it('groups strings by first letter', () => {
    const result = groupBy(['apple', 'avocado', 'banana'], (s) => s[0]);
    expect(result).toEqual({ a: ['apple', 'avocado'], b: ['banana'] });
  });

  it('returns an empty object for empty input', () => {
    expect(groupBy([], () => 'key')).toEqual({});
  });

  it('puts all items in one group when key function returns a constant', () => {
    const result = groupBy([1, 2, 3], () => 'all');
    expect(result).toEqual({ all: [1, 2, 3] });
  });
});

describe('zip', () => {
  it('combines two equal-length arrays into pairs', () => {
    expect(zip([1, 2, 3], ['a', 'b', 'c'])).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
  });

  it('truncates to the shorter array', () => {
    expect(zip([1, 2], ['a', 'b', 'c'])).toEqual([[1, 'a'], [2, 'b']]);
  });

  it('returns an empty array when one input is empty', () => {
    expect(zip([], [1, 2])).toEqual([]);
  });

  it('returns an empty array when both inputs are empty', () => {
    expect(zip([], [])).toEqual([]);
  });
});
