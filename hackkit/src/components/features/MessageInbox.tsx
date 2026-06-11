"use client";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function MessageInbox() {
  const [draft, setDraft] = useState("");
  const [polished, setPolished] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);

  async function handlePolish() {
    if (!draft) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: draft,
          systemPrompt: `You are an AI assistant helping a parent write a message to their child's teacher. Rewrite the user's input to be polite, clear, grammatically correct, and professional. Translate the final message into ${language}. Return ONLY the final message, no introductory text.`,
        }),
      });
      const data = await res.json();
      if (data.result) setPolished(data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleReadAloud() {
    if (!polished || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(polished);
    
    // Attempt to set basic language code based on selection
    if (language === "Spanish") utterance.lang = "es-ES";
    else if (language === "French") utterance.lang = "fr-FR";
    else utterance.lang = "en-US";
    
    window.speechSynthesis.speak(utterance);
  }

  return (
    <Card as="article" elevated>
      <CardHeader title="Message Drafter & Translator" subtitle="EdConnect AI" />
        <p className="text-muted text-sm" style={{ marginBottom: "var(--space-4)" }}>
          Not sure how to say it? Type your rough thoughts in any language, and the AI will draft a polite message to the teacher.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <Input 
            label="Your Rough Message" 
            value={draft} 
            onChange={e => setDraft(e.target.value)} 
            placeholder="e.g. why is alex grade low on math" 
          />
          
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>Translate to:</label>
            <select 
              className="input" 
              value={language} 
              onChange={e => setLanguage(e.target.value)}
              style={{ width: "100%", padding: "var(--space-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="Vietnamese">Vietnamese</option>
            </select>
          </div>

          <Button variant="primary" onClick={handlePolish} loading={loading}>
            Polish & Translate
          </Button>
          
          {polished && (
            <div className="fade-in" style={{ marginTop: "var(--space-4)", padding: "var(--space-3)", background: "var(--color-bg-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
              <p className="text-sm"><strong>Final Draft:</strong> {polished}</p>
              <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
                <Button variant="cta" size="sm">Send to Teacher</Button>
                <Button variant="outline" size="sm" onClick={handleReadAloud}>🔊 Read Aloud</Button>
              </div>
            </div>
          )}
        </div>
    </Card>
  );
}
