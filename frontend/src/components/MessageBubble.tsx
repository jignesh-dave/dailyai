import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "../types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end message-enter">
        <div
          className="max-w-[75%] rounded-2xl rounded-br-md px-4 py-2.5"
          style={{
            backgroundColor: "var(--user-bg)",
            color: "var(--user-text)",
          }}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start message-enter">
      <div
        className="max-w-[85%] rounded-2xl rounded-bl-md px-5 py-3"
        style={{
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid var(--border-light)",
        }}
      >
        <div className="prose prose-sm chat-prose max-w-none">
          <Markdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </Markdown>
        </div>
      </div>
    </div>
  );
}
