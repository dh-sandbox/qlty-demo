import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  truncate,
  slugify,
  parseQueryString,
  escapeHtml,
  capitalize,
  wordCount,
  FormatterConfig,
} from "../utils/formatter";

describe("formatCurrency", () => {
  it("formats positive amounts", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-99.99)).toBe("-$99.99");
  });
});

describe("truncate", () => {
  it("returns text shorter than maxLength unchanged", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates long text with suffix", () => {
    expect(truncate("hello world", 8)).toBe("hello...");
  });
});

describe("slugify", () => {
  it("converts to lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Hello, World! #2024")).toBe("hello-world-2024");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  spaced out  ")).toBe("spaced-out");
  });
});

describe("parseQueryString", () => {
  it("parses simple query string", () => {
    expect(parseQueryString("a=1&b=2")).toEqual({ a: "1", b: "2" });
  });

  it("handles leading question mark", () => {
    expect(parseQueryString("?foo=bar")).toEqual({ foo: "bar" });
  });

  it("handles duplicate keys as array", () => {
    const result = parseQueryString("tag=a&tag=b");
    expect(result.tag).toEqual(["a", "b"]);
  });

  it("returns empty object for empty input", () => {
    expect(parseQueryString("")).toEqual({});
  });
});

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
    );
  });

  it("escapes ampersands", () => {
    expect(escapeHtml("foo & bar")).toBe("foo &amp; bar");
  });
});

describe("capitalize", () => {
  it("capitalizes first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(capitalize("")).toBe("");
  });
});

describe("wordCount", () => {
  it("counts words", () => {
    expect(wordCount("one two three")).toBe(3);
  });

  it("returns 0 for empty/blank", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount("   ")).toBe(0);
  });
});

describe("FormatterConfig", () => {
  it("defaults to en-US", () => {
    const config = new FormatterConfig();
    expect(config.locale).toBe("en-US");
  });

  it("returns correct decimal separator", () => {
    const en = new FormatterConfig("en-US");
    expect(en.getDecimalSeparator()).toBe(".");

    const de = new FormatterConfig("de-DE");
    expect(de.getDecimalSeparator()).toBe(",");
  });
});
