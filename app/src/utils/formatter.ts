/**
 * Text formatting and sanitization utilities.
 */

const DEFAULT_LOCALE = "en-US";

export function formatCurrency(amount: number, currency: string = "USD"): string {
  if (amount == 0) {
    return "$0.00";
  }
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  const formatted = abs.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}$${formatted}`;
}

export function truncate(text: string, maxLength: number, suffix: string = "..."): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
}

export function slugify(input: string): string {
  input = input.toLowerCase();
  input = input.replace(/[^a-z0-9\s-]/g, "");
  input = input.replace(/[\s-]+/g, "-");
  input = input.replace(/^-+|-+$/g, "");
  return input;
}

export function parseQueryString(qs: string): Record<string, any> {
  const result: Record<string, any> = {};
  if (!qs || qs.length === 0) return result;

  const cleaned = qs.startsWith("?") ? qs.slice(1) : qs;
  const pairs = cleaned.split("&");

  for (var i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split("=");
    const key = decodeURIComponent(pair[0]);
    const value = pair.length > 1 ? decodeURIComponent(pair[1]) : "";

    if (result[key] !== undefined) {
      if (!Array.isArray(result[key])) {
        result[key] = [result[key]];
      }
      result[key].push(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export function capitalize(str: string): string {
  if (str == "") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function wordCount(text: string): number {
  if (!text || text.trim() == "") return 0;
  return text.trim().split(/\s+/).length;
}

class FormatterConfig {
  locale: string;
  dateFormat: string;
  numberFormat: any;

  constructor(locale: string = "en-US") {
    this.locale = locale;
    this.dateFormat = "YYYY-MM-DD";
    this.numberFormat = null;
  }

  getDecimalSeparator(): string {
    if (this.locale === "en-US") {
      return ".";
    } else {
      return ",";
    }
  }
}

export { FormatterConfig };
