import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, CurrentUser
from app.models.models import TestCase
from app.schemas.schemas import TestCaseOut, TestCaseUpdate
from app.services.audit import log

router = APIRouter(prefix="/test-cases", tags=["test-cases"])


@router.get("", response_model=list[TestCaseOut])
def list_test_cases(project_id: uuid.UUID, category: str | None = None, status: str | None = None,
                    db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    q = select(TestCase).where(TestCase.project_id == project_id)
    if category:
        q = q.where(TestCase.category == category)
    if status:
        q = q.where(TestCase.status == status)
    return db.execute(q.order_by(TestCase.test_key)).scalars().all()


@router.get("/{test_case_id}", response_model=TestCaseOut)
def get_test_case(test_case_id: uuid.UUID, db: Session = Depends(get_db),
                  user: CurrentUser = Depends(get_current_user)):
    tc = db.get(TestCase, test_case_id)
    if tc is None:
        raise HTTPException(404, "Test case not found")
    return tc


@router.patch("/{test_case_id}", response_model=TestCaseOut)
def update_test_case(test_case_id: uuid.UUID, body: TestCaseUpdate,
                     db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    tc = db.get(TestCase, test_case_id)
    if tc is None:
        raise HTTPException(404, "Test case not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(tc, field, value)
    tc.version += 1
    db.commit()
    log(db, tc.org_id, user.id, "test_case.updated", "test_case", tc.id)
    return tc
