# frozen_string_literal: true

require_relative "../lib/formatter"

RSpec.describe Formatter do
  describe ".format_bytes" do
    it "returns '0 B' for zero" do
      expect(described_class.format_bytes(0)).to eq("0 B")
    end

    it "formats bytes below 1 KiB" do
      expect(described_class.format_bytes(512)).to eq("512 B")
    end

    it "formats exactly 1 KiB" do
      expect(described_class.format_bytes(1024)).to eq("1 KiB")
    end

    it "formats fractional KiB" do
      expect(described_class.format_bytes(1536)).to eq("1.5 KiB")
    end

    it "formats MiB" do
      expect(described_class.format_bytes(1_048_576)).to eq("1 MiB")
    end

    it "formats GiB" do
      expect(described_class.format_bytes(1_073_741_824)).to eq("1 GiB")
    end

    it "raises for negative bytes" do
      expect { described_class.format_bytes(-1) }
        .to raise_error(ArgumentError, /non-negative/)
    end
  end

  describe ".format_duration" do
    it "returns '0s' for zero" do
      expect(described_class.format_duration(0)).to eq("0s")
    end

    it "formats seconds only" do
      expect(described_class.format_duration(45)).to eq("45s")
    end

    it "formats minutes and seconds" do
      expect(described_class.format_duration(150)).to eq("2m 30s")
    end

    it "formats hours" do
      expect(described_class.format_duration(3600)).to eq("1h 0m 0s")
    end

    it "formats days" do
      expect(described_class.format_duration(90_000)).to eq("1d 1h 0m 0s")
    end

    it "raises for negative duration" do
      expect { described_class.format_duration(-1) }
        .to raise_error(ArgumentError, /non-negative/)
    end
  end

  describe ".pluralize" do
    it "returns singular form for count of 1" do
      expect(described_class.pluralize("item", 1)).to eq("1 item")
    end

    it "returns default plural for count of 0" do
      expect(described_class.pluralize("item", 0)).to eq("0 items")
    end

    it "returns default plural for count greater than 1" do
      expect(described_class.pluralize("file", 5)).to eq("5 files")
    end

    it "uses a custom plural form when provided" do
      expect(described_class.pluralize("child", 3, "children")).to eq("3 children")
    end

    it "uses the custom plural even for zero" do
      expect(described_class.pluralize("goose", 0, "geese")).to eq("0 geese")
    end
  end
end
