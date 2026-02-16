import json
import logging
import traceback
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from services.google_auth import get_credentials
from services.agent_service import get_or_create_agent

logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat")


def _extract_text(content) -> str:
    """Extract plain text from chunk.content which may be str, list, or None."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for part in content:
            if isinstance(part, dict) and part.get("type") == "text":
                parts.append(part.get("text", ""))
            elif isinstance(part, str):
                parts.append(part)
        return "".join(parts)
    return ""


@router.post("")
async def chat(request: Request, session: str | None = None):
    if not session:
        return StreamingResponse(
            iter([_sse("error", "Not authenticated")]),
            media_type="text/event-stream",
            status_code=401,
        )

    creds = get_credentials(session)
    if creds is None:
        return StreamingResponse(
            iter([_sse("error", "Session expired")]),
            media_type="text/event-stream",
            status_code=401,
        )

    body = await request.json()
    user_content = body.get("content", "").strip()
    if not user_content:
        return StreamingResponse(
            iter([_sse("error", "Empty message")]),
            media_type="text/event-stream",
            status_code=400,
        )

    agent = get_or_create_agent(session, creds)

    # LangGraph checkpointer manages history via thread_id
    config = {"configurable": {"thread_id": session}}

    async def generate():
        accumulated = ""
        try:
            async for event in agent.astream_events(
                {"messages": [HumanMessage(content=user_content)]},
                config=config,
                version="v2",
            ):
                kind = event.get("event", "")

                if kind == "on_chat_model_stream":
                    chunk = event["data"]["chunk"]
                    token = _extract_text(
                        chunk.content if hasattr(chunk, "content") else None
                    )
                    if token:
                        accumulated += token
                        yield _sse("token", token)

                elif kind == "on_tool_start":
                    tool_name = event.get("name", "unknown")
                    tool_input = event.get("data", {}).get("input", {})
                    yield _sse(
                        "tool_call",
                        f"Calling {tool_name}({json.dumps(tool_input)})",
                    )

                elif kind == "on_tool_end":
                    tool_output = event.get("data", {}).get("output", "")
                    if hasattr(tool_output, "content"):
                        tool_output = tool_output.content
                    yield _sse("tool_result", str(tool_output)[:500])

        except Exception as e:
            logger.error("Agent error: %s", e, exc_info=True)
            yield _sse("error", f"Agent error: {str(e)}")

        yield _sse("done", "")

    return StreamingResponse(generate(), media_type="text/event-stream")


def _sse(event_type: str, content: str) -> str:
    data = json.dumps({"type": event_type, "content": content})
    return f"data: {data}\n\n"
