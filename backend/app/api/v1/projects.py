import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, CurrentUser
from app.models.models import Project, Organization
from app.schemas.schemas import ProjectCreate, ProjectOut
from app.services.audit import log

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    return db.execute(select(Project).order_by(Project.created_at.desc())).scalars().all()


@router.post("", response_model=ProjectOut, status_code=201)
def create_project(body: ProjectCreate, db: Session = Depends(get_db),
                   user: CurrentUser = Depends(get_current_user)):
    org = db.get(Organization, body.org_id)
    if org is None:
        org = Organization(id=body.org_id, name="Default Org", slug=f"org-{str(body.org_id)[:8]}")
        db.add(org)
    project = Project(id=uuid.uuid4(), org_id=body.org_id, name=body.name,
                      description=body.description, repo_url=body.repo_url)
    db.add(project)
    db.commit()
    log(db, body.org_id, user.id, "project.created", "project", project.id)
    return project
