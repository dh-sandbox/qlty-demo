import { describe, it, expect } from 'vitest';
import {
  capitalize,
  slugify,
  truncate,
  camelToKebab,
  countWords,
} from '../utils/string';

describe('capitalize', () => {
  it('capitalizes the first letter of a lowercase string', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('returns an empty string unchanged', () => {
    expect(capitalize('')).toBe('');
  });

  it('keeps an already capitalized string unchanged', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('capitalizes a single character', () => {
    expect(capitalize('a')).toBe('A');
  });
});

describe('slugify', () => {
  it('converts a simple string to a slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('collapses multiple spaces and hyphens', () => {
    expect(slugify('  multiple   spaces  ')).toBe('multiple-spaces');
  });

  it('handles strings with underscores', () => {
    expect(slugify('snake_case_string')).toBe('snake-case-string');
  });

  it('returns an empty string for empty input', () => {
    expect(slugify('')).toBe('');
  });
});

describe('truncate', () => {
  it('returns the original string if shorter than maxLength', () => {
    expect(truncate('short', 10)).toBe('short');
  });

  it('truncates a long string with default suffix', () => {
    expect(truncate('This is a long string', 10)).toBe('This is...');
  });

  it('truncates with a custom suffix', () => {
    expect(truncate('This is a long string', 12, '…')).toBe('This is a l…');
  });

  it('returns the string if exactly maxLength', () => {
    expect(truncate('exact', 5)).toBe('exact');
  });
});

describe('camelToKebab', () => {
  it('converts a simple camelCase string', () => {
    expect(camelToKebab('camelCase')).toBe('camel-case');
  });

  it('converts a multi-word camelCase string', () => {
    expect(camelToKebab('myVariableName')).toBe('my-variable-name');
  });

  it('handles consecutive uppercase letters', () => {
    expect(camelToKebab('parseHTMLString')).toBe('parse-html-string');
  });

  it('returns a lowercase string unchanged', () => {
    expect(camelToKebab('lowercase')).toBe('lowercase');
  });
});

describe('countWords', () => {
  it('counts words in a simple sentence', () => {
    expect(countWords('hello world')).toBe(2);
  });

  it('returns 0 for an empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for a whitespace-only string', () => {
    expect(countWords('   ')).toBe(0);
  });

  it('handles multiple spaces between words', () => {
    expect(countWords('one   two   three')).toBe(3);
  });

  it('counts a single word', () => {
    expect(countWords('hello')).toBe(1);
  });
});
