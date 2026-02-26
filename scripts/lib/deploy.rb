# frozen_string_literal: true

module Deploy
  SEMVER_PATTERN = /\A(\d+)\.(\d+)\.(\d+)\z/

  # Holds and validates deployment configuration.
  class Config
    attr_reader :environment, :region, :version, :services

    REQUIRED_FIELDS = %i[environment region version].freeze

    def initialize(attrs = {})
      @environment = attrs[:environment]
      @region = attrs[:region]
      @version = attrs[:version]
      @services = Array(attrs[:services])
    end

    def valid?
      REQUIRED_FIELDS.all? { |field| value_present?(send(field)) } &&
        !@services.empty?
    end

    def to_env_vars
      {
        "DEPLOY_ENVIRONMENT" => @environment.to_s,
        "DEPLOY_REGION" => @region.to_s,
        "DEPLOY_VERSION" => @version.to_s,
        "DEPLOY_SERVICES" => @services.join(",")
      }
    end

    private

    def value_present?(value)
      !value.nil? && !value.to_s.strip.empty?
    end
  end

  # Generates a deploy tag combining version, environment, and current date.
  #
  # @param version [String] semantic version (e.g. "1.2.3")
  # @param environment [String] target environment name
  # @return [String] formatted deploy tag
  def self.generate_tag(version, environment)
    date_stamp = Time.now.strftime("%Y%m%d")
    "v#{version}-#{environment}-#{date_stamp}"
  end

  # Parses a semantic version string into its components.
  #
  # @param version_string [String] version in "major.minor.patch" format
  # @return [Hash, nil] hash with :major, :minor, :patch keys or nil if invalid
  def self.parse_semver(version_string)
    match = SEMVER_PATTERN.match(version_string.to_s)
    return nil unless match

    {
      major: match[1].to_i,
      minor: match[2].to_i,
      patch: match[3].to_i
    }
  end

  # Compares two semantic version strings.
  #
  # @param v1 [String] first version
  # @param v2 [String] second version
  # @return [Integer] -1 if v1 < v2, 0 if equal, 1 if v1 > v2
  # @raise [ArgumentError] if either version is invalid
  def self.compare_versions(v1, v2)
    parsed_v1 = parse_semver(v1)
    parsed_v2 = parse_semver(v2)

    raise ArgumentError, "Invalid version: #{v1}" unless parsed_v1
    raise ArgumentError, "Invalid version: #{v2}" unless parsed_v2

    components = %i[major minor patch]
    components.each do |component|
      cmp = parsed_v1[component] <=> parsed_v2[component]
      return cmp unless cmp.zero?
    end

    0
  end

  # Calculates the canary rollout percentage for a given step.
  #
  # @param step [Integer] current step (1-based)
  # @param total_steps [Integer] total number of rollout steps
  # @return [Float] percentage of traffic for the canary (0.0 to 100.0)
  # @raise [ArgumentError] if step or total_steps is invalid
  def self.canary_percentage(step, total_steps)
    raise ArgumentError, "total_steps must be positive" unless total_steps.positive?
    raise ArgumentError, "step must be between 1 and #{total_steps}" unless step >= 1 && step <= total_steps

    (step.to_f / total_steps * 100).round(1)
  end
end
