interface HeaderProps {
  userEmail: string | null;
  onLogout: () => void;
}

export default function Header({ userEmail, onLogout }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 py-3"
      style={{ borderBottom: "1px solid var(--border-light)" }}
    >
      <span
        className="text-lg tracking-tight shrink-0"
        style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
      >
        DailyAI
      </span>
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {userEmail && (
          <span
            className="text-xs tracking-wide truncate hidden sm:inline"
            style={{ color: "var(--text-muted)" }}
          >
            {userEmail}
          </span>
        )}
        <button
          onClick={onLogout}
          className="text-xs tracking-wide cursor-pointer transition-colors duration-150 shrink-0"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
