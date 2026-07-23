import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, CurrentUser
from app.models.models import Document, Project
from app.schemas.schemas import DocumentOut
from app.services.extract import extract_text
from app.services import rag
from app.services.audit import log

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=list[DocumentOut])
def list_documents(project_id: uuid.UUID, db: Session = Depends(get_db),
                   user: CurrentUser = Depends(get_current_user)):
    return db.execute(select(Document).where(Document.project_id == project_id)
                      .order_by(Document.created_at.desc())).scalars().all()


@router.post("/upload", response_model=DocumentOut, status_code=201)
def upload(project_id: uuid.UUID = Form(...), kind: str = Form("spec"),
           file: UploadFile = File(...), db: Session = Depends(get_db),
           user: CurrentUser = Depends(get_current_user)):
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(404, "Project not found")
    text = extract_text(file.filename or "upload.txt", file.file.read())
    doc = Document(id=uuid.uuid4(), project_id=project_id, org_id=project.org_id,
                   kind=kind, title=file.filename or "Untitled", source="upload", content=text)
    db.add(doc)
    db.commit()
    chunks = rag.index_document(db, doc)
    log(db, project.org_id, user.id, "document.uploaded", "document", doc.id, {"chunks": chunks})
    return doc
