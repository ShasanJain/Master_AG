"use client";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function MessageInbox() {
  const [draft, setDraft] = useState("");
  const [polished, setPolished] = useState("");
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
          systemPrompt: "You are an AI assistant helping a parent write a message to their child's teacher. Rewrite the user's input to be polite, clear, grammatically correct, and professional. Return ONLY the rewritten message, no introductory text.",
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

  return (
    <Card as="article" elevated>
      <CardHeader title="Message Teacher" subtitle="AI Drafter & Translator" />
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
          <Button variant="primary" onClick={handlePolish} loading={loading}>
            Polish Message
          </Button>
          
          {polished && (
            <div className="fade-in" style={{ marginTop: "var(--space-4)", padding: "var(--space-3)", background: "var(--color-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <p className="text-sm"><strong>Draft:</strong> {polished}</p>
              <Button variant="cta" size="sm" style={{ marginTop: "var(--space-2)" }}>Send to Teacher</Button>
            </div>
          )}
        </div>
    </Card>
  );
}
