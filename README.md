# UASC Agent — Phase 1

Hybrid LLM-powered intelligence agent for the **Unmanned Aerial Systems Center (UASC), Dubai Police**.

> **Prototype notice**: This deployment uses synthetic/public documents only. No real Dubai Police data until the system migrates to Azure UAE North with InfoSec sign-off.

## Live URLs (after deployment)
| Service | URL |
|---------|-----|
| Frontend | `https://<your-project>.vercel.app` |
| Backend API | `https://<your-service>.onrender.com` |
| API docs | `https://<your-service>.onrender.com/docs` |

---

## Architecture

```
apps/web          Next.js 14 (Vercel)         — /upload, /chat
apps/api          FastAPI (Render)             — REST API, RAG pipeline
workers/ingestion Python worker (Render)       — Phase 2 async ingestion
packages/shared   TypeScript types             — shared between web/api
infra/            render.yaml, vercel.json     — deployment configs
scripts/          eval.py, eval_questions.yaml — eval harness
```

### Provider-agnostic interface layers

Every external service is accessed through an interface. Swapping a provider = one line in `dependencies.py`.

| Interface | Phase 1 impl | Future |
|-----------|-------------|--------|
| `LLMClient` | `CloudClient` (Anthropic Claude) | `OpenAIClient`, `AzureOpenAIClient`, `LocalClient` (Ollama/vLLM) |
| `EmbeddingClient` | `CohereEmbeddingClient` (multilingual-v3) | `OpenAIEmbeddingClient`, `BGEM3Client` |
| `VectorStore` | `QdrantCloudStore` | `LocalQdrantStore` (on-prem) |
| `ObjectStore` | `SupabaseStorageStore` | `AzureBlobStore`, `LocalFileStore` |
| `Database` | `SupabasePostgresDB` | `AzurePostgresDB` |

---

## Prerequisites

- Node 20+, Python 3.11+
- Accounts: Supabase, Qdrant Cloud, Anthropic, Cohere, Vercel, Render

---

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd uasc-agent
npm install           # installs workspace deps (apps/web)
cd apps/api && pip install -r requirements.txt
```

### 2. Environment variables

```bash
cp .env.example .env
# Fill in all values (see sections below)
```

### 3. Supabase project

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `apps/api/db/migrations.sql`
3. Go to **Storage** → create a bucket named `documents` with **public read** enabled
4. Copy **Project URL** → `SUPABASE_URL`
5. Copy **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
6. Copy **anon key** → `SUPABASE_ANON_KEY`

### 4. Qdrant Cloud cluster

1. Create a free cluster at [cloud.qdrant.io](https://cloud.qdrant.io)
2. Copy cluster URL → `QDRANT_URL`
3. Create an API key → `QDRANT_API_KEY`
4. The collection `uasc_chunks` is created automatically on first upload

### 5. Anthropic API key

1. Get a key at [console.anthropic.com](https://console.anthropic.com)
2. Set `ANTHROPIC_API_KEY`

### 6. Cohere API key

1. Get a key at [dashboard.cohere.com](https://dashboard.cohere.com)
2. Set `COHERE_API_KEY`

---

## Local development

```bash
# Terminal 1: API
cd apps/api
uvicorn main:app --reload

# Terminal 2: Web
cd apps/web
npm run dev
```

Or use the Makefile shortcut (requires separate terminal windows):
```bash
make dev-api   # terminal 1
make dev-web   # terminal 2
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

### Deploy API to Render

1. Connect this repo to [render.com](https://render.com)
2. Use `infra/render.yaml` as the Blueprint
3. Set all env vars in the Render dashboard (see `.env.example`)
4. Service URL → set as `NEXT_PUBLIC_API_URL` in Vercel

### Deploy frontend to Vercel

```bash
cd apps/web
vercel --prod
```

Or push to `main` — Vercel auto-deploys.

Set environment variable `NEXT_PUBLIC_API_URL` = your Render API URL.

---

## Eval harness

```bash
# Against local API
make eval

# Against production
API_URL=https://your-api.onrender.com make eval-remote
```

Edit `scripts/eval_questions.yaml` to add domain-specific questions.

---

## Makefile reference

| Command | Action |
|---------|--------|
| `make dev-api` | Run FastAPI locally with auto-reload |
| `make dev-web` | Run Next.js locally |
| `make deploy` | Deploy both Render + Vercel |
| `make eval` | Run eval harness against localhost |
| `make eval-remote` | Run eval against `$API_URL` |
| `make logs` | Tail Render API logs |
| `make setup-db` | Reminder to run migrations.sql |

---

## Phase roadmap

| Phase | What ships |
|-------|-----------|
| **1 (now)** | Upload, vector indexing, RAG chat, audit log, eval harness |
| **2** | NOTAM/AirHub/DroneSec feeds, PostGIS, Supabase Auth, async ingestion worker |
| **3** | Local LLM (Ollama/vLLM on-prem), classification-based router, LocalQdrantStore |
| **4** | Operational writes (with explicit governance gate) |
| **Migration** | Azure UAE North: AzureBlobStore, AzurePostgresDB, Entra ID auth |

---

## Security notes

- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — server-side only, never in the browser
- Mock auth middleware in `apps/api/middleware/auth.py` — replace before production
- All queries are written to `audit_log` table in Supabase
- Restricted-classification chunks trigger a warning in the response `limitations` field
