package main

import (
	"fmt"
	"time"

	"github.com/dh-sandbox/qlty-demo/worker/processor"
)

func main() {
	p := processor.NewProcessor(4)

	jobs := []processor.Job{
		{ID: "job-1", Name: "Send welcome email", Priority: processor.High, Payload: map[string]string{"to": "user@example.com"}},
		{ID: "job-2", Name: "Generate report", Priority: processor.Medium, Payload: map[string]string{"format": "pdf"}},
		{ID: "job-3", Name: "Resize image", Priority: processor.Low, Payload: map[string]string{"width": "800"}},
		{ID: "job-4", Name: "Sync inventory", Priority: processor.Critical, Payload: map[string]string{"source": "warehouse-a"}},
	}

	for _, job := range jobs {
		if err := p.Enqueue(job); err != nil {
			fmt.Printf("enqueue error: %v\n", err)
			continue
		}
	}

	fmt.Printf("Pending jobs: %d\n", p.PendingCount())

	results := p.ProcessAll()
	for _, r := range results {
		fmt.Printf("Job %s: success=%v duration=%v output=%q\n", r.JobID, r.Success, r.Duration.Round(time.Millisecond), r.Output)
	}
}
