# Deployment — Vercel + Render + Supabase

## 1 · Supabase (database + auth)

1. Create a project at supabase.com.
2. SQL Editor → paste and run `supabase/migrations/001_init.sql`.
3. Authentication → Providers → enable **Email** (add Google later if needed).
4. Collect from Settings → API:
   - Project URL → `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
   - anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - JWT secret → `SUPABASE_JWT_SECRET`
5. Settings → Database → Connection string (URI). Convert prefix to
   `postgresql+psycopg://` → `DATABASE_URL`.
   Use the **connection pooler** (port 6543, "transaction" mode) for Render.

## 2 · Render (backend)

1. New → **Blueprint** → select this repo. Render reads `render.yaml`.
2. Fill env vars: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_JWT_SECRET`,
   `LLM_API_KEY`, `CORS_ORIGINS` (your Vercel URL + localhost).
3. Deploy. Verify `https://<service>.onrender.com/health` → `{"status":"ok"}`
   and interactive docs at `/docs`.

Note: Render free tier sleeps after inactivity (~50s cold start). For client
demos keep the frontend in demo mode or use a paid instance.

## 3 · Vercel (frontend)

1. Import the repo → **Root Directory: `frontend`** (important).
2. Env vars:
   - `NEXT_PUBLIC_API_URL` = Render URL (no trailing slash)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (or leave all empty for pure demo mode)
3. Deploy. Add the production URL to `CORS_ORIGINS` on Render and redeploy the API.

## Migration path (if the client approves other platforms)

- Backend → AWS ECS / GCP Cloud Run: `backend/Dockerfile` is ready as-is.
- Database → RDS/Cloud SQL: pg_dump/restore; only `DATABASE_URL` changes.
  Replace Supabase Auth with Auth0/Cognito by swapping `core/security.py`.
- Full k8s: containerized services + stateless API make manifests straightforward.
