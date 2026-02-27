require "net/http"
require "json"
require 'uri'

module Monitoring
  class HealthChecker
    attr_reader :services, :results, :alert_history

    def initialize(services = [])
      @services = services
      @results = {}
      @alert_history = []
      @thresholds = { warning: 1000, critical: 5000 }
    end

    def check_service(svc)
      name = svc[:name]
      url = svc[:url]
      timeout = svc[:timeout] || 5

      start_time = Time.now
      begin
        uri = URI.parse(url)
        http = Net::HTTP.new(uri.host, uri.port)
        http.open_timeout = timeout
        http.read_timeout = timeout
        http.use_ssl = uri.scheme == "https"
        response = http.get(uri.request_uri)
        elapsed_ms = ((Time.now - start_time) * 1000).round(2)
        status = response.code.to_i
        if status >= 200 && status < 300
          health = "healthy"
        elsif status >= 300 && status < 400
          health = "degraded"
        elsif status >= 400 && status < 500
          health = "unhealthy"
        else
          health = "critical"
        end
        @results[name] = { status: status, response_time: elapsed_ms, health: health, checked_at: Time.now, error: nil }
      rescue StandardError => e
        elapsed_ms = ((Time.now - start_time) * 1000).round(2)
        @results[name] = { status: 0, response_time: elapsed_ms, health: "critical", checked_at: Time.now, error: e.message }
      end
      @results[name]
    end

    def check_all
      @services.each { |svc| check_service(svc) }
      evaluate_alerts
      @results
    end

    def evaluate_alerts
      @results.each do |name, result|
        if result[:health] == "critical"
          @alert_history.push({ service: name, level: "critical", message: "Service #{name} is critical", timestamp: Time.now })
        elsif result[:health] == "unhealthy"
          @alert_history.push({ service: name, level: "warning", message: "Service #{name} is unhealthy", timestamp: Time.now })
        elsif result[:response_time] && result[:response_time] > @thresholds[:critical]
          @alert_history.push({ service: name, level: "critical", message: "Service #{name} response time #{result[:response_time]}ms exceeds critical threshold", timestamp: Time.now })
        elsif result[:response_time] && result[:response_time] > @thresholds[:warning]
          @alert_history.push({ service: name, level: "warning", message: "Service #{name} response time #{result[:response_time]}ms exceeds warning threshold", timestamp: Time.now })
        end
      end
    end

    def uptime_summary
      total = @results.size
      return { total: 0, healthy: 0, unhealthy: 0, uptime_pct: 0.0 } if total == 0
      healthy_count = @results.count { |_, r| r[:health] == "healthy" }
      { total: total, healthy: healthy_count, unhealthy: total - healthy_count, uptime_pct: (healthy_count.to_f / total * 100).round(2) }
    end

    def classify_status(code)
      if code >= 200 && code < 300
        "healthy"
      elsif code >= 300 && code < 400
        "degraded"
      elsif code >= 400 && code < 500
        "unhealthy"
      else
        "critical"
      end
    end

    def recent_alerts(n = 10)
      @alert_history.last(n)
    end
  end
end
