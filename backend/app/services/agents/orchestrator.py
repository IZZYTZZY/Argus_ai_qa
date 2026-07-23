"""Workflow orchestrator: grounds each agent in RAG context and chains
multi-agent pipelines (understand -> analyze -> generate -> audit)."""
import uuid
from sqlalchemy.orm import Session
from app.services import rag
from app.services.agents.team import TEAM


def _ctx(db: Session, project_id: uuid.UUID, query: str) -> str:
    return rag.project_context(db, project_id, query)


def generate_test_cases(db: Session, project_id: uuid.UUID, scope: str, categories: list[str]) -> dict:
    """Pipeline: product understanding -> requirement analysis -> test generation."""
    ctx = _ctx(db, project_id, scope)
    product = TEAM["product_understanding"].run(f"Model the product, focusing on: {scope}", ctx).output
    reqs = TEAM["requirement_analysis"].run(f"Extract requirements for: {scope}", ctx).output
    task = (
        f"Scope: {scope}\nCategories to cover: {', '.join(categories) or 'all relevant'}\n"
        f"PRODUCT MODEL:\n{product}\nREQUIREMENTS:\n{reqs}"
    )
    tests = TEAM["test_generation"].run(task, ctx).output
    return {"product_model": product, "requirements": reqs, **tests}


def analyze_coverage(db: Session, project_id: uuid.UUID, existing_tests: list[dict]) -> dict:
    ctx = _ctx(db, project_id, "features requirements user journeys")
    summary = [{"test_key": t.get("test_key"), "title": t.get("title"),
                "category": t.get("category"), "traceability": t.get("traceability")}
               for t in existing_tests]
    return TEAM["coverage_analysis"].run(f"EXISTING TESTS ({len(summary)}):\n{summary}", ctx).output


def investigate_bug(db: Session, project_id: uuid.UUID | None, trace: str) -> dict:
    ctx = _ctx(db, project_id, trace[:500]) if project_id else ""
    return TEAM["bug_investigation"].run(f"EVIDENCE:\n{trace}", ctx).output


def assess_risk(db: Session, project_id: uuid.UUID, signals: str) -> dict:
    ctx = _ctx(db, project_id, "modules architecture recent changes bug history")
    return TEAM["risk_assessment"].run(f"CHANGE & BUG SIGNALS:\n{signals}", ctx).output


def maintain_tests(db: Session, project_id: uuid.UUID, change: str, existing_tests: list[dict]) -> dict:
    ctx = _ctx(db, project_id, change[:500])
    return TEAM["test_maintenance"].run(f"CHANGE:\n{change}\nEXISTING TESTS:\n{existing_tests}", ctx).output


def generate_automation(test_case: dict, framework: str) -> dict:
    return TEAM["automation_generation"].run(
        f"Framework: {framework}\nTEST CASE:\n{test_case}").output


def answer_question(db: Session, project_id: uuid.UUID | None, question: str, history: list[dict]) -> dict:
    ctx = _ctx(db, project_id, question) if project_id else ""
    convo = "\n".join(f"{m['role']}: {m['content']}" for m in history[-6:])
    return TEAM["knowledge_retrieval"].run(f"CONVERSATION:\n{convo}\n\nQUESTION: {question}", ctx).output
