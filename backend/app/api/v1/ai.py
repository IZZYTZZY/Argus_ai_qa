"""All agentic endpoints: generation, coverage, risk, bug investigation,
maintenance, automation, chat."""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, CurrentUser
from app.models.models import (TestCase, Project, CoverageReport, RiskPrediction,
                               BugInvestigation, ChatMessage, AutomationScript)
from app.schemas.schemas import (GenerateRequest, CoverageRequest, RiskRequest, BugRequest,
                                 MaintenanceRequest, AutomationRequest, ChatRequest, TestCaseOut)
from app.services.agents import orchestrator
from app.services.audit import log

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/generate-tests", response_model=list[TestCaseOut])
def generate_tests(body: GenerateRequest, db: Session = Depends(get_db),
                   user: CurrentUser = Depends(get_current_user)):
    project = db.get(Project, body.project_id)
    if project is None:
        raise HTTPException(404, "Project not found")
    result = orchestrator.generate_test_cases(db, body.project_id, body.scope, body.categories)
    created: list[TestCase] = []
    for t in result.get("test_cases", []):
        tc = TestCase(
            id=uuid.uuid4(), project_id=body.project_id, org_id=project.org_id,
            test_key=t.get("test_key", f"TC-GEN-{uuid.uuid4().hex[:4].upper()}"),
            title=t.get("title", "Untitled"), description=t.get("description"),
            objective=t.get("objective"), category=t.get("category", "functional"),
            preconditions=t.get("preconditions", []), test_data=t.get("test_data", {}),
            environment=t.get("environment"), steps=t.get("steps", []),
            expected_result=t.get("expected_result"), postconditions=t.get("postconditions", []),
            priority=t.get("priority", "P2"), severity=t.get("severity", "major"),
            risk_level=t.get("risk_level", "medium"),
            automation_readiness=float(t.get("automation_readiness", 0)),
            traceability=t.get("traceability", []),
        )
        db.add(tc)
        created.append(tc)
    db.commit()
    log(db, project.org_id, user.id, "ai.tests_generated", "project", project.id,
        {"count": len(created), "scope": body.scope})
    return created


@router.post("/coverage")
def coverage(body: CoverageRequest, db: Session = Depends(get_db),
             user: CurrentUser = Depends(get_current_user)):
    tests = db.execute(select(TestCase).where(TestCase.project_id == body.project_id)).scalars().all()
    result = orchestrator.analyze_coverage(
        db, body.project_id,
        [{"test_key": t.test_key, "title": t.title, "category": t.category,
          "traceability": t.traceability} for t in tests])
    report = CoverageReport(id=uuid.uuid4(), project_id=body.project_id,
                            coverage_pct=result.get("coverage_pct"), risk_pct=result.get("risk_pct"),
                            confidence=result.get("confidence"), modules=result.get("modules", []),
                            gaps=result.get("gaps", []))
    db.add(report)
    db.commit()
    return result


@router.post("/risk")
def risk(body: RiskRequest, db: Session = Depends(get_db),
         user: CurrentUser = Depends(get_current_user)):
    result = orchestrator.assess_risk(db, body.project_id, body.signals or "No explicit signals provided.")
    for p in result.get("predictions", []):
        db.add(RiskPrediction(id=uuid.uuid4(), project_id=body.project_id,
                              module=p.get("module", "unknown"), probability=float(p.get("probability", 0)),
                              kind=p.get("kind", "regression_hotspot"), reasoning=p.get("reasoning"),
                              recommended_actions=p.get("recommended_actions", [])))
    project = db.get(Project, body.project_id)
    if project and "release_readiness" in result:
        project.readiness_score = float(result["release_readiness"])
    db.commit()
    return result


@router.post("/investigate-bug")
def investigate(body: BugRequest, db: Session = Depends(get_db),
                user: CurrentUser = Depends(get_current_user)):
    result = orchestrator.investigate_bug(db, body.project_id, body.input_text)
    inv = BugInvestigation(id=uuid.uuid4(), project_id=body.project_id,
                           input_text=body.input_text, root_cause=result.get("root_cause"),
                           reproduction_steps=result.get("reproduction_steps", []),
                           possible_fixes=result.get("possible_fixes", []),
                           affected_modules=result.get("affected_modules", []),
                           recommended_tests=result.get("recommended_tests", []),
                           similar_bugs=result.get("similar_patterns", []))
    db.add(inv)
    db.commit()
    return result


@router.post("/maintenance")
def maintenance(body: MaintenanceRequest, db: Session = Depends(get_db),
                user: CurrentUser = Depends(get_current_user)):
    tests = db.execute(select(TestCase).where(TestCase.project_id == body.project_id)).scalars().all()
    return orchestrator.maintain_tests(
        db, body.project_id, body.change,
        [{"test_key": t.test_key, "title": t.title, "category": t.category} for t in tests])


@router.post("/automation")
def automation(body: AutomationRequest, db: Session = Depends(get_db),
               user: CurrentUser = Depends(get_current_user)):
    tc = db.get(TestCase, body.test_case_id)
    if tc is None:
        raise HTTPException(404, "Test case not found")
    result = orchestrator.generate_automation(
        {"test_key": tc.test_key, "title": tc.title, "steps": tc.steps,
         "test_data": tc.test_data, "expected_result": tc.expected_result}, body.framework)
    db.add(AutomationScript(id=uuid.uuid4(), test_case_id=tc.id,
                            framework=result.get("framework", body.framework),
                            language=result.get("language", ""), code=result.get("code", "")))
    db.commit()
    return result


@router.post("/chat")
def chat(body: ChatRequest, db: Session = Depends(get_db),
         user: CurrentUser = Depends(get_current_user)):
    history = []
    if body.project_id:
        rows = db.execute(select(ChatMessage).where(ChatMessage.project_id == body.project_id)
                          .order_by(ChatMessage.created_at.desc()).limit(6)).scalars().all()
        history = [{"role": m.role, "content": m.content} for m in reversed(rows)]
    result = orchestrator.answer_question(db, body.project_id, body.message, history)
    db.add(ChatMessage(id=uuid.uuid4(), project_id=body.project_id, role="user", content=body.message))
    db.add(ChatMessage(id=uuid.uuid4(), project_id=body.project_id, role="assistant",
                       content=result.get("answer", "")))
    db.commit()
    return result
