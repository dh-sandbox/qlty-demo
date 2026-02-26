# frozen_string_literal: true

require_relative "../lib/deploy"

RSpec.describe Deploy do
  describe Deploy::Config do
    let(:valid_attrs) do
      {
        environment: "production",
        region: "us-east-1",
        version: "1.2.3",
        services: %w[web api worker]
      }
    end

    describe "#initialize" do
      it "sets attributes from the given hash" do
        config = described_class.new(valid_attrs)

        expect(config.environment).to eq("production")
        expect(config.region).to eq("us-east-1")
        expect(config.version).to eq("1.2.3")
        expect(config.services).to eq(%w[web api worker])
      end

      it "defaults services to an empty array" do
        config = described_class.new(environment: "staging")

        expect(config.services).to eq([])
      end

      it "handles missing attributes gracefully" do
        config = described_class.new

        expect(config.environment).to be_nil
        expect(config.region).to be_nil
        expect(config.version).to be_nil
        expect(config.services).to eq([])
      end
    end

    describe "#valid?" do
      it "returns true when all required fields and services are present" do
        config = described_class.new(valid_attrs)

        expect(config).to be_valid
      end

      it "returns false when environment is missing" do
        config = described_class.new(valid_attrs.merge(environment: nil))

        expect(config).not_to be_valid
      end

      it "returns false when region is blank" do
        config = described_class.new(valid_attrs.merge(region: "  "))

        expect(config).not_to be_valid
      end

      it "returns false when version is missing" do
        config = described_class.new(valid_attrs.merge(version: nil))

        expect(config).not_to be_valid
      end

      it "returns false when services array is empty" do
        config = described_class.new(valid_attrs.merge(services: []))

        expect(config).not_to be_valid
      end
    end

    describe "#to_env_vars" do
      it "converts config to environment variable hash" do
        config = described_class.new(valid_attrs)
        env_vars = config.to_env_vars

        expect(env_vars).to eq(
          "DEPLOY_ENVIRONMENT" => "production",
          "DEPLOY_REGION" => "us-east-1",
          "DEPLOY_VERSION" => "1.2.3",
          "DEPLOY_SERVICES" => "web,api,worker"
        )
      end

      it "joins services with commas" do
        config = described_class.new(valid_attrs.merge(services: %w[alpha beta]))

        expect(config.to_env_vars["DEPLOY_SERVICES"]).to eq("alpha,beta")
      end
    end
  end

  describe ".generate_tag" do
    it "produces a tag with version, environment, and date stamp" do
      tag = described_class.generate_tag("1.2.3", "production")
      date_stamp = Time.now.strftime("%Y%m%d")

      expect(tag).to eq("v1.2.3-production-#{date_stamp}")
    end

    it "works with different environments" do
      tag = described_class.generate_tag("0.1.0", "staging")

      expect(tag).to start_with("v0.1.0-staging-")
    end
  end

  describe ".parse_semver" do
    it "parses a valid semver string into components" do
      result = described_class.parse_semver("1.2.3")

      expect(result).to eq(major: 1, minor: 2, patch: 3)
    end

    it "parses zero values" do
      result = described_class.parse_semver("0.0.0")

      expect(result).to eq(major: 0, minor: 0, patch: 0)
    end

    it "parses large version numbers" do
      result = described_class.parse_semver("12.345.6789")

      expect(result).to eq(major: 12, minor: 345, patch: 6789)
    end

    it "returns nil for an invalid version string" do
      expect(described_class.parse_semver("not-a-version")).to be_nil
    end

    it "returns nil for a partial version" do
      expect(described_class.parse_semver("1.2")).to be_nil
    end

    it "returns nil for an empty string" do
      expect(described_class.parse_semver("")).to be_nil
    end

    it "returns nil for nil input" do
      expect(described_class.parse_semver(nil)).to be_nil
    end
  end

  describe ".compare_versions" do
    it "returns 0 for equal versions" do
      expect(described_class.compare_versions("1.2.3", "1.2.3")).to eq(0)
    end

    it "returns -1 when the first version is lower (major)" do
      expect(described_class.compare_versions("1.0.0", "2.0.0")).to eq(-1)
    end

    it "returns 1 when the first version is higher (major)" do
      expect(described_class.compare_versions("3.0.0", "2.0.0")).to eq(1)
    end

    it "compares minor versions when majors are equal" do
      expect(described_class.compare_versions("1.1.0", "1.2.0")).to eq(-1)
    end

    it "compares patch versions when major and minor are equal" do
      expect(described_class.compare_versions("1.2.4", "1.2.3")).to eq(1)
    end

    it "raises ArgumentError for invalid first version" do
      expect { described_class.compare_versions("bad", "1.0.0") }
        .to raise_error(ArgumentError, /Invalid version: bad/)
    end

    it "raises ArgumentError for invalid second version" do
      expect { described_class.compare_versions("1.0.0", "nope") }
        .to raise_error(ArgumentError, /Invalid version: nope/)
    end
  end

  describe ".canary_percentage" do
    it "returns the correct percentage for the first step" do
      expect(described_class.canary_percentage(1, 5)).to eq(20.0)
    end

    it "returns 100.0 for the final step" do
      expect(described_class.canary_percentage(10, 10)).to eq(100.0)
    end

    it "calculates intermediate steps correctly" do
      expect(described_class.canary_percentage(3, 4)).to eq(75.0)
    end

    it "handles a single-step rollout" do
      expect(described_class.canary_percentage(1, 1)).to eq(100.0)
    end

    it "raises ArgumentError when total_steps is zero" do
      expect { described_class.canary_percentage(1, 0) }
        .to raise_error(ArgumentError, /total_steps must be positive/)
    end

    it "raises ArgumentError when step is out of range" do
      expect { described_class.canary_percentage(0, 5) }
        .to raise_error(ArgumentError, /step must be between/)
    end

    it "raises ArgumentError when step exceeds total_steps" do
      expect { described_class.canary_percentage(6, 5) }
        .to raise_error(ArgumentError, /step must be between/)
    end
  end
end
