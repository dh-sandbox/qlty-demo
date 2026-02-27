import { describe, it, expect } from "vitest";
import { countWords, averageWordLength, summarize } from "../utils/textStats";

describe("countWords", () => {
  it("counts words in a sentence", () => {
    expect(countWords("hello world")).toBe(2);
  });

  it("returns 0 for empty string", () => {
    expect(countWords("")).toBe(0);
  });
});

describe("averageWordLength", () => {
  it("calculates average word length", () => {
    expect(averageWordLength("hi there")).toBe(3.5);
  });

  it("returns 0 for empty string", () => {
    expect(averageWordLength("")).toBe(0);
  });
});

describe("summarize", () => {
  it("returns text statistics", () => {
    const result = summarize("hello world");
    expect(result.words).toBe(2);
    expect(result.chars).toBe(11);
    expect(result.avgLen).toBe(5);
  });
});
