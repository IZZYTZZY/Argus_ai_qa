import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, CurrentUser
from app.models.models import TestCase, CoverageReport, RiskPrediction, Project, AuditLog

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
def dashboard(project_id: uuid.UUID, db: Session = Depends(get_db),
              user: CurrentUser = Depends(get_current_user)):
    project = db.get(Project, project_id)
    total = db.scalar(select(func.count()).select_from(TestCase).where(TestCase.project_id == project_id)) or 0
    approved = db.scalar(select(func.count()).select_from(TestCase)
                         .where(TestCase.project_id == project_id, TestCase.status == "approved")) or 0
    latest_cov = db.execute(select(CoverageReport).where(CoverageReport.project_id == project_id)
                            .order_by(CoverageReport.created_at.desc()).limit(1)).scalar_one_or_none()
    risks = db.execute(select(RiskPrediction).where(RiskPrediction.project_id == project_id)
                       .order_by(RiskPrediction.probability.desc()).limit(5)).scalars().all()
    activity = db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(10)).scalars().all()
    return {
        "project": {"name": project.name if project else "", "readiness": float(project.readiness_score) if project else 0},
        "test_cases": {"total": total, "approved": approved, "pending_review": total - approved},
        "coverage": {"pct": float(latest_cov.coverage_pct) if latest_cov and latest_cov.coverage_pct else None,
                     "risk": float(latest_cov.risk_pct) if latest_cov and latest_cov.risk_pct else None,
                     "confidence": float(latest_cov.confidence) if latest_cov and latest_cov.confidence else None,
                     "modules": latest_cov.modules if latest_cov else []},
        "top_risks": [{"module": r.module, "probability": float(r.probability), "kind": r.kind} for r in risks],
        "activity": [{"action": a.action, "at": a.created_at.isoformat()} for a in activity],
    }
