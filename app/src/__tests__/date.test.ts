import { describe, it, expect } from 'vitest';
import {
  formatDate,
  daysUntil,
  isWeekend,
  addDays,
  getQuarter,
} from '../utils/date';

describe('formatDate', () => {
  const date = new Date(2024, 0, 15); // January 15, 2024

  it('formats as YYYY-MM-DD', () => {
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-15');
  });

  it('formats as MM/DD/YYYY', () => {
    expect(formatDate(date, 'MM/DD/YYYY')).toBe('01/15/2024');
  });

  it('pads single-digit months and days', () => {
    const d = new Date(2024, 2, 5); // March 5, 2024
    expect(formatDate(d, 'YYYY-MM-DD')).toBe('2024-03-05');
  });

  it('throws for unsupported format', () => {
    expect(() => formatDate(date, 'DD-MM-YYYY')).toThrow(
      'Unsupported date format'
    );
  });
});

describe('daysUntil', () => {
  it('returns 0 for today', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(daysUntil(today)).toBe(0);
  });

  it('returns a positive number for a future date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    expect(daysUntil(future)).toBe(7);
  });

  it('returns a negative number for a past date', () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);
    expect(daysUntil(past)).toBe(-3);
  });
});

describe('isWeekend', () => {
  it('returns true for Saturday', () => {
    // January 6, 2024 is a Saturday
    const saturday = new Date(2024, 0, 6);
    expect(isWeekend(saturday)).toBe(true);
  });

  it('returns true for Sunday', () => {
    // January 7, 2024 is a Sunday
    const sunday = new Date(2024, 0, 7);
    expect(isWeekend(sunday)).toBe(true);
  });

  it('returns false for Monday', () => {
    // January 8, 2024 is a Monday
    const monday = new Date(2024, 0, 8);
    expect(isWeekend(monday)).toBe(false);
  });

  it('returns false for Wednesday', () => {
    // January 10, 2024 is a Wednesday
    const wednesday = new Date(2024, 0, 10);
    expect(isWeekend(wednesday)).toBe(false);
  });
});

describe('addDays', () => {
  it('adds days to a date', () => {
    const date = new Date(2024, 0, 15);
    const result = addDays(date, 10);
    expect(result.getDate()).toBe(25);
    expect(result.getMonth()).toBe(0);
  });

  it('handles month rollover', () => {
    const date = new Date(2024, 0, 30);
    const result = addDays(date, 5);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(4);
  });

  it('subtracts days with negative value', () => {
    const date = new Date(2024, 0, 15);
    const result = addDays(date, -5);
    expect(result.getDate()).toBe(10);
  });

  it('does not mutate the original date', () => {
    const date = new Date(2024, 0, 15);
    addDays(date, 10);
    expect(date.getDate()).toBe(15);
  });
});

describe('getQuarter', () => {
  it('returns Q1 for January', () => {
    expect(getQuarter(new Date(2024, 0, 1))).toBe(1);
  });

  it('returns Q1 for March', () => {
    expect(getQuarter(new Date(2024, 2, 31))).toBe(1);
  });

  it('returns Q2 for April', () => {
    expect(getQuarter(new Date(2024, 3, 1))).toBe(2);
  });

  it('returns Q3 for July', () => {
    expect(getQuarter(new Date(2024, 6, 15))).toBe(3);
  });

  it('returns Q4 for December', () => {
    expect(getQuarter(new Date(2024, 11, 25))).toBe(4);
  });
});
