"use client";
// dashboard/messages/page.tsx — Message history + parent updates feed
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

type Message = {
  id: string;
  studentName: string;
  parentName: string;
  parentLang: string;
  originalText: string;
  translatedText: string;
  senderRole: "teacher" | "parent";
  timestamp: Date;
  read: boolean;
  emoji: string;
};

const DEMO_MESSAGES: Message[] = [
  { id: "1", studentName: "Rahul Verma", parentName: "Sunita Verma", parentLang: "Marathi", originalText: "माझ्या मुलाला उद्या शाळेत येणे शक्य होणार नाही, तो आजारी आहे.", translatedText: "My son will not be able to come to school tomorrow, he is sick.", senderRole: "parent", timestamp: new Date(Date.now() - 1000 * 60 * 15), read: false, emoji: "👦" },
  { id: "2", studentName: "Priya Sharma", parentName: "Rajesh Sharma", parentLang: "Gujarati", originalText: "ગઈ કાલની ગૃહ-કાર્ય માટે ઘણો ધન્યવાદ.", translatedText: "Thank you so much for yesterday's homework help.", senderRole: "parent", timestamp: new Date(Date.now() - 1000 * 60 * 45), read: false, emoji: "👧" },
  { id: "3", studentName: "Alex Fernandez", parentName: "Maria Fernandez", parentLang: "Hindi", originalText: "क्या आप मुझे बता सकते हैं कि आज गणित में क्या पढ़ाया गया?", translatedText: "Can you tell me what was taught in math today?", senderRole: "parent", timestamp: new Date(Date.now() - 1000 * 60 * 120), read: true, emoji: "👦" },
  { id: "4", studentName: "Kabir Khan", parentName: "Amina Khan", parentLang: "Hindi", originalText: "Alex has shown great improvement in reading this week. Keep encouraging him!", translatedText: "Alex इस हफ्ते पढ़ाई में बहुत सुधरे हैं। उन्हें प्रोत्साहित करते रहें!", senderRole: "teacher", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), read: true, emoji: "👦" },
  { id: "5", studentName: "Ananya Iyer", parentName: "Lakshmi Iyer", parentLang: "Tamil", originalText: "Ananya's science project was selected for the district fair. Congratulations!", translatedText: "அன்ன்யாவின் அறிவியல் திட்டம் மாவட்ட மேளாவிற்கு தேர்ந்தெடுக்கப்பட்டது. வாழ்த்துக்கள்!", senderRole: "teacher", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), read: true, emoji: "👧" },
];

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function MessagesPage() {
  const { appUser } = useAuth();
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [selected, setSelected] = useState<Message | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "from-parents">("all");

  const isTeacher = appUser?.role === "teacher";
  const unreadCount = messages.filter(m => !m.read).length;

  const filtered = messages.filter(m => {
    if (filter === "unread") return !m.read;
    if (filter === "from-parents") return m.senderRole === "parent";
    return true;
  });

  function markRead(id: string) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  }

  function handleSelect(msg: Message) {
    setSelected(msg);
    markRead(msg.id);
  }

  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-12)" }}>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "4px" }}>
          💬 Messages
          {unreadCount > 0 && <span style={{ marginLeft: "12px", background: "#EF4444", color: "white", fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px", borderRadius: "999px" }}>{unreadCount} new</span>}
        </h1>
        <p className="text-muted text-sm">All parent–teacher communication, auto-translated by Gemini</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "var(--space-5)", alignItems: "start" }}>
        {/* Message List */}
        <div style={{ background: "white", borderRadius: "20px", border: "1px solid var(--color-border)", overflow: "hidden" }}>
          {/* Filters */}
          <div style={{ display: "flex", gap: "var(--space-2)", padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
            {(["all", "unread", "from-parents"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "7px 14px", borderRadius: "999px", border: "1.5px solid",
                borderColor: filter === f ? "var(--color-primary)" : "var(--color-border)",
                background: filter === f ? "var(--color-primary)" : "white",
                color: filter === f ? "white" : "var(--color-text-muted)",
                fontSize: "0.82rem", fontWeight: 600, cursor: "pointer"
              }}>
                {f === "all" ? "All" : f === "unread" ? `Unread (${unreadCount})` : "From Parents"}
              </button>
            ))}
          </div>

          {filtered.map(msg => (
            <div key={msg.id} onClick={() => handleSelect(msg)} style={{
              padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)",
              cursor: "pointer", display: "flex", gap: "var(--space-3)", alignItems: "flex-start",
              background: selected?.id === msg.id ? "rgba(79,70,229,0.04)" : !msg.read ? "rgba(79,70,229,0.02)" : "transparent",
              transition: "background 0.15s"
            }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: msg.senderRole === "parent" ? "rgba(245,158,11,0.15)" : "rgba(79,70,229,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
                {msg.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                  <span style={{ fontWeight: !msg.read ? 700 : 500, fontSize: "0.9rem" }}>{msg.senderRole === "parent" ? msg.parentName : "You"} → {msg.studentName}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", flexShrink: 0, marginLeft: "8px" }}>{timeAgo(msg.timestamp)}</span>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                  {msg.senderRole === "parent" ? msg.originalText : msg.originalText}
                </p>
              </div>
              {!msg.read && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4F46E5", flexShrink: 0, marginTop: "8px" }} />}
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selected ? (
          <div className="fade-in" style={{ background: "white", borderRadius: "20px", border: "1px solid var(--color-border)", padding: "var(--space-6)", position: "sticky", top: "80px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-5)", paddingBottom: "var(--space-4)", borderBottom: "1px solid var(--color-border)" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(79,70,229,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>{selected.emoji}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>{selected.studentName}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>{selected.parentName} · {selected.parentLang}</div>
              </div>
            </div>

            <div style={{ background: "var(--color-bg)", borderRadius: "14px", padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "var(--space-2)" }}>
                {selected.senderRole === "parent" ? `Original (${selected.parentLang})` : "Sent (English)"}
              </div>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>"{selected.originalText}"</p>
            </div>

            {selected.senderRole === "parent" && (
              <div style={{ background: "rgba(79,70,229,0.06)", borderRadius: "14px", padding: "var(--space-4)", border: "1px solid rgba(79,70,229,0.15)", marginBottom: "var(--space-4)" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-primary-dark)", marginBottom: "var(--space-2)" }}>✨ Gemini Translation (English)</div>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>"{selected.translatedText}"</p>
              </div>
            )}

            <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginBottom: "var(--space-5)" }}>
              Received: {selected.timestamp.toLocaleString("en-IN")}
            </div>

            <a href="/dashboard" style={{
              display: "block", textAlign: "center", padding: "12px", borderRadius: "12px",
              background: "var(--color-primary)", color: "white", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem"
            }}>
              💬 Reply in Chat →
            </a>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: "20px", border: "1px solid var(--color-border)", padding: "var(--space-10)", textAlign: "center", color: "var(--color-text-muted)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "var(--space-3)", opacity: 0.5 }}>💌</div>
            <p>Select a message to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
