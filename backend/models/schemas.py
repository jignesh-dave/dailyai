from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str


class AuthStatusResponse(BaseModel):
    authenticated: bool
    user_email: str | None = None


class AuthLoginResponse(BaseModel):
    auth_url: str


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class WSOutgoing(BaseModel):
    """Message sent from client to server over WebSocket."""
    content: str


class WSIncoming(BaseModel):
    """Message sent from server to client over WebSocket."""
    type: str  # "token", "tool_call", "tool_result", "done", "error"
    content: str = ""
