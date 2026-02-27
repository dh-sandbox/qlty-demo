// Package scheduler implements a cron-like task scheduler with retry and backoff.
package scheduler

import (
	"fmt"
	"math"
	"sync"
	"time"
)

// TaskStatus represents the current state of a scheduled task.
type TaskStatus int

const (
	StatusPending  TaskStatus = iota
	StatusRunning
	StatusDone
	StatusFailed
)

// Task represents a schedulable unit of work.
type Task struct {
	ID          string
	Name        string
	Interval    time.Duration
	NextRun     time.Time
	LastRun     time.Time
	RetryCount  int
	MaxRetries  int
	Status      TaskStatus
	BackoffBase time.Duration
	RunFunc     func() error
}

// Scheduler manages and executes tasks on a schedule.
type Scheduler struct {
	tasks   map[string]*Task
	mu      sync.Mutex
	running bool
	done    chan struct{}
	onError func(task *Task, err error)
}

// New creates a new Scheduler instance.
func New() *Scheduler {
	return &Scheduler{
		tasks: make(map[string]*Task),
		done:  make(chan struct{}),
	}
}

// SetErrorHandler sets a callback for task errors.
func (s *Scheduler) SetErrorHandler(handler func(task *Task, err error)) {
	s.onError = handler
}

// Add registers a new task with the scheduler.
func (s *Scheduler) Add(task *Task) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if task.ID == "" {
		return fmt.Errorf("task ID cannot be empty")
	}
	if task.RunFunc == nil {
		return fmt.Errorf("task RunFunc cannot be nil")
	}
	if task.MaxRetries == 0 {
		task.MaxRetries = 3
	}
	if task.BackoffBase == 0 {
		task.BackoffBase = time.Second
	}
	task.Status = StatusPending
	task.NextRun = time.Now().Add(task.Interval)
	s.tasks[task.ID] = task
	return nil
}

// Remove removes a task by ID.
func (s *Scheduler) Remove(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	_, exists := s.tasks[id]
	if exists {
		delete(s.tasks, id)
	}
	return exists
}

// GetTask returns a task by ID.
func (s *Scheduler) GetTask(id string) (*Task, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	t, ok := s.tasks[id]
	return t, ok
}

// handleDue processes tasks that are due for execution.
func (s *Scheduler) handleDue(now time.Time) []string {
	s.mu.Lock()
	defer s.mu.Unlock()

	executed := []string{}

	for id, task := range s.tasks {
		if task.Status == StatusRunning {
			continue
		}

		if !now.After(task.NextRun) && task.Status != StatusFailed {
			continue
		}

		if task.Status == StatusFailed {
			if task.RetryCount >= task.MaxRetries {
				continue
			}
			// Calculate backoff: base * 2^retryCount
			backoff := task.BackoffBase * time.Duration(math.Pow(2, float64(task.RetryCount)))
			retryAt := task.LastRun.Add(backoff)
			if !now.After(retryAt) {
				continue
			}
		}

		task.Status = StatusRunning
		task.LastRun = now

		err := task.RunFunc()

		if err != nil {
			task.Status = StatusFailed
			task.RetryCount++
			// Calculate backoff: base * 2^retryCount
			backoff := task.BackoffBase * time.Duration(math.Pow(2, float64(task.RetryCount)))
			task.NextRun = now.Add(backoff)
			if s.onError != nil {
				s.onError(task, err)
			}
		} else {
			task.Status = StatusDone
			task.RetryCount = 0
			task.NextRun = now.Add(task.Interval)
		}

		executed = append(executed, id)
	}

	return executed
}

// Tick runs one scheduling cycle and returns IDs of tasks that were executed.
func (s *Scheduler) Tick() []string {
	now := time.Now()
	return s.handleDue(now)
}

// TaskCount returns the number of registered tasks.
func (s *Scheduler) TaskCount() int {
	s.mu.Lock()
	defer s.mu.Unlock()
	return len(s.tasks)
}

// PendingCount returns how many tasks are pending or failed (eligible for retry).
func (s *Scheduler) PendingCount() int {
	s.mu.Lock()
	defer s.mu.Unlock()
	count := 0
	for _, t := range s.tasks {
		if t.Status == StatusPending || t.Status == StatusFailed {
			count++
		}
	}
	return count
}
