package processor

import (
	"errors"
	"testing"
	"time"
)

func TestDefaultRetryConfig(t *testing.T) {
	cfg := DefaultRetryConfig()
	if cfg.MaxAttempts != 3 {
		t.Errorf("expected 3 max attempts, got %d", cfg.MaxAttempts)
	}
	if cfg.BaseDelay != 100*time.Millisecond {
		t.Errorf("expected 100ms base delay, got %v", cfg.BaseDelay)
	}
	if cfg.MaxDelay != 5*time.Second {
		t.Errorf("expected 5s max delay, got %v", cfg.MaxDelay)
	}
}

func TestExponentialDelay(t *testing.T) {
	base := 100 * time.Millisecond
	max := 2 * time.Second

	d0 := ExponentialDelay(0, base, max)
	if d0 != 100*time.Millisecond {
		t.Errorf("attempt 0: expected 100ms, got %v", d0)
	}

	d1 := ExponentialDelay(1, base, max)
	if d1 != 200*time.Millisecond {
		t.Errorf("attempt 1: expected 200ms, got %v", d1)
	}

	d2 := ExponentialDelay(2, base, max)
	if d2 != 400*time.Millisecond {
		t.Errorf("attempt 2: expected 400ms, got %v", d2)
	}

	// Should cap at max.
	d10 := ExponentialDelay(10, base, max)
	if d10 != max {
		t.Errorf("attempt 10: expected cap at %v, got %v", max, d10)
	}

	// Negative attempt returns base.
	dNeg := ExponentialDelay(-1, base, max)
	if dNeg != base {
		t.Errorf("negative attempt: expected base %v, got %v", base, dNeg)
	}
}

func TestRetryWithBackoffSuccess(t *testing.T) {
	calls := 0
	cfg := RetryConfig{MaxAttempts: 3, BaseDelay: time.Millisecond, MaxDelay: 10 * time.Millisecond}

	err := RetryWithBackoff(cfg, func() error {
		calls++
		if calls < 3 {
			return errors.New("not yet")
		}
		return nil
	})

	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if calls != 3 {
		t.Errorf("expected 3 calls, got %d", calls)
	}
}

func TestRetryWithBackoffAllFail(t *testing.T) {
	cfg := RetryConfig{MaxAttempts: 2, BaseDelay: time.Millisecond, MaxDelay: 10 * time.Millisecond}

	err := RetryWithBackoff(cfg, func() error {
		return errors.New("fail")
	})

	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestRetryWithBackoffInvalidAttempts(t *testing.T) {
	cfg := RetryConfig{MaxAttempts: 0, BaseDelay: time.Millisecond, MaxDelay: time.Millisecond}
	err := RetryWithBackoff(cfg, func() error { return nil })
	if err == nil {
		t.Fatal("expected error for zero max attempts")
	}
}

func TestIsRetryable(t *testing.T) {
	if IsRetryable(nil) {
		t.Error("nil error should not be retryable")
	}

	if IsRetryable(ErrPermanent) {
		t.Error("permanent error should not be retryable")
	}

	if !IsRetryable(errors.New("transient")) {
		t.Error("transient error should be retryable")
	}
}
