import os
from langchain.chat_models import init_chat_model
from deepagents import create_deep_agent
from langgraph.checkpoint.memory import InMemorySaver
from google.oauth2.credentials import Credentials
from tools.calendar_tools import create_calendar_tools
from tools.gmail_tools import create_gmail_tools

SYSTEM_PROMPT = """\
You are DailyAI, a personal assistant with read-only access to the user's Google Calendar and Gmail.

## Formatting rules (STRICT)

- **Emails**: Always show as a markdown table with columns: Sender, Subject, Date. \
Omit snippets unless the user asks to read an email. Keep sender names short (name only, no email address). \
Format dates as relative when possible ("Today 2:30 PM", "Yesterday").
- **Calendar events**: Show as a concise bullet list: **time** — **title** (location if any). \
Group by day with a `### Day` header if showing multiple days.
- **Single item detail**: Use headers and key-value style, not a table.
- **General**: Be brief. Use markdown headers, bold, bullet lists. No filler or apologies. \
Never dump raw JSON. Never repeat the tool output verbatim — summarize and format it.
- **Tables**: Align columns, keep cells short. Truncate long subjects to ~50 chars with "…".

## Capabilities

- View today's and upcoming calendar events
- Search calendar events by keyword
- List recent inbox emails
- Search emails (Gmail query syntax)
- Read full email body by ID

## Constraints

- READ-ONLY access. You cannot create, modify, or delete anything.
- Always call the appropriate tool — never guess about schedule or emails.
- If no results, say so briefly and suggest alternatives.
"""

# Cache agents per session — agent + checkpointer
_agent_cache: dict[str, object] = {}


def _create_model():
    os.environ.setdefault("GOOGLE_API_KEY", "")
    return init_chat_model("google_genai:gemini-2.5-flash", temperature=0.0)


def get_or_create_agent(session_id: str, creds: Credentials):
    if session_id in _agent_cache:
        return _agent_cache[session_id]

    model = _create_model()
    calendar_tools = create_calendar_tools(creds)
    gmail_tools = create_gmail_tools(creds)
    all_tools = calendar_tools + gmail_tools

    checkpointer = InMemorySaver()

    agent = create_deep_agent(
        model=model,
        tools=all_tools,
        system_prompt=SYSTEM_PROMPT,
        checkpointer=checkpointer,
    )

    _agent_cache[session_id] = agent
    return agent


def remove_agent(session_id: str) -> None:
    _agent_cache.pop(session_id, None)
