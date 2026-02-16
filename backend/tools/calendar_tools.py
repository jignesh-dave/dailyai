import json
from langchain_core.tools import tool
from google.oauth2.credentials import Credentials
from services import calendar_service


def create_calendar_tools(creds: Credentials) -> list:
    @tool
    def get_todays_calendar_events() -> str:
        """Get all calendar events for today. Returns a list of events with their time, title, location, and attendees."""
        events = calendar_service.get_todays_events(creds)
        if not events:
            return "No events scheduled for today."
        return json.dumps(events, indent=2)

    @tool
    def get_upcoming_events(days: int = 7) -> str:
        """Get upcoming calendar events for the next N days. Default is 7 days.

        Args:
            days: Number of days to look ahead (default 7)
        """
        events = calendar_service.get_upcoming_events(creds, days=days)
        if not events:
            return f"No events in the next {days} days."
        return json.dumps(events, indent=2)

    @tool
    def search_calendar_events(query: str) -> str:
        """Search calendar events by text query within +/- 30 days of today.

        Args:
            query: Text to search for in event titles and descriptions
        """
        events = calendar_service.search_events(creds, query)
        if not events:
            return f"No events found matching '{query}'."
        return json.dumps(events, indent=2)

    return [get_todays_calendar_events, get_upcoming_events, search_calendar_events]
