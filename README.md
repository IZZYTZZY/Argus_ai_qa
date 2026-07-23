# Argus — AI QA Engineer

An enterprise AI quality-engineering platform: Argus understands your product from its
documents, code and history, then generates, maintains and audits your test suite
continuously — like a senior QA engineer who works 24/7.

## Stack

| Layer      | Technology                                   | Deploys to |
|------------|----------------------------------------------|------------|
| Frontend   | Next.js 14 · TypeScript · Tailwind · Geist   | **Vercel** |
| Backend    | FastAPI · SQLAlchemy 2 · agentic AI pipeline | **Render** |
| Database   | PostgreSQL + pgvector · Auth · Storage       | **Supabase** |
| AI         | OpenAI-compatible abstraction · RAG          | any provider |
| Local dev  | Docker Compose (pgvector + Redis + API)      | — |

## Repository layout

```
argus/
├── frontend/                 # Next.js app (Vercel)
│   ├── app/                  # landing, login, and the (app) workspace
│   ├── components/           # design system: ui, shell, dial, heatmap, charts
│   └── lib/                  # api client, supabase, demo seed data
├── backend/                  # FastAPI (Render)
│   └── app/
│       ├── api/v1/           # projects, documents, test_cases, ai, dashboard
│       ├── core/             # config, db session, Supabase JWT auth
│       ├── models/           # SQLAlchemy models (mirror supabase schema)
│       ├── schemas/          # Pydantic I/O contracts
│       └── services/         # llm, rag, extract, audit, agents/
├── supabase/migrations/      # 001_init.sql — schema, RLS, triggers
├── docs/                     # architecture + deployment guides
├── docker-compose.yml        # full local stack
└── render.yaml               # Render blueprint for the API
```

## Quick start (demo mode — zero config)

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000 — full UI with realistic seed data
```

With no env vars set, the UI runs in **demo mode**: every screen works with
seeded data for a fictional "Meridian Commerce" project. Perfect for the first
client walkthrough.

## Full stack locally

```bash
cp backend/.env.example backend/.env    # add your LLM_API_KEY
docker compose up --build               # Postgres+pgvector, Redis, API on :8000

cd frontend
cp .env.example .env.local              # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

## Production deployment

See `docs/DEPLOYMENT.md` for the full Vercel + Render + Supabase walkthrough.
Short version:

1. **Supabase** — create a project, run `supabase/migrations/001_init.sql` in the
   SQL editor, enable email auth.
2. **Render** — "New → Blueprint", point at this repo (`render.yaml`), fill env vars.
3. **Vercel** — import the repo, set root directory to `frontend/`, add
   `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## The agent team

Nine specialized agents (backend/app/services/agents/team.py), composed by an
orchestrator and grounded in project knowledge via pgvector RAG:

Product Understanding · Requirement Analysis · Test Generation · Coverage Analysis ·
Bug Investigation · Risk Assessment · Test Maintenance · Automation Generation ·
Knowledge Retrieval

## Roadmap to full spec

Implemented now: knowledge ingestion (PDF/DOCX/text → RAG), multi-agent test
generation, coverage audit, risk prediction, bug investigation, chat, dashboard,
audit logging, JWT auth, multi-tenant schema with RLS, demo mode.

Next milestones: GitHub webhook-driven auto-maintenance, automation script export
bundles, Jira/Azure DevOps two-way sync, review/approval workflow UI, background
jobs (Redis queue), SSO/SAML.
