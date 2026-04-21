package processor

import (
	"math"
	"testing"
)

func TestCounterInc(t *testing.T) {
	c := NewCounter("requests")
	if err := c.Inc(1); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if err := c.Inc(2.5); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if v := c.Value(); v != 3.5 {
		t.Errorf("expected 3.5, got %f", v)
	}
}

func TestCounterNegativeDelta(t *testing.T) {
	c := NewCounter("errors")
	err := c.Inc(-1)
	if err == nil {
		t.Fatal("expected error for negative delta")
	}
}

func TestCounterName(t *testing.T) {
	c := NewCounter("test_counter")
	if c.Name() != "test_counter" {
		t.Errorf("expected name %q, got %q", "test_counter", c.Name())
	}
}

func TestGaugeSetAndValue(t *testing.T) {
	g := NewGauge("temperature")
	g.Set(72.5)
	if v := g.Value(); v != 72.5 {
		t.Errorf("expected 72.5, got %f", v)
	}
	g.Set(-10)
	if v := g.Value(); v != -10 {
		t.Errorf("expected -10, got %f", v)
	}
}

func TestGaugeName(t *testing.T) {
	g := NewGauge("memory_usage")
	if g.Name() != "memory_usage" {
		t.Errorf("expected name %q, got %q", "memory_usage", g.Name())
	}
}

func TestHistogramObserve(t *testing.T) {
	h := NewHistogram("latency")
	h.Observe(1.0)
	h.Observe(2.0)
	h.Observe(3.0)

	if h.Count() != 3 {
		t.Errorf("expected count 3, got %d", h.Count())
	}
	if h.Sum() != 6.0 {
		t.Errorf("expected sum 6.0, got %f", h.Sum())
	}
}

func TestHistogramMean(t *testing.T) {
	h := NewHistogram("latency")
	h.Observe(10)
	h.Observe(20)
	h.Observe(30)

	if m := h.Mean(); m != 20.0 {
		t.Errorf("expected mean 20.0, got %f", m)
	}
}

func TestHistogramMeanEmpty(t *testing.T) {
	h := NewHistogram("empty")
	if m := h.Mean(); m != 0 {
		t.Errorf("expected mean 0 for empty histogram, got %f", m)
	}
}

func TestHistogramStdDev(t *testing.T) {
	h := NewHistogram("scores")
	h.Observe(2)
	h.Observe(4)
	h.Observe(4)
	h.Observe(4)
	h.Observe(5)
	h.Observe(5)
	h.Observe(7)
	h.Observe(9)

	sd := h.StdDev()
	if math.Abs(sd-2.0) > 0.01 {
		t.Errorf("expected stddev ~2.0, got %f", sd)
	}
}

func TestHistogramStdDevTooFewValues(t *testing.T) {
	h := NewHistogram("single")
	h.Observe(42)
	if sd := h.StdDev(); sd != 0 {
		t.Errorf("expected stddev 0 for single value, got %f", sd)
	}
}

func TestHistogramName(t *testing.T) {
	h := NewHistogram("response_time")
	if h.Name() != "response_time" {
		t.Errorf("expected name %q, got %q", "response_time", h.Name())
	}
}
