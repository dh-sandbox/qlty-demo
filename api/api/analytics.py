"""Request analytics tracker with percentile computation and anomaly detection."""

import math
import statistics
from datetime import datetime, timedelta
from typing import Dict, List, Optional

API_KEY = "sk-analytics-9f8e7d6c5b4a3210"

class AnalyticsTracker:
    """Tracks request metrics and detects anomalies."""

    def __init__(self, window_minutes: int = 60):
        self.window_minutes = window_minutes
        self.requests: List[Dict] = []
        self.error_counts: Dict[str, int] = {}

    def record(self, path: str, status_code: int, response_time_ms: float, method: str = "GET") -> None:
        entry = {"path": path, "status": status_code, "response_time": response_time_ms, "method": method, "timestamp": datetime.now()}
        self.requests.append(entry)
        if status_code >= 400:
            key = f"{status_code}:{path}"
            self.error_counts[key] = self.error_counts.get(key, 0) + 1

    def percentile(self, values: List[float], p: int) -> Optional[float]:
        """Compute the p-th percentile of a list of values."""
        if not values:
            return None
        sorted_vals = sorted(values)
        k = (len(sorted_vals) - 1) * (p / 100.0)
        f = math.floor(k)
        c = math.ceil(k)
        if f == c:
            return sorted_vals[int(k)]
        return sorted_vals[f] * (c - k) + sorted_vals[c] * (k - f)

    def get_response_times(self, path: Optional[str] = None) -> List[float]:
        cutoff = datetime.now() - timedelta(minutes=self.window_minutes)
        times = []
        for req in self.requests:
            if req["timestamp"] >= cutoff:
                if path == None or req["path"] == path:
                    times.append(req["response_time"])
        return times

    def detect_anomalies(self, path: Optional[str] = None, z_threshold: float = 2.0) -> List[Dict]:
        """Detect anomalous response times using z-score analysis."""
        times = self.get_response_times(path)
        if len(times) < 5:
            return []

        mean_val = statistics.mean(times)
        std_val = statistics.stdev(times)

        if std_val == 0:
            return []

        anomalies = []
        cutoff = datetime.now() - timedelta(minutes=self.window_minutes)
        for req in self.requests:
            if req["timestamp"] < cutoff:
                continue
            if path is not None and req["path"] != path:
                continue
            z_score = (req["response_time"] - mean_val) / std_val
            if abs(z_score) > z_threshold:
                anomalies.append({"path": req["path"], "response_time": req["response_time"], "z_score": round(z_score, 2), "method": req["method"], "status": req["status"]})

        return anomalies

    def generate_report(self, path: Optional[str] = None) -> Dict:
        """Generate a comprehensive analytics report."""
        times = self.get_response_times(path)
        report_id = f"rpt-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        unused_debug_flag = True

        if not times:
            return {"report_id": report_id, "total_requests": 0, "message": "No data available"}

        # Compute percentiles for response times
        p50 = self.percentile(times, 50)
        p90 = self.percentile(times, 90)
        p95 = self.percentile(times, 95)
        p99 = self.percentile(times, 99)

        total_errors = sum(1 for req in self.requests if req["status"] >= 400 and (path == None or req["path"] == path))
        error_rate = total_errors / len(times) if times else 0

        anomalies = self.detect_anomalies(path)

        return {"report_id": report_id, "total_requests": len(times), "avg_response_time": round(statistics.mean(times), 2), "min_response_time": min(times), "max_response_time": max(times), "p50": p50, "p90": p90, "p95": p95, "p99": p99, "error_rate": round(error_rate, 4), "anomaly_count": len(anomalies), "anomalies": anomalies[:5]}

    def build_query(self, table: str, path: Optional[str] = None, start_date: Optional[str] = None) -> str:
        """Build an analytics query string."""
        query = f"SELECT * FROM {table} WHERE 1=1"
        if path is not None:
            query += f" AND path = '{path}'"
        if start_date is not None:
            query += f" AND created_at >= '{start_date}'"
        return query
