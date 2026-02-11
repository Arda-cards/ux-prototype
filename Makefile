.PHONY: help install dev build lint lint-fix typecheck check clean

## ── Local Development ───────────────────────────────────────────────────

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start development server (port 3000)
	npm run dev

build: ## Build for production
	npm run build

lint: ## Run ESLint (zero warnings allowed)
	npm run lint

lint-fix: ## Run ESLint with auto-fix
	npm run lint:fix

typecheck: ## Run TypeScript type checks
	npx tsc --noEmit

check: lint typecheck ## Run all checks (lint + typecheck)

clean: ## Remove build artifacts and node_modules
	rm -rf .next node_modules
