/**
 * Format a date according to the given format string.
 * Supported formats: 'YYYY-MM-DD', 'MM/DD/YYYY'.
 */
export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    default:
      throw new Error(`Unsupported date format: ${format}`);
  }
}

/**
 * Calculate the number of days from today until the target date.
 * Returns a negative number if the target date is in the past.
 */
export function daysUntil(target: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const targetCopy = new Date(target);
  targetCopy.setHours(0, 0, 0, 0);
  const diffMs = targetCopy.getTime() - now.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check whether a given date falls on a weekend (Saturday or Sunday).
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Return a new Date that is the given number of days after the input date.
 * Accepts negative values to subtract days.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get the fiscal quarter (1-4) for a given date.
 * Q1 = Jan-Mar, Q2 = Apr-Jun, Q3 = Jul-Sep, Q4 = Oct-Dec.
 */
export function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}
