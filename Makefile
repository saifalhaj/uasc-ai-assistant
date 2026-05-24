.PHONY: dev dev-api dev-web deploy deploy-api deploy-web eval logs setup-db help

API_DIR := apps/api
WEB_DIR := apps/web

help:
	@echo "UASC Agent — available targets:"
	@echo "  make dev          Start both API and web locally (cloud services)"
	@echo "  make dev-api      Start only the FastAPI backend"
	@echo "  make dev-web      Start only the Next.js frontend"
	@echo "  make deploy       Deploy both API (Render) and web (Vercel)"
	@echo "  make eval         Run the eval harness against local API"
	@echo "  make eval-remote  Run the eval harness against production API"
	@echo "  make logs         Tail Render API logs"
	@echo "  make setup-db     Print reminder to run migrations.sql in Supabase"

dev:
	@echo "Starting API and web (run in separate terminals or use a process manager)..."
	$(MAKE) -j2 dev-api dev-web

dev-api:
	cd $(API_DIR) && uvicorn main:app --reload --host 0.0.0.0 --port 8000

dev-web:
	cd $(WEB_DIR) && npm run dev

deploy: deploy-api deploy-web

deploy-api:
	@echo "Triggering Render deploy for uasc-api..."
	render deploy --service uasc-api

deploy-web:
	@echo "Deploying to Vercel..."
	cd $(WEB_DIR) && vercel --prod

eval:
	cd $(API_DIR) && python ../../scripts/eval.py --api-url http://localhost:8000

eval-remote:
	@if [ -z "$(API_URL)" ]; then echo "Set API_URL=https://your-api.onrender.com"; exit 1; fi
	python scripts/eval.py --api-url $(API_URL)

logs:
	render logs --service uasc-api --tail

setup-db:
	@echo "Run the following SQL in your Supabase project SQL editor:"
	@echo "  File: apps/api/db/migrations.sql"
	@echo ""
	@echo "Then create a storage bucket named 'documents' with public read access."
