interface LoginButtonProps {
  onLogin: () => void;
}

export default function LoginButton({ onLogin }: LoginButtonProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <div className="w-full max-w-sm text-center">
        {/* Brand */}
        <h1
          className="text-5xl tracking-tight mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          DailyAI
        </h1>
        <p
          className="text-sm mb-12"
          style={{ color: "var(--text-muted)", letterSpacing: "0.04em" }}
        >
          Calendar &amp; email, at a glance
        </p>

        {/* Divider */}
        <div
          className="w-12 h-px mx-auto mb-12"
          style={{ backgroundColor: "var(--border)" }}
        />

        {/* Sign in button */}
        <button
          onClick={onLogin}
          className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--user-text)",
          }}
        >
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
            <path
              fill="#fff"
              fillOpacity="0.8"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#fff"
              fillOpacity="0.9"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#fff"
              fillOpacity="0.7"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#fff"
              fillOpacity="0.85"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-medium tracking-wide">
            Sign in with Google
          </span>
        </button>
      </div>
    </div>
  );
}
