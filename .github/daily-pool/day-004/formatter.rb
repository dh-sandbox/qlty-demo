# frozen_string_literal: true

module Formatter
  BYTE_UNITS = %w[B KiB MiB GiB TiB].freeze
  DURATION_PARTS = { d: 86_400, h: 3_600, m: 60, s: 1 }.freeze

  # Formats a byte count into a human-readable string.
  #
  # @param bytes [Integer] number of bytes (must be non-negative)
  # @return [String] formatted string such as "1.5 MiB"
  # @raise [ArgumentError] if bytes is negative
  def self.format_bytes(bytes)
    raise ArgumentError, "Byte count must be non-negative" if bytes.negative?
    return "0 B" if bytes.zero?

    exponent = (Math.log(bytes) / Math.log(1024)).to_i
    exponent = BYTE_UNITS.length - 1 if exponent >= BYTE_UNITS.length
    value = bytes.to_f / (1024**exponent)

    value == value.to_i ? "#{value.to_i} #{BYTE_UNITS[exponent]}" : "#{"%.1f" % value} #{BYTE_UNITS[exponent]}"
  end

  # Formats a duration in seconds into a human-readable string.
  #
  # @param seconds [Numeric] duration in seconds (must be non-negative)
  # @return [String] formatted string such as "2m 30s"
  # @raise [ArgumentError] if seconds is negative
  def self.format_duration(seconds)
    raise ArgumentError, "Duration must be non-negative" if seconds.negative?
    return "0s" if seconds.zero?

    remaining = seconds.to_i
    parts = []

    DURATION_PARTS.each do |unit, divisor|
      count, remaining = remaining.divmod(divisor)
      parts << "#{count}#{unit}" if count.positive? || parts.any?
    end

    parts.join(" ")
  end

  # Pluralizes a word based on a count.
  #
  # @param word [String] the singular form of the word
  # @param count [Integer] the quantity
  # @param plural [String, nil] optional irregular plural form
  # @return [String] the count and properly pluralized word
  def self.pluralize(word, count, plural = nil)
    form = if count == 1
             word
           else
             plural || "#{word}s"
           end
    "#{count} #{form}"
  end
end
