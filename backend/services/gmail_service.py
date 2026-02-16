import base64
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials


def _build_service(creds: Credentials):
    return build("gmail", "v1", credentials=creds)


def _extract_body(payload: dict) -> str:
    """Recursively extract text/plain body from email payload."""
    mime_type = payload.get("mimeType", "")

    if mime_type == "text/plain":
        data = payload.get("body", {}).get("data", "")
        if data:
            return base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")

    parts = payload.get("parts", [])
    for part in parts:
        body = _extract_body(part)
        if body:
            return body

    return ""


def _format_headers(headers: list[dict]) -> dict:
    result = {}
    for h in headers:
        name = h.get("name", "").lower()
        if name in ("from", "to", "subject", "date"):
            result[name] = h.get("value", "")
    return result


def get_recent_emails(creds: Credentials, count: int = 10) -> list[dict]:
    service = _build_service(creds)
    results = (
        service.users()
        .messages()
        .list(userId="me", maxResults=count, labelIds=["INBOX"])
        .execute()
    )
    messages = results.get("messages", [])
    emails = []
    for msg in messages:
        detail = (
            service.users()
            .messages()
            .get(userId="me", id=msg["id"], format="metadata",
                 metadataHeaders=["From", "To", "Subject", "Date"])
            .execute()
        )
        headers = _format_headers(detail.get("payload", {}).get("headers", []))
        emails.append({
            "id": msg["id"],
            "snippet": detail.get("snippet", ""),
            **headers,
        })
    return emails


def search_emails(creds: Credentials, query: str, count: int = 10) -> list[dict]:
    service = _build_service(creds)
    results = (
        service.users()
        .messages()
        .list(userId="me", q=query, maxResults=count)
        .execute()
    )
    messages = results.get("messages", [])
    emails = []
    for msg in messages:
        detail = (
            service.users()
            .messages()
            .get(userId="me", id=msg["id"], format="metadata",
                 metadataHeaders=["From", "To", "Subject", "Date"])
            .execute()
        )
        headers = _format_headers(detail.get("payload", {}).get("headers", []))
        emails.append({
            "id": msg["id"],
            "snippet": detail.get("snippet", ""),
            **headers,
        })
    return emails


def get_email_details(creds: Credentials, email_id: str) -> dict:
    service = _build_service(creds)
    detail = (
        service.users()
        .messages()
        .get(userId="me", id=email_id, format="full")
        .execute()
    )
    headers = _format_headers(detail.get("payload", {}).get("headers", []))
    body = _extract_body(detail.get("payload", {}))
    return {
        "id": email_id,
        "snippet": detail.get("snippet", ""),
        "body": body[:5000],  # Limit body size for LLM context
        **headers,
    }
