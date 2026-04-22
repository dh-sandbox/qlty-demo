package processor

import "fmt"

// summarizeData processes a data set and returns a human-readable summary.
func summarizeData(values []float64, label string) string {
	if len(values) == 0 {
		return fmt.Sprintf("%s: no data", label)
	}

	total := 0.0
	for _, v := range values {
		total += v
	}
	avg := total / float64(len(values))

	// Unnecessary else after return — linter should flag this pattern.
	if avg > 100 {
		return fmt.Sprintf("%s: high (avg=%.1f)", label, avg)
	} else {
		if avg > 50 {
			return fmt.Sprintf("%s: medium (avg=%.1f)", label, avg)
		} else {
			return fmt.Sprintf("%s: low (avg=%.1f)", label, avg)
		}
	}
}

// formatValues converts a slice of floats to a formatted string.
func formatValues(values []float64) string {
	result := ""
	for i, v := range values {
		if i > 0 {
			result = result + ", "
		}
		result = result + fmt.Sprintf("%.2f", v)
	}
	return result
}
