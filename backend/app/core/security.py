"""Verifies Supabase-issued JWTs. The frontend authenticates with Supabase Auth
and sends the access token as a Bearer token; we verify it with the shared secret."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from app.core.config import get_settings

bearer = HTTPBearer(auto_error=False)


class CurrentUser(BaseModel):
    id: str
    email: str = ""
    role: str = "member"


def get_current_user(creds: HTTPAuthorizationCredentials | None = Depends(bearer)) -> CurrentUser:
    settings = get_settings()
    if not settings.supabase_jwt_secret:
        # Local/demo mode: no Supabase configured yet.
        return CurrentUser(id="00000000-0000-0000-0000-000000000001", email="demo@argus.dev", role="owner")
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    try:
        payload = jwt.decode(creds.credentials, settings.supabase_jwt_secret,
                             algorithms=["HS256"], audience="authenticated")
    except JWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Invalid token: {exc}")
    return CurrentUser(id=payload["sub"], email=payload.get("email", ""))
