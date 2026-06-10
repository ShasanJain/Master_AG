"use client";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ReportGenerator() {
  const [studentName, setStudentName] = useState("");
  const [notes, setNotes] = useState("");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!studentName || !notes) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: `Student: ${studentName}. Notes: ${notes}`,
          systemPrompt: "You are an empathetic, professional elementary school teacher. Write a short 3-4 sentence progress report for the parent based on the raw notes provided. Keep it constructive and polite. Do not include subject headers.",
        }),
      });
      const data = await res.json();
      if (data.result) setReport(data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card as="article" elevated>
      <CardHeader title="AI Report Generator" subtitle="Powered by Groq" />
        <p className="text-muted text-sm" style={{ marginBottom: "var(--space-4)" }}>
          Draft a weekly progress report for parents using AI.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <Input 
            label="Student Name" 
            value={studentName} 
            onChange={e => setStudentName(e.target.value)} 
            placeholder="e.g. Alex" 
          />
          <Input 
            label="Raw Notes" 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder="e.g. Distracted today, didn't finish math." 
          />
          <Button variant="primary" onClick={handleGenerate} loading={loading}>
            Generate Draft
          </Button>
          
          {report && (
            <div className="fade-in" style={{ marginTop: "var(--space-4)", padding: "var(--space-3)", background: "var(--color-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <p className="text-sm">{report}</p>
              <Button variant="outline" size="sm" style={{ marginTop: "var(--space-2)" }}>Send to Parent</Button>
            </div>
          )}
        </div>
    </Card>
  );
}
