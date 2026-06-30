"use client";
// components/chat/ChatThread.tsx
// Generic real-time chat — works for any 2+ party system
// On hackathon day: just pass the Firestore collection name and participant IDs

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createDoc, subscribeToQuery, where, orderBy } from "@/lib/firestore";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  sessionId: string;
  createdAt: { seconds: number } | null;
}

interface ChatThreadProps {
  /** Firestore collection where messages live */
  collectionName: string;
  /** The session/conversation ID */
  sessionId: string;
  /** Display name for the other party */
  otherPartyName: string;
}

export function ChatThread({
  collectionName,
  sessionId,
  otherPartyName,
}: ChatThreadProps) {
  const { appUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) return;

    const unsub = subscribeToQuery<Message>(
      collectionName,
      [where("sessionId", "==", sessionId), orderBy("createdAt", "asc")],
      (msgs) => setMessages(msgs)
    );

    return () => unsub();
  }, [collectionName, sessionId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !appUser) return;

    setSending(true);
    try {
      await createDoc(collectionName, {
        text: text.trim(),
        senderId: appUser.uid,
        senderName: appUser.displayName || "You",
        sessionId,
      });
      setText("");
    } finally {
      setSending(false);
    }
  }

  const formatTime = (ts: Message["createdAt"]) => {
    if (!ts) return "";
    return new Date(ts.seconds * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section
      className="glass-card"
      style={{ display: "flex", flexDirection: "column", height: "500px" }}
      aria-label={`Chat with ${otherPartyName}`}
    >
      {/* Header */}
      <div
        style={{
          padding: "var(--space-4) var(--space-5)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1rem" }}>{otherPartyName}</h3>
        <p className="text-xs text-muted" style={{ margin: 0 }}>
          Real-time conversation
        </p>
      </div>

      {/* Messages */}
      <div
        className="chat-messages"
        role="log"
        aria-label="Messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 && (
          <p className="text-center text-muted text-sm" style={{ marginTop: "auto" }}>
            No messages yet. Start the conversation.
          </p>
        )}
        {messages.map((msg) => {
          const isSent = msg.senderId === appUser?.uid;
          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isSent ? "flex-end" : "flex-start",
              }}
            >
              <div
                className={`message-bubble ${isSent ? "sent" : "received"}`}
                aria-label={`${isSent ? "You" : msg.senderName}: ${msg.text}`}
              >
                {msg.text}
              </div>
              <span className="message-meta">
                {isSent ? "You" : msg.senderName} · {formatTime(msg.createdAt)}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="chat-input-area"
        aria-label="Send a message"
      >
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <input
          id="chat-input"
          className="input"
          style={{ flex: 1 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          autoComplete="off"
          maxLength={1000}
          aria-label="Message input"
        />
        <Button
          type="submit"
          variant="primary"
          loading={sending}
          disabled={!text.trim()}
          aria-label="Send message"
        >
          <Send size={16} aria-hidden="true" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </section>
  );
}
