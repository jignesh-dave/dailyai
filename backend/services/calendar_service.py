from datetime import datetime, timedelta, timezone
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials


def _build_service(creds: Credentials):
    return build("calendar", "v3", credentials=creds)


def _format_event(event: dict) -> dict:
    start = event.get("start", {})
    end = event.get("end", {})
    return {
        "id": event.get("id"),
        "summary": event.get("summary", "(No title)"),
        "start": start.get("dateTime", start.get("date", "")),
        "end": end.get("dateTime", end.get("date", "")),
        "location": event.get("location", ""),
        "description": event.get("description", ""),
        "attendees": [
            a.get("email", "") for a in event.get("attendees", [])
        ],
    }


def get_todays_events(creds: Credentials) -> list[dict]:
    service = _build_service(creds)
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = start_of_day + timedelta(days=1)

    events_result = (
        service.events()
        .list(
            calendarId="primary",
            timeMin=start_of_day.isoformat(),
            timeMax=end_of_day.isoformat(),
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )
    return [_format_event(e) for e in events_result.get("items", [])]


def get_upcoming_events(creds: Credentials, days: int = 7) -> list[dict]:
    service = _build_service(creds)
    now = datetime.now(timezone.utc)
    time_max = now + timedelta(days=days)

    events_result = (
        service.events()
        .list(
            calendarId="primary",
            timeMin=now.isoformat(),
            timeMax=time_max.isoformat(),
            singleEvents=True,
            orderBy="startTime",
            maxResults=50,
        )
        .execute()
    )
    return [_format_event(e) for e in events_result.get("items", [])]


def search_events(creds: Credentials, query: str) -> list[dict]:
    service = _build_service(creds)
    now = datetime.now(timezone.utc)
    time_min = now - timedelta(days=30)
    time_max = now + timedelta(days=30)

    events_result = (
        service.events()
        .list(
            calendarId="primary",
            timeMin=time_min.isoformat(),
            timeMax=time_max.isoformat(),
            q=query,
            singleEvents=True,
            orderBy="startTime",
            maxResults=20,
        )
        .execute()
    )
    return [_format_event(e) for e in events_result.get("items", [])]
