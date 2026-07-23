import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---- Projects ----
class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    repo_url: str | None = None
    org_id: uuid.UUID


class ProjectOut(ORM):
    id: uuid.UUID
    org_id: uuid.UUID
    name: str
    description: str | None
    repo_url: str | None
    health_score: float
    readiness_score: float
    created_at: datetime


# ---- Documents ----
class DocumentOut(ORM):
    id: uuid.UUID
    project_id: uuid.UUID
    kind: str
    title: str
    source: str | None
    status: str
    created_at: datetime


# ---- Test cases ----
class TestCaseOut(ORM):
    id: uuid.UUID
    project_id: uuid.UUID
    test_key: str
    title: str
    description: str | None
    objective: str | None
    category: str
    preconditions: list
    test_data: dict
    environment: str | None
    steps: list
    expected_result: str | None
    postconditions: list
    priority: str
    severity: str
    risk_level: str
    automation_readiness: float
    traceability: list
    status: str
    version: int
    generated_by: str
    created_at: datetime
    updated_at: datetime


class TestCaseUpdate(BaseModel):
    title: str | None = None
    status: str | None = None
    priority: str | None = None
    steps: list | None = None
    expected_result: str | None = None


# ---- AI requests ----
class GenerateRequest(BaseModel):
    project_id: uuid.UUID
    scope: str
    categories: list[str] = []


class CoverageRequest(BaseModel):
    project_id: uuid.UUID


class RiskRequest(BaseModel):
    project_id: uuid.UUID
    signals: str = ""


class BugRequest(BaseModel):
    project_id: uuid.UUID | None = None
    input_text: str


class MaintenanceRequest(BaseModel):
    project_id: uuid.UUID
    change: str


class AutomationRequest(BaseModel):
    test_case_id: uuid.UUID
    framework: str


class ChatRequest(BaseModel):
    project_id: uuid.UUID | None = None
    message: str
