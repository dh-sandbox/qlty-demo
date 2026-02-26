package processor

import (
	"testing"
)

func TestNewProcessor(t *testing.T) {
	p := NewProcessor(4)
	if p.concurrency != 4 {
		t.Errorf("expected concurrency 4, got %d", p.concurrency)
	}

	p = NewProcessor(0)
	if p.concurrency != 1 {
		t.Errorf("expected concurrency clamped to 1, got %d", p.concurrency)
	}
}

func TestEnqueue(t *testing.T) {
	p := NewProcessor(2)

	job := Job{ID: "j1", Name: "test job", Payload: map[string]string{"key": "val"}}
	if err := p.Enqueue(job); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(p.queue) != 1 {
		t.Fatalf("expected 1 job in queue, got %d", len(p.queue))
	}
	if p.queue[0].Status != Pending {
		t.Errorf("expected status %q, got %q", Pending, p.queue[0].Status)
	}

	// Duplicate ID should fail.
	err := p.Enqueue(Job{ID: "j1", Name: "duplicate"})
	if err == nil {
		t.Fatal("expected error for duplicate ID, got nil")
	}
}

func TestProcess(t *testing.T) {
	p := NewProcessor(1)

	// Successful job.
	job := Job{ID: "j1", Name: "ok job", Payload: map[string]string{"a": "1"}}
	result := p.Process(&job)
	if !result.Success {
		t.Errorf("expected success, got failure: %s", result.Output)
	}
	if job.Status != Completed {
		t.Errorf("expected status %q, got %q", Completed, job.Status)
	}

	// Job with "fail" key in payload.
	failing := Job{ID: "j2", Name: "bad job", Payload: map[string]string{"fail": "true"}}
	result = p.Process(&failing)
	if result.Success {
		t.Error("expected failure, got success")
	}
	if failing.Status != Failed {
		t.Errorf("expected status %q, got %q", Failed, failing.Status)
	}
}

func TestProcessAll(t *testing.T) {
	p := NewProcessor(2)
	_ = p.Enqueue(Job{ID: "a", Name: "first", Payload: map[string]string{}})
	_ = p.Enqueue(Job{ID: "b", Name: "second", Payload: map[string]string{}})

	results := p.ProcessAll()
	if len(results) != 2 {
		t.Fatalf("expected 2 results, got %d", len(results))
	}
	for _, r := range results {
		if !r.Success {
			t.Errorf("job %s failed unexpectedly", r.JobID)
		}
	}
}

func TestPendingCount(t *testing.T) {
	p := NewProcessor(2)
	_ = p.Enqueue(Job{ID: "x", Name: "one", Payload: map[string]string{}})
	_ = p.Enqueue(Job{ID: "y", Name: "two", Payload: map[string]string{}})

	if c := p.PendingCount(); c != 2 {
		t.Errorf("expected 2 pending, got %d", c)
	}

	p.ProcessAll()
	if c := p.PendingCount(); c != 0 {
		t.Errorf("expected 0 pending after processing, got %d", c)
	}
}

func TestEnqueueValidation(t *testing.T) {
	p := NewProcessor(1)

	if err := p.Enqueue(Job{ID: "", Name: "no id"}); err == nil {
		t.Error("expected error for empty ID")
	}
	if err := p.Enqueue(Job{ID: "v1", Name: ""}); err == nil {
		t.Error("expected error for empty name")
	}
}
