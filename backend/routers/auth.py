from fastapi import APIRouter, Request, Response
from fastapi.responses import RedirectResponse
from models.schemas import AuthLoginResponse, AuthStatusResponse
from services.google_auth import (
    get_authorization_url,
    exchange_code,
    get_credentials,
    get_user_email,
    remove_credentials,
)
from config import settings

router = APIRouter(prefix="/api/auth")


@router.get("/login", response_model=AuthLoginResponse)
async def login():
    auth_url, _state = get_authorization_url()
    return AuthLoginResponse(auth_url=auth_url)


@router.get("/callback")
async def callback(code: str, state: str):
    session_id = exchange_code(code, state)
    redirect_url = f"{settings.FRONTEND_URL}?session={session_id}"
    return RedirectResponse(url=redirect_url)


@router.get("/status", response_model=AuthStatusResponse)
async def status(session: str | None = None):
    if not session:
        return AuthStatusResponse(authenticated=False)

    creds = get_credentials(session)
    if creds is None:
        return AuthStatusResponse(authenticated=False)

    email = get_user_email(creds)
    return AuthStatusResponse(authenticated=True, user_email=email)


@router.post("/logout")
async def logout(session: str | None = None):
    if session:
        remove_credentials(session)
    return {"ok": True}
