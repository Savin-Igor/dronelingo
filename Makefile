.PHONY: \
  dev dev-setup stop logs shell \
  db-up db-down \
  migrate migrate-deploy push studio backup import-content \
  index-search index-search-dry \
  build clean \
  check test test-e2e validate-questions validate-source-refs validate-source-policy \
  release deploy \
  blog blog-search blog-write \
  help

DC = docker compose -f docker-compose.dev.yml

##@ Development

dev: db-up ## Daily dev: DB + schema sync + Next.js dev server
	$(MAKE) push
	npm run dev

dev-setup: db-up ## First-time setup: DB + schema + dev server
	@echo "Waiting for DB..."
	@until $(DC) exec -T db pg_isready -U postgres -q; do sleep 1; done
	$(MAKE) push
	npm run dev

stop: ## Stop dev containers (data preserved)
	$(DC) down

logs: ## Stream dev container logs
	$(DC) logs -f

shell: ## Shell in db container
	$(DC) exec db sh

clean: ## Remove Next.js build cache (.next/)
	rm -rf .next

##@ Database

db-up: ## Start local PostgreSQL container
	$(DC) up -d db

db-down: ## Stop local PostgreSQL container
	$(DC) down

push: ## Apply schema to local DB without migrations (dev only)
	npx prisma generate && npx prisma db push

migrate: ## Run prisma migrate dev (interactive, creates migration files)
	npx prisma migrate dev

migrate-deploy: ## Run prisma migrate deploy (production-safe)
	npx prisma migrate deploy

studio: ## Open Prisma Studio
	npx prisma studio

backup: ## Backup local DB to ./backups/
	@mkdir -p backups
	$(DC) exec -T db pg_dump -U postgres dronelingo > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "Backup saved to backups/"

import-content: ## Import content/ (topics, lessons, questions) into local DB
	set -a && . ./.env.local && set +a && npx tsx scripts/import-content.ts

index-search: ## Build search chunks + embeddings (downloads ~120 MB model on first run)
	set -a && . ./.env.local && set +a && npx tsx scripts/index-search.ts

index-search-dry: ## Build search chunks only; leaves embeddings NULL (no model download)
	set -a && . ./.env.local && set +a && npx tsx scripts/index-search.ts --dry

##@ Build

build: ## Build production Docker image locally
	docker build -t dronelingo:local .

check: ## TypeScript + ESLint + source/content policy validation
	npm run type-check && npm run lint && $(MAKE) validate-source-refs && $(MAKE) validate-source-policy

test: ## Run Vitest unit tests
	npm test

test-e2e: ## Run Playwright e2e tests (dev server must be running or will be started)
	npm run test:e2e

validate-questions: ## Validate content/questions/*.yml structure
	python3 scripts/validate-questions.py

validate-source-refs: ## Validate public sourceRef links across questions, lessons, and blog meta
	npx tsx scripts/validate-source-refs.ts

validate-source-policy: ## Validate source-family mirroring/SEO policy registry
	npx tsx scripts/validate-source-policy.ts

##@ Production

release: ## Cut a tag-driven release: make release v=0.1.0 (triggers GitHub Actions deploy)
	@test -n "$(v)" || (echo "Usage: make release v=0.1.0" && exit 1)
	@echo "$(v)" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9.]+)?$$' \
	  || (echo "v must be semver like 0.1.0 or 0.1.0-rc.1" && exit 1)
	git tag -a v$(v) -m "Release v$(v)"
	git push origin v$(v)

deploy: ## Manual SSH deploy of latest image (skips CI). Use only for hotfix.  [DEPLOY_HOST=user@host]
	@test -n "$(DEPLOY_HOST)" || (echo "DEPLOY_HOST not set. Usage: make deploy DEPLOY_HOST=user@host" && exit 1)
	ssh $(DEPLOY_HOST) 'cd /opt/dronelingo && \
	  docker compose pull app && \
	  docker compose up -d --no-deps app && \
	  docker image prune -f'

##@ Blog automation

blog-search: ## Search drone news and update .news-queue.json (requires Claude Code)
	claude -p "$$(cat scripts/blog-search-prompt.txt)" --dangerously-skip-permissions

blog-write: ## Write one blog post from queue → hero image → draft PR (requires Claude Code)
	claude -p "$$(cat scripts/blog-write-prompt.txt)" --dangerously-skip-permissions

blog: blog-search blog-write ## Full pipeline: search news + write post + draft PR

##@ Help

help: ## Show available targets
	@awk ' \
	  BEGIN { FS = ":.*##"; printf "\n\033[1mdronelingo — make targets\033[0m\n" } \
	  /^##@/ { printf "\n\033[1;33m%s\033[0m\n", substr($$0, 5) } \
	  /^[a-zA-Z0-9_-]+:.*?##/ { printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2 } \
	  END { printf "\n" } \
	' $(MAKEFILE_LIST)
