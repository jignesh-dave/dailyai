import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import LoadingIndicator from "./LoadingIndicator";

interface ChatWindowProps {
  messages: ChatMessage[];
  streaming: boolean;
  connected: boolean;
  toolActivity: string | null;
  onSend: (content: string) => void;
}

export default function ChatWindow({
  messages,
  streaming,
  connected,
  toolActivity,
  onSend,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center pt-20 sm:pt-32">
              <div className="text-center">
                <p
                  className="text-2xl mb-2"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                >
                  Good day
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Ask about your schedule or inbox
                </p>
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {streaming && <LoadingIndicator toolActivity={toolActivity} />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Disconnected banner */}
      {!connected && (
        <div
          className="px-4 py-2 text-xs text-center"
          style={{
            backgroundColor: "var(--accent-light)",
            color: "var(--text-secondary)",
            borderTop: "1px solid var(--border-light)",
          }}
        >
          Reconnecting...
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={onSend} disabled={streaming || !connected} />
    </div>
  );
}
