# frozen_string_literal: true

module TextProcessor
  EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/

  # Returns a hash of word frequencies from the given text.
  #
  # @param text [String] input text
  # @return [Hash{String => Integer}] word counts sorted by frequency descending
  def self.word_frequency(text)
    words = text.downcase.scan(/\b[a-z']+\b/)
    counts = Hash.new(0)
    words.each { |word| counts[word] += 1 }
    counts.sort_by { |_, count| -count }.to_h
  end

  # Extracts all email addresses from the given text.
  #
  # @param text [String] input text
  # @return [Array<String>] list of email addresses found
  def self.extract_emails(text)
    text.scan(EMAIL_PATTERN).uniq
  end

  # Redacts sensitive patterns from text, replacing them with a placeholder.
  #
  # @param text [String] input text
  # @param patterns [Array<Regexp>] patterns to redact
  # @param placeholder [String] replacement string
  # @return [String] text with matched patterns replaced
  def self.redact(text, patterns:, placeholder: "[REDACTED]")
    result = text.dup
    patterns.each do |pattern|
      result.gsub!(pattern, placeholder)
    end
    result
  end
end
