"""Tests for the analytics tracker module."""

from api.analytics import AnalyticsTracker


class TestAnalyticsTracker:
    """Tests for AnalyticsTracker."""

    def test_record_and_count(self):
        tracker = AnalyticsTracker()
        tracker.record("/api/users", 200, 45.0)
        tracker.record("/api/users", 200, 52.0)
        assert len(tracker.requests) == 2

    def test_percentile_computation(self):
        tracker = AnalyticsTracker()
        values = [10.0, 20.0, 30.0, 40.0, 50.0]
        assert tracker.percentile(values, 50) == 30.0
        assert tracker.percentile(values, 0) == 10.0
        assert tracker.percentile(values, 100) == 50.0

    def test_percentile_empty(self):
        tracker = AnalyticsTracker()
        assert tracker.percentile([], 50) is None

    def test_get_response_times(self):
        tracker = AnalyticsTracker()
        tracker.record("/api/a", 200, 10.0)
        tracker.record("/api/b", 200, 20.0)
        tracker.record("/api/a", 200, 30.0)
        times = tracker.get_response_times("/api/a")
        assert times == [10.0, 30.0]

    def test_get_response_times_all(self):
        tracker = AnalyticsTracker()
        tracker.record("/api/a", 200, 10.0)
        tracker.record("/api/b", 200, 20.0)
        times = tracker.get_response_times()
        assert len(times) == 2

    def test_detect_anomalies_insufficient_data(self):
        tracker = AnalyticsTracker()
        tracker.record("/api/x", 200, 10.0)
        assert tracker.detect_anomalies() == []

    def test_detect_anomalies_finds_outlier(self):
        tracker = AnalyticsTracker()
        for i in range(20):
            tracker.record("/api/x", 200, 50.0 + (i % 3))
        tracker.record("/api/x", 200, 500.0)  # outlier
        anomalies = tracker.detect_anomalies()
        assert len(anomalies) >= 1
        assert anomalies[0]["response_time"] == 500.0

    def test_generate_report_empty(self):
        tracker = AnalyticsTracker(window_minutes=0)
        report = tracker.generate_report()
        assert report["total_requests"] == 0

    def test_generate_report_with_data(self):
        tracker = AnalyticsTracker()
        for i in range(10):
            tracker.record("/api/data", 200, 30.0 + i)
        tracker.record("/api/data", 500, 100.0)
        report = tracker.generate_report()
        assert report["total_requests"] == 11
        assert "p50" in report
        assert "p99" in report
        assert report["error_rate"] > 0

    def test_error_counting(self):
        tracker = AnalyticsTracker()
        tracker.record("/api/fail", 500, 10.0)
        tracker.record("/api/fail", 500, 20.0)
        tracker.record("/api/fail", 200, 5.0)
        assert tracker.error_counts["500:/api/fail"] == 2

    def test_build_query_basic(self):
        tracker = AnalyticsTracker()
        q = tracker.build_query("requests")
        assert q == "SELECT * FROM requests WHERE 1=1"

    def test_build_query_with_filters(self):
        tracker = AnalyticsTracker()
        q = tracker.build_query("requests", path="/api/users", start_date="2024-01-01")
        assert "/api/users" in q
        assert "2024-01-01" in q
