import { useState, useRef, useCallback, useEffect } from "react";
import type { ChatMessage, WSIncoming } from "../types";
import { getSessionId } from "./useAuth";

let nextId = 0;
function genId() {
  return `msg-${++nextId}`;
}

export function useWebSocket(authenticated: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [connected, setConnected] = useState(false);
  const [toolActivity, setToolActivity] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const accumulatorRef = useRef("");
  const assistantIdRef = useRef("");
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const connect = useCallback(() => {
    if (!authenticated) return;

    const sid = getSessionId();
    if (!sid) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(
      `${protocol}//${window.location.host}/ws?session=${encodeURIComponent(sid)}`,
    );
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = (event) => {
      const data: WSIncoming = JSON.parse(event.data);

      switch (data.type) {
        case "token": {
          accumulatorRef.current += data.content;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantIdRef.current
                ? { ...m, content: accumulatorRef.current }
                : m,
            ),
          );
          break;
        }
        case "tool_call":
          setToolActivity(data.content);
          break;
        case "tool_result":
          setToolActivity(null);
          break;
        case "done":
          setStreaming(false);
          setToolActivity(null);
          break;
        case "error":
          setStreaming(false);
          setToolActivity(null);
          if (assistantIdRef.current) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantIdRef.current
                  ? { ...m, content: `Error: ${data.content}` }
                  : m,
              ),
            );
          }
          break;
      }
    };

    ws.onclose = (event) => {
      setConnected(false);
      if (event.code !== 4001) {
        reconnectTimer.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [authenticated]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      const userMsg: ChatMessage = {
        id: genId(),
        role: "user",
        content,
      };

      const assistantId = genId();
      assistantIdRef.current = assistantId;
      accumulatorRef.current = "";

      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStreaming(true);

      wsRef.current.send(JSON.stringify({ content }));
    },
    [],
  );

  return { messages, streaming, connected, toolActivity, sendMessage };
}
