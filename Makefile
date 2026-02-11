.PHONY: help install dev build lint clean

## ── Local Development ───────────────────────────────────────────────────

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start development server (port 3000)
	npm run dev
	@echo "Navigate to `http://localhost:3000` to view the Gallery."

build: ## Build for production
	npm run build

lint: ## Run ESLint
	npm run lint

typecheck: ## Run TypeScript type checks
	npx tsc --noEmit

check: lint typecheck ## Run all checks (lint + typecheck)

clean: ## Remove build artifacts and node_modules
	rm -rf .next node_modules
