"""Knowledge base: chunk uploaded documents, embed, and retrieve with pgvector."""
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.models import KnowledgeChunk, Document
from app.services import llm

CHUNK_SIZE, OVERLAP = 1200, 150


def chunk_text(text: str) -> list[str]:
    chunks, i = [], 0
    while i < len(text):
        chunks.append(text[i:i + CHUNK_SIZE])
        i += CHUNK_SIZE - OVERLAP
    return [c.strip() for c in chunks if c.strip()]


def index_document(db: Session, doc: Document) -> int:
    if not doc.content:
        return 0
    chunks = chunk_text(doc.content)
    vectors = llm.embed(chunks)
    for content, vec in zip(chunks, vectors):
        db.add(KnowledgeChunk(
            id=uuid.uuid4(), project_id=doc.project_id, document_id=doc.id,
            content=content, metadata_={"kind": doc.kind, "title": doc.title}, embedding=vec,
        ))
    doc.status = "processed"
    db.commit()
    return len(chunks)


def retrieve(db: Session, project_id: uuid.UUID, query: str, k: int = 8) -> list[str]:
    qvec = llm.embed([query])[0]
    rows = db.execute(
        select(KnowledgeChunk.content)
        .where(KnowledgeChunk.project_id == project_id)
        .order_by(KnowledgeChunk.embedding.cosine_distance(qvec))
        .limit(k)
    ).scalars().all()
    return list(rows)


def project_context(db: Session, project_id: uuid.UUID, query: str) -> str:
    chunks = retrieve(db, project_id, query)
    if not chunks:
        return "No project knowledge has been indexed yet."
    return "\n\n---\n\n".join(chunks)
