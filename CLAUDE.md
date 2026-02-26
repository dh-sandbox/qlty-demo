# Qlty Demo Monorepo

This is a polyglot monorepo demonstrating Qlty code quality tools across four languages.

## Project Structure

- **app/** — TypeScript (React/Vite) web app with Vitest tests
- **api/** — Python (FastAPI) backend with pytest tests
- **worker/** — Go background worker with go test
- **scripts/** — Ruby utility scripts with RSpec tests

## Before Committing

1. Run `qlty fmt` to auto-format all code
2. Run `qlty check --fix --level=low` to fix linting issues
3. Run tests for the language(s) you changed:
   - TypeScript: `cd app && npm test -- --run`
   - Python: `cd api && python -m pytest`
   - Go: `cd worker && go test ./...`
   - Ruby: `cd scripts && bundle exec rspec`

## Qlty Configuration

- Config lives in `.qlty/qlty.toml`
- Plugins: ESLint, Prettier (app/), Ruff (api/), golangci-lint (worker/), RuboCop (scripts/)

## Coverage

Each language generates coverage reports:
- TypeScript: `cd app && npm run test:coverage` (LCOV)
- Python: `cd api && python -m pytest --cov --cov-report=xml`
- Go: `cd worker && go test -coverprofile=coverage.out ./...`
- Ruby: `cd scripts && bundle exec rspec` (SimpleCov JSON)
