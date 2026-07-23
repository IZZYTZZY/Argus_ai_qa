from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.v1 import projects, documents, test_cases, ai, dashboard

settings = get_settings()

app = FastAPI(
    title="Argus API",
    description="AI QA Engineer — enterprise quality engineering platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API = "/api/v1"
app.include_router(projects.router, prefix=API)
app.include_router(documents.router, prefix=API)
app.include_router(test_cases.router, prefix=API)
app.include_router(ai.router, prefix=API)
app.include_router(dashboard.router, prefix=API)


@app.get("/health")
def health():
    return {"status": "ok", "service": "argus-api"}
