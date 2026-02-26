package processor

import (
	"errors"
	"fmt"
	"strings"
	"time"
)

// Priority represents the urgency of a job.
type Priority int

const (
	Low      Priority = iota
	Medium
	High
	Critical
)

// JobStatus represents the current state of a job.
type JobStatus string

const (
	Pending   JobStatus = "pending"
	Running   JobStatus = "running"
	Completed JobStatus = "completed"
	Failed    JobStatus = "failed"
)

// Job represents a unit of work to be processed.
type Job struct {
	ID          string
	Name        string
	Priority    Priority
	Status      JobStatus
	Payload     map[string]string
	CreatedAt   time.Time
	CompletedAt time.Time
}

// Result holds the outcome of processing a single job.
type Result struct {
	JobID    string
	Success  bool
	Output   string
	Duration time.Duration
}

// Processor manages a queue of jobs and processes them.
type Processor struct {
	queue       []Job
	concurrency int
}

// NewProcessor creates a Processor with the given concurrency limit.
func NewProcessor(concurrency int) *Processor {
	if concurrency < 1 {
		concurrency = 1
	}
	return &Processor{
		queue:       make([]Job, 0),
		concurrency: concurrency,
	}
}

// Enqueue validates a job and adds it to the processing queue.
func (p *Processor) Enqueue(job Job) error {
	if job.ID == "" {
		return errors.New("job ID must not be empty")
	}
	if job.Name == "" {
		return errors.New("job name must not be empty")
	}
	for _, existing := range p.queue {
		if existing.ID == job.ID {
			return fmt.Errorf("job with ID %q already exists", job.ID)
		}
	}
	job.Status = Pending
	job.CreatedAt = time.Now()
	p.queue = append(p.queue, job)
	return nil
}

// Process executes a single job and returns the result.
func (p *Processor) Process(job *Job) Result {
	start := time.Now()
	job.Status = Running

	// Simulate failure when the payload contains a "fail" key.
	if _, ok := job.Payload["fail"]; ok {
		job.Status = Failed
		job.CompletedAt = time.Now()
		return Result{
			JobID:    job.ID,
			Success:  false,
			Output:   "job failed: failure flag set in payload",
			Duration: time.Since(start),
		}
	}

	// Build a summary of the payload as simulated output.
	parts := make([]string, 0, len(job.Payload))
	for k, v := range job.Payload {
		parts = append(parts, fmt.Sprintf("%s=%s", k, v))
	}

	job.Status = Completed
	job.CompletedAt = time.Now()
	return Result{
		JobID:    job.ID,
		Success:  true,
		Output:   fmt.Sprintf("processed %s [%s]", job.Name, strings.Join(parts, ", ")),
		Duration: time.Since(start),
	}
}

// PendingCount returns the number of jobs still in the Pending state.
func (p *Processor) PendingCount() int {
	count := 0
	for _, j := range p.queue {
		if j.Status == Pending {
			count++
		}
	}
	return count
}

// ProcessAll processes every pending job in the queue and returns results.
func (p *Processor) ProcessAll() []Result {
	results := make([]Result, 0, len(p.queue))
	for i := range p.queue {
		if p.queue[i].Status == Pending {
			r := p.Process(&p.queue[i])
			results = append(results, r)
		}
	}
	return results
}
