require_relative "../lib/monitoring"

RSpec.describe Monitoring::HealthChecker do
  let(:checker) { described_class.new(services) }
  let(:services) { [] }

  describe "#initialize" do
    it "starts with empty results" do
      expect(checker.results).to eq({})
    end

    it "stores provided services" do
      svcs = [{ name: "api", url: "https://example.com" }]
      c = described_class.new(svcs)
      expect(c.services).to eq(svcs)
    end
  end

  describe "#classify_status" do
    it "returns healthy for 2xx" do
      expect(checker.classify_status(200)).to eq("healthy")
      expect(checker.classify_status(201)).to eq("healthy")
    end

    it "returns degraded for 3xx" do
      expect(checker.classify_status(301)).to eq("degraded")
    end

    it "returns unhealthy for 4xx" do
      expect(checker.classify_status(404)).to eq("unhealthy")
    end

    it "returns critical for 5xx" do
      expect(checker.classify_status(500)).to eq("critical")
    end
  end

  describe "#uptime_summary" do
    it "returns zeros when no results" do
      summary = checker.uptime_summary
      expect(summary[:total]).to eq(0)
      expect(summary[:uptime_pct]).to eq(0.0)
    end

    it "calculates correct uptime percentage" do
      checker.instance_variable_set(:@results, {
        "svc1" => { health: "healthy" },
        "svc2" => { health: "healthy" },
        "svc3" => { health: "critical" },
      })
      summary = checker.uptime_summary
      expect(summary[:total]).to eq(3)
      expect(summary[:healthy]).to eq(2)
      expect(summary[:uptime_pct]).to eq(66.67)
    end
  end

  describe "#evaluate_alerts" do
    it "creates alert for critical service" do
      checker.instance_variable_set(:@results, {
        "db" => { health: "critical", response_time: 100 },
      })
      checker.evaluate_alerts
      expect(checker.alert_history.size).to eq(1)
      expect(checker.alert_history.first[:level]).to eq("critical")
    end

    it "creates alert for slow response time" do
      checker.instance_variable_set(:@results, {
        "api" => { health: "healthy", response_time: 6000 },
      })
      checker.evaluate_alerts
      expect(checker.alert_history.size).to eq(1)
      expect(checker.alert_history.first[:level]).to eq("critical")
    end

    it "creates warning for unhealthy service" do
      checker.instance_variable_set(:@results, {
        "web" => { health: "unhealthy", response_time: 200 },
      })
      checker.evaluate_alerts
      expect(checker.alert_history.size).to eq(1)
      expect(checker.alert_history.first[:level]).to eq("warning")
    end
  end

  describe "#recent_alerts" do
    it "returns last N alerts" do
      15.times do |i|
        checker.alert_history.push({ service: "svc", level: "warning", message: "alert #{i}", timestamp: Time.now })
      end
      expect(checker.recent_alerts(5).size).to eq(5)
      expect(checker.recent_alerts.size).to eq(10)
    end
  end
end
