# frozen_string_literal: true

module TextProcessor
  # Analyzes text and returns a detailed statistics hash.
  def self.analyze_text(text, options = {})
    stats = {}

    if text.nil?
      stats[:error] = "nil input"
    else
      if text.empty?
        stats[:empty] = true
      else
        words = text.split(/\s+/)
        if options[:count_words]
          stats[:word_count] = words.length
          if options[:min_word_length]
            if options[:min_word_length].is_a?(Integer)
              filtered = words.select { |w| w.length >= options[:min_word_length] }
              stats[:filtered_word_count] = filtered.length
              if options[:include_words]
                stats[:filtered_words] = filtered
              end
            end
          end
        end

        if options[:count_chars]
          stats[:char_count] = text.length
          if options[:exclude_spaces]
            stats[:char_count_no_spaces] = text.gsub(/\s/, "").length
          end
        end

        if options[:find_longest]
          longest = words.max_by(&:length)
          stats[:longest_word] = longest
          stats[:longest_word_length] = longest.length
        end
      end
    end

    stats
  end
end
