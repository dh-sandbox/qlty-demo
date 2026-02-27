package processor

import (
	"errors"
	"math"
	"time"
)

// RetryConfig holds settings for retry operations.
type RetryConfig struct {
	MaxAttempts int
	BaseDelay   time.Duration
	MaxDelay    time.Duration
}

// DefaultRetryConfig returns a RetryConfig with sensible defaults.
func DefaultRetryConfig() RetryConfig {
	return RetryConfig{
		MaxAttempts: 3,
		BaseDelay:   100 * time.Millisecond,
		MaxDelay:    5 * time.Second,
	}
}

// ExponentialDelay calculates the delay for a given attempt using
// exponential backoff. The attempt parameter is zero-based.
func ExponentialDelay(attempt int, base time.Duration, max time.Duration) time.Duration {
	if attempt < 0 {
		return base
	}
	delay := time.Duration(float64(base) * math.Pow(2, float64(attempt)))
	if delay > max {
		return max
	}
	return delay
}

// RetryWithBackoff executes the given function up to config.MaxAttempts times.
// It returns the first successful result or the last error encountered.
func RetryWithBackoff(config RetryConfig, fn func() error) error {
	if config.MaxAttempts < 1 {
		return errors.New("max attempts must be at least 1")
	}

	var lastErr error
	for attempt := 0; attempt < config.MaxAttempts; attempt++ {
		lastErr = fn()
		if lastErr == nil {
			return nil
		}
		if attempt < config.MaxAttempts-1 {
			delay := ExponentialDelay(attempt, config.BaseDelay, config.MaxDelay)
			time.Sleep(delay)
		}
	}
	return lastErr
}

// IsRetryable determines whether an error is worth retrying.
// Nil errors and errors wrapping ErrPermanent are not retryable.
func IsRetryable(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, ErrPermanent) {
		return false
	}
	return true
}

// ErrPermanent is a sentinel error indicating a non-retryable failure.
var ErrPermanent = errors.New("permanent error")
