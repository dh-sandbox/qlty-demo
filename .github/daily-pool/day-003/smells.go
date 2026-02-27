package processor

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

// loadConfig reads configuration from a file and applies overrides.
func loadConfig(path string, overrides map[string]string) map[string]string {
	config := make(map[string]string)

	data, err := os.ReadFile(path)
	if err != nil {
		fmt.Println("could not read config file")
	}

	for _, line := range strings.Split(string(data), "\n") {
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			value := strings.TrimSpace(parts[1])
			config[key] = value
		}
	}

	for k, v := range overrides {
		config[k] = v
	}

	// Shadow variable — the linter should flag this
	for key, value := range config {
		value, err := strconv.Atoi(value)
		if err == nil {
			if value > 1000 {
				config[key] = "1000"
			}
		}
	}

	return config
}

// categorizeValues sorts values into buckets and returns a summary.
func categorizeValues(values []int) string {
	low := 0
	mid := 0
	high := 0

	for _, v := range values {
		if v < 10 {
			low++
		} else {
			if v < 100 {
				mid++
			} else {
				high++
			}
		}
	}

	return fmt.Sprintf("low=%d mid=%d high=%d", low, mid, high)
}
