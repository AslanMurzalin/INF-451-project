from typing import List, Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.crud.crud_user import user_crud
from app.models.user import User
from app.models.enums import UserRole

# 1. Primary Swagger Auth: Direct Bearer Token (paste JWT token directly)
token_auth_scheme = HTTPBearer(
    auto_error=False,
    description="Direct Bearer Token: paste your access token here."
)

# 2. Secondary Swagger Auth: OAuth2 Password flow (username/password modal)
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/token",
    auto_error=False,
    description="OAuth2 Password Flow: log in with email and password."
)


def get_current_user(
    request: Request,
    token_auth: Optional[HTTPAuthorizationCredentials] = Depends(token_auth_scheme),
    oauth2_token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Provide a Bearer token or valid session cookie.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token: Optional[str] = None

    # Priority 1: Bearer token from Authorization header (HTTPBearer)
    if token_auth and token_auth.credentials:
        token = token_auth.credentials
    # Priority 2: OAuth2 token from Authorization header
    elif oauth2_token:
        token = oauth2_token
    # Priority 3: HttpOnly / Lax Cookie (for browser frontend)
    elif "access_token" in request.cookies:
        token = request.cookies.get("access_token")

    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    user_id_str: Optional[str] = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception

    user = user_crud.get_by_id(db, user_id=user_id)
    if user is None:
        raise credentials_exception

    return user


class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Requires role in {[r.value for r in self.allowed_roles]}"
            )
        return current_user


# Role shortcuts
require_admin = RoleChecker([UserRole.ADMIN])
require_lecturer_or_admin = RoleChecker([UserRole.LECTURER, UserRole.ADMIN])
require_any_authenticated = RoleChecker([UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN])
