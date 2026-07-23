from sqlalchemy.orm import Session
from app.models.models import AuditLog


def log(db: Session, org_id, actor_id, action: str, entity_type: str = "", entity_id: str = "", detail: dict | None = None):
    db.add(AuditLog(org_id=org_id, actor_id=actor_id, action=action,
                    entity_type=entity_type, entity_id=str(entity_id), detail=detail or {}))
    db.commit()
