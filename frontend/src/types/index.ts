export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface WSIncoming {
  type: "token" | "tool_call" | "tool_result" | "done" | "error";
  content: string;
}

export interface WSOutgoing {
  content: string;
}

export interface AuthStatus {
  authenticated: boolean;
  user_email: string | null;
}
