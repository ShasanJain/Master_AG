"use client";
// dashboard/calendar/page.tsx — Google Calendar integration + Gemini event suggestions
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

type CalendarEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: "ptm" | "holiday" | "exam" | "event" | "deadline";
  description: string;
  addedBy: "teacher" | "system";
  studentId?: string;
};

const TYPE_CONFIG = {
  ptm:      { label: "Parent-Teacher Meeting", color: "#4F46E5", bg: "rgba(79,70,229,0.1)",  icon: "👩‍🏫" },
  holiday:  { label: "Holiday",                color: "#10B981", bg: "rgba(16,185,129,0.1)", icon: "🎉" },
  exam:     { label: "Exam",                   color: "#EF4444", bg: "rgba(239,68,68,0.1)",  icon: "📝" },
  event:    { label: "School Event",           color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: "🎊" },
  deadline: { label: "Deadline",               color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", icon: "⏰" },
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Pre-seeded demo events
const INITIAL_EVENTS: CalendarEvent[] = [
  { id: "1", title: "Parent-Teacher Meeting", date: "2026-06-20", time: "4:00 PM", type: "ptm",      description: "All parents invited. Please come prepared with your child's progress report.", addedBy: "teacher" },
  { id: "2", title: "Annual Sports Day",       date: "2026-06-25", time: "9:00 AM", type: "event",    description: "Students should wear their school PE uniform.", addedBy: "teacher" },
  { id: "3", title: "Math Unit Test",          date: "2026-06-18", time: "10:00 AM", type: "exam",   description: "Chapters 4–7: Fractions, Decimals, and Basic Algebra.", addedBy: "teacher" },
  { id: "4", title: "Eid Holiday",             date: "2026-06-17", type: "holiday",                   description: "School remains closed for the Eid al-Adha festival.", addedBy: "system" },
  { id: "5", title: "Science Project Due",     date: "2026-07-01", type: "deadline",                  description: "Submit all science fair projects to the class teacher by end of day.", addedBy: "teacher" },
];

function generateGCalLink(event: CalendarEvent) {
  const dateStr = event.date.replace(/-/g, "");
  const startDT = event.time ? `${dateStr}T${event.time.replace(/:/g,"").replace(/ /g,"").padEnd(6,"0")}` : dateStr;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `[EdConnect] ${event.title}`,
    dates: event.time ? `${startDT}/${startDT}` : `${dateStr}/${dateStr}`,
    details: event.description,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function CalendarPage() {
  const { appUser } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // June 2026
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "", type: "event" as CalendarEvent["type"], description: "" });
  const [aiSuggestion, setAiSuggestion] = useState("");

  const isTeacher = appUser?.role === "teacher";
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsThisMonth = events.filter(e => {
    const [ey, em] = e.date.split("-").map(Number);
    return ey === year && em - 1 === month;
  });

  const eventsForDate = selectedDate ? events.filter(e => e.date === selectedDate) : [];

  async function handleAiGenerate() {
    if (!newEvent.title) return;
    setGeminiLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: `Event title: "${newEvent.title}"`,
          systemPrompt: `You are a school event coordinator. Write a short, friendly 1-2 sentence description for this school event that can be shared with parents. Return ONLY the description text, no preamble.`,
        }),
      });
      const data = await res.json();
      setAiSuggestion(data.result || "");
      setNewEvent(prev => ({ ...prev, description: data.result || prev.description }));
    } finally {
      setGeminiLoading(false);
    }
  }

  function handleAddEvent() {
    if (!newEvent.title || !newEvent.date) return;
    const ev: CalendarEvent = { ...newEvent, id: Date.now().toString(), addedBy: "teacher" };
    setEvents(prev => [...prev, ev]);
    setShowAddModal(false);
    setNewEvent({ title: "", date: "", time: "", type: "event", description: "" });
    setAiSuggestion("");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: "10px",
    border: "1.5px solid var(--color-border)", outline: "none",
    fontSize: "0.9rem", background: "white", marginTop: "4px",
    fontFamily: "var(--font-body)"
  };

  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-12)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "4px" }}>📅 School Calendar</h1>
          <p className="text-muted text-sm">Upcoming events, exams, holidays &amp; PTMs — synced with Google Calendar</p>
        </div>
        {isTeacher && (
          <button onClick={() => setShowAddModal(true)} style={{
            background: "var(--color-primary)", color: "white", border: "none", padding: "12px 24px",
            borderRadius: "12px", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem"
          }}>
            + Add Event
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "var(--space-6)", alignItems: "start" }}>
        {/* Calendar Grid */}
        <div style={{ background: "white", borderRadius: "20px", border: "1px solid var(--color-border)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          {/* Month nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}>
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} style={{ background: "none", border: "1.5px solid var(--color-border)", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "1.1rem" }}>‹</button>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>{MONTHS[month]} {year}</h2>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} style={{ background: "none", border: "1.5px solid var(--color-border)", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "1.1rem" }}>›</button>
          </div>

          <div style={{ padding: "0 16px 16px" }}>
            {/* Day labels */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "8px", marginTop: "12px" }}>
              {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{d}</div>)}
            </div>

            {/* Cells */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = events.filter(e => e.date === dateStr);
                const isToday = dateStr === new Date().toISOString().split("T")[0];
                const isSelected = selectedDate === dateStr;
                return (
                  <div key={day} onClick={() => setSelectedDate(isSelected ? null : dateStr)} style={{
                    padding: "6px", borderRadius: "10px", minHeight: "64px", cursor: "pointer",
                    background: isSelected ? "rgba(79,70,229,0.08)" : isToday ? "rgba(79,70,229,0.04)" : "transparent",
                    border: isSelected ? "2px solid var(--color-primary)" : isToday ? "2px solid rgba(79,70,229,0.3)" : "2px solid transparent",
                    transition: "all 0.15s"
                  }}>
                    <div style={{ fontWeight: isToday ? 700 : 500, fontSize: "0.85rem", color: isToday ? "var(--color-primary)" : "var(--color-text)", marginBottom: "4px" }}>{day}</div>
                    {dayEvents.slice(0, 2).map(ev => (
                      <div key={ev.id} style={{ fontSize: "0.65rem", fontWeight: 600, padding: "2px 4px", borderRadius: "4px", background: TYPE_CONFIG[ev.type].bg, color: TYPE_CONFIG[ev.type].color, marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {TYPE_CONFIG[ev.type].icon} {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)" }}>+{dayEvents.length - 2} more</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Selected date events */}
          {selectedDate && (
            <div style={{ background: "white", borderRadius: "16px", border: "1px solid var(--color-border)", padding: "var(--space-5)" }}>
              <h3 style={{ marginBottom: "var(--space-3)", fontSize: "1rem" }}>
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              {eventsForDate.length === 0 ? (
                <p className="text-muted text-sm">No events this day.</p>
              ) : (
                eventsForDate.map(ev => (
                  <div key={ev.id} style={{ marginBottom: "var(--space-3)", padding: "var(--space-3)", borderRadius: "12px", background: TYPE_CONFIG[ev.type].bg, border: `1px solid ${TYPE_CONFIG[ev.type].color}30` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "1.2rem" }}>{TYPE_CONFIG[ev.type].icon}</span>
                      <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{ev.title}</span>
                    </div>
                    {ev.time && <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "6px" }}>🕐 {ev.time}</div>}
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text)", marginBottom: "var(--space-3)" }}>{ev.description}</p>
                    <a href={generateGCalLink(ev)} target="_blank" rel="noreferrer" style={{
                      display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", fontWeight: 700,
                      color: "#4285F4", background: "rgba(66,133,244,0.1)", padding: "6px 12px", borderRadius: "8px", textDecoration: "none"
                    }}>
                      📅 Add to Google Calendar
                    </a>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Upcoming events list */}
          <div style={{ background: "white", borderRadius: "16px", border: "1px solid var(--color-border)", padding: "var(--space-5)" }}>
            <h3 style={{ marginBottom: "var(--space-4)", fontSize: "1rem" }}>Upcoming Events</h3>
            {events
              .filter(e => e.date >= new Date().toISOString().split("T")[0])
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(0, 6)
              .map(ev => (
                <div key={ev.id} onClick={() => setSelectedDate(ev.date)} style={{ display: "flex", gap: "var(--space-3)", padding: "10px 0", borderBottom: "1px solid var(--color-border)", cursor: "pointer", alignItems: "flex-start" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: TYPE_CONFIG[ev.type].bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
                    {TYPE_CONFIG[ev.type].icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      {new Date(ev.date + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {ev.time && ` · ${ev.time}`}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && isTeacher && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-6)" }}>
          <div style={{ background: "white", borderRadius: "24px", padding: "var(--space-8)", width: "100%", maxWidth: "520px", boxShadow: "0 30px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ marginBottom: "var(--space-6)", fontSize: "1.4rem" }}>+ Add School Event</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div><label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Event Title</label>
                <input value={newEvent.title} onChange={e => setNewEvent(p => ({...p, title: e.target.value}))} placeholder="e.g. Parent-Teacher Meeting" style={inputStyle} /></div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div><label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Date</label>
                  <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({...p, date: e.target.value}))} style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Time (optional)</label>
                  <input type="time" value={newEvent.time} onChange={e => setNewEvent(p => ({...p, time: e.target.value}))} style={inputStyle} /></div>
              </div>

              <div><label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Type</label>
                <select value={newEvent.type} onChange={e => setNewEvent(p => ({...p, type: e.target.value as CalendarEvent["type"]}))} style={inputStyle}>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                </select></div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Description</label>
                  <button onClick={handleAiGenerate} disabled={!newEvent.title || geminiLoading} style={{
                    fontSize: "0.75rem", background: "rgba(79,70,229,0.1)", border: "none", color: "var(--color-primary-dark)",
                    cursor: "pointer", padding: "4px 10px", borderRadius: "8px", fontWeight: 700
                  }}>
                    {geminiLoading ? "Generating..." : "✨ AI Write"}
                  </button>
                </div>
                <textarea value={newEvent.description} onChange={e => setNewEvent(p => ({...p, description: e.target.value}))} placeholder="Describe the event for parents..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1.5px solid var(--color-border)", background: "white", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                <button onClick={handleAddEvent} disabled={!newEvent.title || !newEvent.date} style={{ flex: 2, padding: "12px", borderRadius: "12px", border: "none", background: "var(--color-primary)", color: "white", cursor: "pointer", fontWeight: 700, fontSize: "0.95rem" }}>Add Event &amp; Notify Parents</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
