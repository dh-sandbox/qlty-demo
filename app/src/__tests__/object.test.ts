import { describe, it, expect } from 'vitest';
import { pick, omit, deepClone, merge, isEqual } from '../utils/object';

describe('pick', () => {
  it('picks specified keys from an object', () => {
    expect(pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 });
  });

  it('ignores keys that do not exist', () => {
    expect(pick({ a: 1 }, ['a', 'b' as never])).toEqual({ a: 1 });
  });

  it('returns an empty object when no keys match', () => {
    expect(pick({ a: 1 }, [])).toEqual({});
  });
});

describe('omit', () => {
  it('removes specified keys from an object', () => {
    expect(omit({ a: 1, b: 2, c: 3 }, ['b'])).toEqual({ a: 1, c: 3 });
  });

  it('returns a copy when no keys are omitted', () => {
    const obj = { a: 1 };
    const result = omit(obj, []);
    expect(result).toEqual({ a: 1 });
    expect(result).not.toBe(obj);
  });

  it('handles omitting nonexistent keys gracefully', () => {
    expect(omit({ a: 1 }, ['z' as never])).toEqual({ a: 1 });
  });
});

describe('deepClone', () => {
  it('clones a nested object', () => {
    const original = { a: { b: { c: 1 } } };
    const cloned = deepClone(original);
    expect(cloned).toEqual(original);
    expect(cloned.a).not.toBe(original.a);
  });

  it('clones arrays', () => {
    const original = [1, [2, 3]];
    const cloned = deepClone(original);
    expect(cloned).toEqual(original);
    expect(cloned[1]).not.toBe(original[1]);
  });

  it('clones dates', () => {
    const date = new Date('2024-01-01');
    const cloned = deepClone(date);
    expect(cloned.getTime()).toBe(date.getTime());
    expect(cloned).not.toBe(date);
  });

  it('returns primitives as-is', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(null)).toBe(null);
  });
});

describe('merge', () => {
  it('merges two objects', () => {
    expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it('later values override earlier ones', () => {
    expect(merge({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
  });

  it('merges multiple objects', () => {
    expect(merge({ a: 1 }, { b: 2 }, { c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('returns an empty object when given no arguments', () => {
    expect(merge()).toEqual({});
  });
});

describe('isEqual', () => {
  it('returns true for identical primitives', () => {
    expect(isEqual(1, 1)).toBe(true);
    expect(isEqual('a', 'a')).toBe(true);
  });

  it('returns false for different primitives', () => {
    expect(isEqual(1, 2)).toBe(false);
  });

  it('compares nested objects deeply', () => {
    expect(isEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    expect(isEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
  });

  it('compares arrays deeply', () => {
    expect(isEqual([1, [2]], [1, [2]])).toBe(true);
    expect(isEqual([1, 2], [1, 3])).toBe(false);
  });

  it('compares dates by value', () => {
    const d1 = new Date('2024-01-01');
    const d2 = new Date('2024-01-01');
    expect(isEqual(d1, d2)).toBe(true);
  });

  it('returns false for different types', () => {
    expect(isEqual(1, '1')).toBe(false);
  });

  it('returns false when arrays differ in length', () => {
    expect(isEqual([1, 2], [1])).toBe(false);
  });

  it('returns false when objects differ in key count', () => {
    expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });
});
