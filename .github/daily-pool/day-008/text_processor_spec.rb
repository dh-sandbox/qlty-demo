# frozen_string_literal: true

require_relative "../lib/text_processor"

RSpec.describe TextProcessor do
  describe ".word_frequency" do
    it "counts word occurrences" do
      result = described_class.word_frequency("the cat sat on the mat")

      expect(result["the"]).to eq(2)
      expect(result["cat"]).to eq(1)
    end

    it "is case-insensitive" do
      result = described_class.word_frequency("Hello hello HELLO")

      expect(result["hello"]).to eq(3)
    end

    it "sorts by frequency descending" do
      result = described_class.word_frequency("a b b c c c")
      keys = result.keys

      expect(keys.first).to eq("c")
    end

    it "returns an empty hash for empty input" do
      expect(described_class.word_frequency("")).to eq({})
    end

    it "handles punctuation" do
      result = described_class.word_frequency("hello, world! hello.")

      expect(result["hello"]).to eq(2)
      expect(result["world"]).to eq(1)
    end
  end

  describe ".extract_emails" do
    it "extracts a single email" do
      result = described_class.extract_emails("Contact us at info@example.com")

      expect(result).to eq(["info@example.com"])
    end

    it "extracts multiple emails" do
      text = "Email alice@example.com or bob@test.org"
      result = described_class.extract_emails(text)

      expect(result).to contain_exactly("alice@example.com", "bob@test.org")
    end

    it "returns unique emails" do
      text = "info@example.com and info@example.com again"
      result = described_class.extract_emails(text)

      expect(result).to eq(["info@example.com"])
    end

    it "returns an empty array when no emails are found" do
      expect(described_class.extract_emails("no emails here")).to eq([])
    end
  end

  describe ".redact" do
    it "replaces matched patterns with the default placeholder" do
      result = described_class.redact(
        "Call 555-1234 today",
        patterns: [/\d{3}-\d{4}/]
      )

      expect(result).to eq("Call [REDACTED] today")
    end

    it "uses a custom placeholder" do
      result = described_class.redact(
        "SSN: 123-45-6789",
        patterns: [/\d{3}-\d{2}-\d{4}/],
        placeholder: "***"
      )

      expect(result).to eq("SSN: ***")
    end

    it "applies multiple patterns" do
      result = described_class.redact(
        "Email: test@example.com, Phone: 555-0000",
        patterns: [/\S+@\S+/, /\d{3}-\d{4}/]
      )

      expect(result).to eq("Email: [REDACTED], Phone: [REDACTED]")
    end

    it "returns the original text when no patterns match" do
      result = described_class.redact("clean text", patterns: [/secret/])

      expect(result).to eq("clean text")
    end
  end
end
