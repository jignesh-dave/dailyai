import { useState, useRef, useEffect, type FormEvent } from "react";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
  };

  return (
    <div className="px-4 pb-5 pt-3">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 max-w-3xl mx-auto rounded-full px-1.5 py-1.5 transition-shadow duration-200"
        style={{
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your calendar or emails..."
          disabled={disabled}
          className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-[var(--text-muted)] disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="px-5 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--user-text)",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
