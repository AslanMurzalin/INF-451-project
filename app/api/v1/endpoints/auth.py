from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.rate_limiter import limiter
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    verify_password,
    hash_password,
)
from app.crud.crud_user import user_crud
from app.crud.crud_department import department_crud
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    RegisterRequest,
    PasswordChangeRequest,
)
from app.schemas.user import UserResponse, UserProfileUpdate, UserCreate
from app.schemas.common import MessageResponse

router = APIRouter()


def _set_auth_cookie(response: Response, access_token: str) -> None:
    """Set HttpOnly, SameSite=Lax access token cookie."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE,
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def register(
    request: Request,
    user_in: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    US1.1: Register a new student, lecturer, or admin account.
    Admin registration is guarded by ADMIN_REGISTRATION_SECRET.
    """
    # Guard: Control admin creation
    if user_in.role == UserRole.ADMIN:
        if not user_in.admin_secret or user_in.admin_secret != settings.ADMIN_REGISTRATION_SECRET:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin registration requires a valid 'admin_secret' key."
            )

    existing_user = user_crud.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    if user_in.department_id:
        dept = department_crud.get_by_id(db, department_id=user_in.department_id)
        if not dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Department with id {user_in.department_id} not found."
            )

    create_schema = UserCreate(
        full_name=user_in.full_name,
        email=user_in.email,
        password=user_in.password,
        role=user_in.role,
        department_id=user_in.department_id
    )
    user = user_crud.create(db, obj_in=create_schema)
    return user


@router.post("/login", response_model=TokenResponse)
@limiter.limit(settings.AUTH_RATE_LIMIT)
def login_json(
    request: Request,
    response: Response,
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    US1.1: Option 1 - JSON-based login with email and password.
    Returns access_token and refresh_token in response body,
    and sets HttpOnly Lax cookie for the access_token.
    """
    user = user_crud.authenticate(db, email=login_data.email, password=login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.user_id, role=user.role.value)
    refresh_token = create_refresh_token(subject=user.user_id)

    # Set access token in HttpOnly SameSite=Lax cookie
    _set_auth_cookie(response, access_token)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user_id=user.user_id,
        full_name=user.full_name,
        email=user.email,
        role=user.role
    )


@router.post("/token", response_model=TokenResponse)
@limiter.limit(settings.AUTH_RATE_LIMIT)
def login_oauth2(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    US1.1: Option 2 - Standard OAuth2 Password Form flow (for Swagger Authorize button / OAuth2 clients).
    Username field corresponds to user's email.
    """
    user = user_crud.authenticate(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.user_id, role=user.role.value)
    refresh_token = create_refresh_token(subject=user.user_id)

    _set_auth_cookie(response, access_token)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user_id=user.user_id,
        full_name=user.full_name,
        email=user.email,
        role=user.role
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    response: Response,
    refresh_in: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    US1.1: Refresh access token using refresh_token stored in browser localStorage.
    Issues a new access token and updates the session cookie.
    """
    payload = decode_refresh_token(refresh_in.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload."
        )

    user = user_crud.get_by_id(db, user_id=int(user_id_str))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    new_access_token = create_access_token(subject=user.user_id, role=user.role.value)
    new_refresh_token = create_refresh_token(subject=user.user_id)

    _set_auth_cookie(response, new_access_token)

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        user_id=user.user_id,
        full_name=user.full_name,
        email=user.email,
        role=user.role
    )


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    """
    US1.1: Log out by clearing the access token session cookie.
    """
    response.delete_cookie(
        key="access_token",
        samesite=settings.COOKIE_SAMESITE,
        httponly=True
    )
    return MessageResponse(message="Successfully logged out.")


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    US1.1: Get current authenticated user profile.
    Accepts Bearer token header or session cookie.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    US1.1: Update authenticated user's own profile information.
    """
    if profile_in.full_name:
        current_user.full_name = profile_in.full_name
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
    return current_user


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    US1.1: Change authenticated user's password.
    """
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password does not match."
        )

    current_user.password_hash = hash_password(password_data.new_password)
    db.add(current_user)
    db.commit()
    return MessageResponse(message="Password changed successfully.")
