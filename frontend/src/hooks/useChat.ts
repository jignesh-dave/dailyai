import { useState, useCallback } from "react";
import type { ChatMessage } from "../types";
import { getSessionId } from "./useAuth";

let nextId = 0;
function genId() {
  return `msg-${++nextId}`;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [toolActivity, setToolActivity] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const sid = getSessionId();
    if (!sid) return;

    const userMsg: ChatMessage = { id: genId(), role: "user", content };
    const assistantId = genId();
    let assistantAdded = false;

    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);
    setToolActivity(null);

    let accumulated = "";

    const addOrUpdateAssistant = (text: string) => {
      if (!assistantAdded) {
        assistantAdded = true;
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", content: text },
        ]);
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: text } : m)),
        );
      }
    };

    try {
      const res = await fetch(`/api/chat?session=${encodeURIComponent(sid)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok || !res.body) {
        addOrUpdateAssistant("Error: Failed to connect");
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6);
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            switch (data.type) {
              case "token":
                accumulated += data.content;
                addOrUpdateAssistant(accumulated);
                break;
              case "tool_call":
                setToolActivity(data.content);
                break;
              case "tool_result":
                setToolActivity(null);
                break;
              case "error":
                addOrUpdateAssistant(`Error: ${data.content}`);
                break;
              case "done":
                break;
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    } catch {
      addOrUpdateAssistant("Error: Network error");
    } finally {
      setStreaming(false);
      setToolActivity(null);
    }
  }, []);

  return { messages, streaming, toolActivity, sendMessage };
}
