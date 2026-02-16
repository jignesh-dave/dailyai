import json
from langchain_core.tools import tool
from google.oauth2.credentials import Credentials
from services import gmail_service


def create_gmail_tools(creds: Credentials) -> list:
    @tool
    def get_recent_emails(count: int = 10) -> str:
        """Get the most recent emails from the inbox.

        Args:
            count: Number of emails to retrieve (default 10, max 20)
        """
        count = min(count, 20)
        emails = gmail_service.get_recent_emails(creds, count=count)
        if not emails:
            return "No recent emails found."
        return json.dumps(emails, indent=2)

    @tool
    def search_emails(query: str) -> str:
        """Search emails using Gmail query syntax. Examples: 'from:alice', 'subject:meeting', 'is:unread', 'after:2024/01/01'.

        Args:
            query: Gmail search query string
        """
        emails = gmail_service.search_emails(creds, query)
        if not emails:
            return f"No emails found matching '{query}'."
        return json.dumps(emails, indent=2)

    @tool
    def get_email_details(email_id: str) -> str:
        """Get the full details and body of a specific email by its ID. Use this after listing emails to read a specific one.

        Args:
            email_id: The email message ID
        """
        email = gmail_service.get_email_details(creds, email_id)
        return json.dumps(email, indent=2)

    return [get_recent_emails, search_emails, get_email_details]
