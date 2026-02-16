import uuid
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from config import settings

# In-memory credential store: session_id -> Credentials
_credential_store: dict[str, Credentials] = {}
# Map state -> session_id for OAuth callback
_pending_states: dict[str, str] = {}


def create_auth_flow() -> Flow:
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=settings.SCOPES,
        redirect_uri=settings.REDIRECT_URI,
    )
    return flow


def get_authorization_url() -> tuple[str, str]:
    flow = create_auth_flow()
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    session_id = str(uuid.uuid4())
    _pending_states[state] = session_id
    return auth_url, state


def exchange_code(code: str, state: str) -> str:
    session_id = _pending_states.pop(state, None)
    if not session_id:
        raise ValueError("Invalid or expired OAuth state")

    flow = create_auth_flow()
    flow.fetch_token(code=code)
    _credential_store[session_id] = flow.credentials
    return session_id


def get_credentials(session_id: str) -> Credentials | None:
    creds = _credential_store.get(session_id)
    if creds is None:
        return None
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        _credential_store[session_id] = creds
    return creds


def get_user_email(creds: Credentials) -> str | None:
    try:
        service = build("oauth2", "v2", credentials=creds)
        user_info = service.userinfo().get().execute()
        return user_info.get("email")
    except Exception:
        return None


def remove_credentials(session_id: str) -> None:
    _credential_store.pop(session_id, None)
