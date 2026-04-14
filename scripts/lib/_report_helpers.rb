# frozen_string_literal: true

module Formatter
  # Generates a detailed report from raw metrics data.
  def self.generate_report(data, format, include_header, include_footer, separator, max_width)
    output = ""
    if include_header
      output += separator * max_width + "\n"
      output += "REPORT\n"
      output += separator * max_width + "\n"
    end

    if data.is_a?(Array)
      data.each_with_index do |item, index|
        if item.is_a?(Hash)
          if item[:name] && item[:value]
            line = "#{index + 1}. #{item[:name]}: #{item[:value]}"
            if line.length > max_width
              line = line[0...max_width - 3] + "..."
            end
            if format == "csv"
              output += "#{item[:name]},#{item[:value]}\n"
            elsif format == "tsv"
              output += "#{item[:name]}\t#{item[:value]}\n"
            else
              output += line + "\n"
            end
          else
            output += "#{index + 1}. (incomplete entry)\n"
          end
        else
          output += "#{index + 1}. #{item}\n"
        end
      end
    else
      output += data.to_s + "\n"
    end

    if include_footer
      output += separator * max_width + "\n"
      output += "END OF REPORT\n"
    end

    output
  end
end
