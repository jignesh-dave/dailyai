import { useAuth } from "./hooks/useAuth";
import { useChat } from "./hooks/useChat";
import Header from "./components/Header";
import LoginButton from "./components/LoginButton";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const { auth, loading, login, logout } = useAuth();
  const { messages, streaming, toolActivity, sendMessage } = useChat();

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-full text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.125rem",
          }}
        >
          DailyAI
        </span>
      </div>
    );
  }

  if (!auth.authenticated) {
    return <LoginButton onLogin={login} />;
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--bg)" }}>
      <Header userEmail={auth.user_email} onLogout={logout} />
      <main className="flex-1 overflow-hidden">
        <ChatWindow
          messages={messages}
          streaming={streaming}
          connected={true}
          toolActivity={toolActivity}
          onSend={sendMessage}
        />
      </main>
    </div>
  );
}
