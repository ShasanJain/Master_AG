"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type FeedPost = {
  id: string;
  originalText: string;
  timestamp: Date;
  hasEvent: boolean;
  eventDetails?: {
    title: string;
    date: string; // YYYYMMDD
  };
};

const mockFeed: FeedPost[] = [
  {
    id: "post-1",
    originalText: "Dear parents, please note that the Parent-Teacher Meeting will be held this Friday at 4:00 PM. Attendance is highly encouraged.",
    timestamp: new Date(Date.now() - 1000000),
    hasEvent: true,
    eventDetails: { title: "Parent Teacher Meeting", date: "20260612T160000Z" }
  }
];

export function SmartFeed({ language = "Hindi" }: { language?: string }) {
  const { appUser } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>(mockFeed);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [translatedPosts, setTranslatedPosts] = useState<Record<string, string>>({});

  const isTeacher = appUser?.role === "teacher";

  // Translate feed posts for parents
  useEffect(() => {
    if (isTeacher) return;

    const translateFeed = async () => {
      const newTranslations: Record<string, string> = {};
      for (const post of posts) {
        if (!translatedPosts[post.id]) {
          try {
            const res = await fetch("/api/ai", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                input: post.originalText,
                systemPrompt: `Translate the following school announcement into ${language}. Return ONLY the translated text.`,
              }),
            });
            const data = await res.json();
            newTranslations[post.id] = data.result || post.originalText;
          } catch {
            newTranslations[post.id] = post.originalText;
          }
        }
      }
      if (Object.keys(newTranslations).length > 0) {
        setTranslatedPosts(prev => ({ ...prev, ...newTranslations }));
      }
    };
    translateFeed();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, language, isTeacher]);

  const handlePost = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      // Use Gemini to analyze if the post contains an event and extract details
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: input,
          systemPrompt: `Analyze this school announcement. Does it contain an event, meeting, or deadline? 
          Respond in strict JSON format: {"hasEvent": boolean, "title": "short event title or null", "date": "YYYYMMDDTHHmmssZ format or null"}.
          If it says 'this Friday at 4 PM', estimate a future date in UTC format.`,
        }),
      });
      const data = await res.json();
      
      let eventData = { hasEvent: false, title: "", date: "" };
      try {
         // Attempt to parse Gemini's JSON response
         const jsonStr = data.result.match(/\{.*\}/s)?.[0] || data.result;
         const parsed = JSON.parse(jsonStr);
         if (parsed.hasEvent) {
             eventData = parsed;
         }
      } catch (e) {
         console.error("Failed to parse event JSON from Gemini");
      }

      const newPost: FeedPost = {
        id: Date.now().toString(),
        originalText: input,
        timestamp: new Date(),
        hasEvent: eventData.hasEvent,
        eventDetails: eventData.hasEvent ? { title: eventData.title, date: eventData.date } : undefined
      };

      setPosts([newPost, ...posts]);
      setInput("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const generateGoogleCalendarLink = (post: FeedPost) => {
    if (!post.eventDetails) return "#";
    const text = encodeURIComponent(post.eventDetails.title);
    const dates = `${post.eventDetails.date}/${post.eventDetails.date}`; // Simplification for demo
    const details = encodeURIComponent(post.originalText);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
  };

  const playAudio = (text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    if (language === "Hindi") utterance.lang = "hi-IN";
    else if (language === "Gujarati") utterance.lang = "gu-IN";
    else if (language === "Marathi") utterance.lang = "mr-IN";
    else if (language === "Tamil") utterance.lang = "ta-IN";
    else utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(24px)",
      borderRadius: "var(--radius-xl)",
      border: "1px solid rgba(255, 255, 255, 0.9)",
      boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "550px"
    }}>
      <div style={{
        padding: "var(--space-4) var(--space-6)",
        background: "linear-gradient(to right, #10b981, #059669)",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>Class Announcements</h3>
        <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>📢 School-wide Feed</span>
      </div>

      {isTeacher && (
        <div style={{ padding: "var(--space-4)", background: "white", borderBottom: "1px solid var(--color-border)", display: "flex", gap: "var(--space-3)" }}>
          <Input 
            style={{ flex: 1, padding: "12px 16px", borderRadius: "24px", border: "1px solid var(--color-border)", outline: "none" }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Post an announcement or event to all parents..."
          />
          <Button variant="primary" onClick={handlePost} disabled={loading} style={{ borderRadius: "24px" }}>
            {loading ? "Analyzing..." : "Post"}
          </Button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)", background: "rgba(249, 250, 251, 0.5)" }}>
        {posts.map((post) => {
          const displayText = isTeacher ? post.originalText : (translatedPosts[post.id] || "Translating...");
          
          return (
            <div key={post.id} className="fade-in" style={{
              background: "white",
              padding: "var(--space-5)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
              border: "1px solid var(--color-border)"
            }}>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                {post.timestamp.toLocaleTimeString()}
              </div>
              <p style={{ fontSize: "1.05rem", lineHeight: "1.6", margin: "0 0 16px 0" }}>
                {displayText}
              </p>
              
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {!isTeacher && translatedPosts[post.id] && (
                  <button 
                    onClick={() => playAudio(displayText)}
                    style={{ background: "rgba(16, 185, 129, 0.1)", border: "none", color: "#059669", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "16px", fontWeight: 600, transition: "all 0.2s" }}
                  >
                    🔊 Listen
                  </button>
                )}
                
                {post.hasEvent && (
                  <a 
                    href={generateGoogleCalendarLink(post)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <button style={{ background: "rgba(66, 133, 244, 0.1)", border: "none", color: "#4285F4", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "16px", fontWeight: 600, transition: "all 0.2s" }}>
                      📅 Add to Google Calendar
                    </button>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
