interface LoadingIndicatorProps {
  toolActivity: string | null;
}

export default function LoadingIndicator({
  toolActivity,
}: LoadingIndicatorProps) {
  return (
    <div className="flex items-center gap-2.5 px-1 py-2 message-enter">
      <div className="flex gap-1">
        <span
          className="w-1 h-1 rounded-full"
          style={{
            backgroundColor: "var(--text-muted)",
            animation: "softPulse 1.2s ease-in-out infinite",
            animationDelay: "0ms",
          }}
        />
        <span
          className="w-1 h-1 rounded-full"
          style={{
            backgroundColor: "var(--text-muted)",
            animation: "softPulse 1.2s ease-in-out infinite",
            animationDelay: "200ms",
          }}
        />
        <span
          className="w-1 h-1 rounded-full"
          style={{
            backgroundColor: "var(--text-muted)",
            animation: "softPulse 1.2s ease-in-out infinite",
            animationDelay: "400ms",
          }}
        />
      </div>
      <span
        className="text-xs tracking-wide"
        style={{ color: "var(--text-muted)" }}
      >
        {toolActivity || "Thinking..."}
      </span>
    </div>
  );
}
