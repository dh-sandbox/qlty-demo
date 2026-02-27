package processor

import (
	"fmt"
	"math"
	"sync"
)

// Counter is a monotonically increasing metric.
type Counter struct {
	mu    sync.Mutex
	name  string
	value float64
}

// NewCounter creates a named Counter starting at zero.
func NewCounter(name string) *Counter {
	return &Counter{name: name}
}

// Inc adds the given positive delta to the counter.
func (c *Counter) Inc(delta float64) error {
	if delta < 0 {
		return fmt.Errorf("counter %q: delta must be non-negative, got %f", c.name, delta)
	}
	c.mu.Lock()
	c.value += delta
	c.mu.Unlock()
	return nil
}

// Value returns the current counter value.
func (c *Counter) Value() float64 {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.value
}

// Name returns the counter name.
func (c *Counter) Name() string {
	return c.name
}

// Gauge is a metric that can go up and down.
type Gauge struct {
	mu    sync.Mutex
	name  string
	value float64
}

// NewGauge creates a named Gauge starting at zero.
func NewGauge(name string) *Gauge {
	return &Gauge{name: name}
}

// Set sets the gauge to the given value.
func (g *Gauge) Set(value float64) {
	g.mu.Lock()
	g.value = value
	g.mu.Unlock()
}

// Value returns the current gauge value.
func (g *Gauge) Value() float64 {
	g.mu.Lock()
	defer g.mu.Unlock()
	return g.value
}

// Name returns the gauge name.
func (g *Gauge) Name() string {
	return g.name
}

// Histogram tracks the distribution of observed values.
type Histogram struct {
	mu     sync.Mutex
	name   string
	values []float64
}

// NewHistogram creates a named Histogram.
func NewHistogram(name string) *Histogram {
	return &Histogram{name: name, values: make([]float64, 0)}
}

// Observe records a value in the histogram.
func (h *Histogram) Observe(value float64) {
	h.mu.Lock()
	h.values = append(h.values, value)
	h.mu.Unlock()
}

// Count returns the number of observations.
func (h *Histogram) Count() int {
	h.mu.Lock()
	defer h.mu.Unlock()
	return len(h.values)
}

// Sum returns the sum of all observed values.
func (h *Histogram) Sum() float64 {
	h.mu.Lock()
	defer h.mu.Unlock()
	total := 0.0
	for _, v := range h.values {
		total += v
	}
	return total
}

// Mean returns the arithmetic mean of all observations.
// Returns 0 if no values have been observed.
func (h *Histogram) Mean() float64 {
	h.mu.Lock()
	defer h.mu.Unlock()
	if len(h.values) == 0 {
		return 0
	}
	total := 0.0
	for _, v := range h.values {
		total += v
	}
	return total / float64(len(h.values))
}

// StdDev returns the population standard deviation.
// Returns 0 if fewer than 2 values have been observed.
func (h *Histogram) StdDev() float64 {
	h.mu.Lock()
	defer h.mu.Unlock()
	n := len(h.values)
	if n < 2 {
		return 0
	}
	mean := 0.0
	for _, v := range h.values {
		mean += v
	}
	mean /= float64(n)

	variance := 0.0
	for _, v := range h.values {
		diff := v - mean
		variance += diff * diff
	}
	variance /= float64(n)
	return math.Sqrt(variance)
}

// Name returns the histogram name.
func (h *Histogram) Name() string {
	return h.name
}
