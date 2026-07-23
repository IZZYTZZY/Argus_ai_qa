# Architecture

## System overview

```
┌────────────┐   HTTPS    ┌─────────────┐   SQL/pgvector   ┌────────────┐
│  Next.js   │ ─────────▶ │  FastAPI    │ ───────────────▶ │  Supabase  │
│  (Vercel)  │  Bearer    │  (Render)   │                  │  Postgres  │
└────────────┘  JWT       └──────┬──────┘                  │  + Auth    │
      │                          │  OpenAI-compatible      │  + Storage │
      │  Supabase Auth SDK       ▼                         └────────────┘
      └───────────────────▶ LLM provider
```

- The frontend authenticates directly with **Supabase Auth** and forwards the
  access token to the API as a Bearer token.
- The API verifies the JWT with the shared Supabase secret (`app/core/security.py`)
  — no session state on the server.
- Postgres is the single source of truth; **RLS policies** enforce tenancy at the
  database layer even if a future client talks to Supabase directly.

## AI pipeline

1. **Ingestion** — uploads are text-extracted (`services/extract.py`), chunked
   (1200 chars, 150 overlap), embedded, and stored in `knowledge_chunks` (pgvector).
2. **Retrieval** — every agent task begins with a cosine-similarity retrieval
   scoped to the project (`services/rag.py`).
3. **Agents** — each agent (`services/agents/team.py`) is a role + system prompt
   returning strict JSON. The orchestrator chains them:
   `understand → analyze requirements → generate tests → audit coverage`.
4. **Persistence** — structured agent output is written to typed tables
   (`test_cases`, `coverage_reports`, `risk_predictions`, `bug_investigations`),
   and every AI action lands in `audit_logs` for explainability.

Swapping in LangGraph later: the orchestrator functions map 1:1 to graph nodes;
the Agent base class is deliberately framework-agnostic so migration is additive.

## Multi-tenancy

organizations → memberships (role) → projects → everything else.
Roles: owner / admin / member / viewer. RBAC checks belong in the API layer
(role on `memberships`) with RLS as defense-in-depth.

## Why this shape

- **API-first**: every UI action is a documented endpoint (`/docs` via FastAPI).
- **Portable**: SQLAlchemy against plain Postgres — leaving Supabase for RDS or
  Cloud SQL later is a connection-string change, not a rewrite.
- **Demo mode**: the frontend degrades gracefully with zero env vars, which keeps
  sales demos decoupled from infrastructure.
