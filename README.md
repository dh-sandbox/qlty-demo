[![Maintainability](https://qlty.sh/gh/dh-sandbox/projects/qlty-demo/maintainability.svg)](https://qlty.sh/gh/dh-sandbox/projects/qlty-demo)
[![Code Coverage](https://qlty.sh/gh/dh-sandbox/projects/qlty-demo/coverage.svg)](https://qlty.sh/gh/dh-sandbox/projects/qlty-demo)

# Qlty Demo Monorepo

A polyglot monorepo demonstrating [Qlty](https://qlty.sh) code quality tools across four languages. Built as a reference for docs, blog posts, and customer onboarding.

## Structure

| Directory | Language   | Framework     | Linter/Formatter     | Tests  |
|-----------|-----------|---------------|----------------------|--------|
| `app/`    | TypeScript | React + Vite  | ESLint + Prettier    | Vitest |
| `api/`    | Python     | FastAPI       | Ruff                 | pytest |
| `worker/` | Go         | stdlib        | golangci-lint + gofmt| go test|
| `scripts/`| Ruby       | —             | RuboCop              | RSpec  |

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Go 1.22+
- Ruby 3.2+
- [Qlty CLI](https://docs.qlty.sh/cli/quickstart)

### Install Dependencies

```bash
# TypeScript
cd app && npm install

# Python
cd api && pip install -e ".[test]"

# Go (no install needed)

# Ruby
cd scripts && bundle install
```

### Run Tests

```bash
cd app && npm test -- --run
cd api && python -m pytest
cd worker && go test ./...
cd scripts && bundle exec rspec
```

### Run Coverage

```bash
cd app && npm run test:coverage
cd api && python -m pytest --cov --cov-report=xml
cd worker && go test -coverprofile=coverage.out ./...
cd scripts && bundle exec rspec  # SimpleCov runs automatically
```

## Qlty Integration

### Code Quality

```bash
# Check all code
qlty check

# Auto-fix issues
qlty check --fix --level=low

# Format all code
qlty fmt
```

### Git Hooks

```bash
qlty githooks install
```

This installs pre-commit hooks that run `qlty check` and `qlty fmt` before each commit.

### Configuration

Qlty configuration lives in `.qlty/qlty.toml`. Plugins are scoped to their respective directories:

- **ESLint + Prettier** → `app/`
- **Ruff** → `api/`
- **golangci-lint** → `worker/`
- **RuboCop** → `scripts/`

## Claude Code Integration

This repo includes Claude Code configuration for AI-assisted development:

- **CLAUDE.md** — Project instructions for Claude Code
- **.claude/settings.json** — Hooks that auto-format on file writes and check quality before commits

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

- **ci.yml** — Runs tests and uploads coverage for all four languages
- **qlty.yml** — Runs Qlty Cloud analysis on PRs and pushes to main
