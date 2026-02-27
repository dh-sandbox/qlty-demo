package scheduler

import (
	"fmt"
	"testing"
	"time"
)

func TestNewScheduler(t *testing.T) {
	s := New()
	if s.TaskCount() != 0 {
		t.Errorf("expected 0 tasks, got %d", s.TaskCount())
	}
}

func TestAddTask(t *testing.T) {
	s := New()
	task := &Task{
		ID:       "task-1",
		Name:     "Test Task",
		Interval: time.Minute,
		RunFunc:  func() error { return nil },
	}
	err := s.Add(task)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if s.TaskCount() != 1 {
		t.Errorf("expected 1 task, got %d", s.TaskCount())
	}
}

func TestAddTaskValidation(t *testing.T) {
	s := New()
	err := s.Add(&Task{ID: "", RunFunc: func() error { return nil }})
	if err == nil {
		t.Error("expected error for empty ID")
	}

	err = s.Add(&Task{ID: "ok", RunFunc: nil})
	if err == nil {
		t.Error("expected error for nil RunFunc")
	}
}

func TestRemoveTask(t *testing.T) {
	s := New()
	s.Add(&Task{ID: "r1", RunFunc: func() error { return nil }})
	if !s.Remove("r1") {
		t.Error("expected Remove to return true for existing task")
	}
	if s.Remove("r1") {
		t.Error("expected Remove to return false for non-existent task")
	}
}

func TestGetTask(t *testing.T) {
	s := New()
	s.Add(&Task{ID: "g1", Name: "getter", RunFunc: func() error { return nil }})
	task, ok := s.GetTask("g1")
	if !ok {
		t.Fatal("expected task to exist")
	}
	if task.Name != "getter" {
		t.Errorf("expected name 'getter', got '%s'", task.Name)
	}
	_, ok = s.GetTask("missing")
	if ok {
		t.Error("expected missing task to not exist")
	}
}

func TestTickExecutesDueTasks(t *testing.T) {
	s := New()
	called := false
	s.Add(&Task{
		ID:       "t1",
		Interval: 0,
		RunFunc:  func() error { called = true; return nil },
	})
	// Force task to be due
	s.mu.Lock()
	s.tasks["t1"].NextRun = time.Now().Add(-time.Second)
	s.mu.Unlock()

	executed := s.Tick()
	if !called {
		t.Error("expected task to be called")
	}
	if len(executed) != 1 {
		t.Errorf("expected 1 executed task, got %d", len(executed))
	}
}

func TestRetryOnFailure(t *testing.T) {
	s := New()
	attempts := 0
	s.Add(&Task{
		ID:          "fail1",
		Interval:    time.Minute,
		MaxRetries:  3,
		BackoffBase: time.Millisecond,
		RunFunc: func() error {
			attempts++
			if attempts < 3 {
				return fmt.Errorf("fail attempt %d", attempts)
			}
			return nil
		},
	})

	// Force due
	s.mu.Lock()
	s.tasks["fail1"].NextRun = time.Now().Add(-time.Second)
	s.mu.Unlock()

	// First attempt - fails
	s.Tick()
	task, _ := s.GetTask("fail1")
	if task.Status != StatusFailed {
		t.Errorf("expected StatusFailed, got %d", task.Status)
	}

	// Wait a tiny bit for backoff and retry
	time.Sleep(10 * time.Millisecond)
	s.Tick()

	time.Sleep(10 * time.Millisecond)
	s.Tick()

	task, _ = s.GetTask("fail1")
	if task.Status != StatusDone {
		t.Errorf("expected StatusDone after retries, got %d", task.Status)
	}
}

func TestErrorHandler(t *testing.T) {
	s := New()
	var capturedErr error
	s.SetErrorHandler(func(task *Task, err error) {
		capturedErr = err
	})
	s.Add(&Task{
		ID:       "eh1",
		Interval: 0,
		RunFunc:  func() error { return fmt.Errorf("task error") },
	})
	s.mu.Lock()
	s.tasks["eh1"].NextRun = time.Now().Add(-time.Second)
	s.mu.Unlock()

	s.Tick()
	if capturedErr == nil {
		t.Error("expected error handler to be called")
	}
}

func TestPendingCount(t *testing.T) {
	s := New()
	s.Add(&Task{ID: "p1", RunFunc: func() error { return nil }})
	s.Add(&Task{ID: "p2", RunFunc: func() error { return nil }})
	if s.PendingCount() != 2 {
		t.Errorf("expected 2 pending, got %d", s.PendingCount())
	}
}
