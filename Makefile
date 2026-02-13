.PHONY: help install dev build build-lib lint lint-fix typecheck check test test-coverage test-storybook serve preview publish clean

## -- Local Development -------------------------------------------------------

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start Storybook dev server (port 6006)
	npm run storybook

build: ## Build Storybook for static hosting
	npm run build-storybook

build-lib: ## Build component library (dist/)
	npm run build:lib

lint: ## Run ESLint (zero warnings allowed)
	npm run lint

lint-fix: ## Run ESLint with auto-fix
	npm run lint:fix

typecheck: ## Run TypeScript type checks
	npx tsc --noEmit

check: lint typecheck ## Run all checks (lint + typecheck)

test: ## Run unit tests
	npm run test

test-coverage: ## Run unit tests with coverage
	npm run test:coverage

test-storybook: ## Run Storybook interaction tests
	npm run test:storybook

## -- Serving & Publishing ----------------------------------------------------

serve: build ## Serve built Storybook with basic auth
	npm run serve

preview: build serve ## Build Storybook then serve with basic auth

publish: ## Build library and publish to GitHub Packages
	npm run build:lib
	npm publish

clean: ## Remove build artifacts and node_modules
	rm -rf dist storybook-static node_modules coverage
