"use client";
import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function FileUpload() {
  const { appUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // Announcement Summarizer State
  const [announcement, setAnnouncement] = useState("");
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);

  async function handleUpload() {
    if (!file || !appUser) return;
    
    // Firestore has a 1MB limit per document. 800KB is a safe ceiling for base64 overhead.
    if (file.size > 800000) {
      setMessage("File is too large for the Hackathon Demo. Please use a file under 800KB.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // 1. Convert file to Base64 string directly in browser
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      // 2. Save the Base64 string directly into Firestore! No Storage bucket needed.
      await addDoc(collection(db, "resources"), {
        name: file.name,
        url: base64String, // The entire file is now stored here
        uploaderId: appUser.uid,
        uploaderRole: appUser.role,
        createdAt: serverTimestamp(),
      });

      setMessage("File uploaded successfully!");
      setFile(null);
    } catch (error) {
      console.error("Upload failed", error);
      setMessage("Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSummarize() {
    if (!announcement) return;
    setSummarizing(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: announcement,
          systemPrompt: "You are an AI assistant for teachers. Summarize this announcement into 3 clear bullet points for parents. Return ONLY the bullet points.",
        }),
      });
      const data = await res.json();
      if (data.result) setSummary(data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setSummarizing(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* File Upload Section */}
      <Card as="article" elevated>
        <CardHeader title="Class Resources Hub" subtitle="Upload Syllabi & Forms" />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
            className="input"
            accept=".pdf,.doc,.docx,.jpg,.png"
          />
          <Button variant="primary" onClick={handleUpload} loading={loading} disabled={!file}>
            Upload File
          </Button>
          {message && <p className="text-sm text-success">{message}</p>}
        </div>
      </Card>

      {/* Announcement Summarizer Section */}
      <Card as="article" elevated>
        <CardHeader title="Announcement Summarizer" subtitle="AI Bullet Points" />
        <p className="text-muted text-sm" style={{ marginBottom: "var(--space-4)" }}>
          Paste your long announcement here, and the AI will generate quick bullet points for parents to read.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <textarea 
            className="input"
            placeholder="Paste your full announcement text here..."
            value={announcement}
            onChange={e => setAnnouncement(e.target.value)}
            style={{ minHeight: "100px", resize: "vertical" }}
          />
          <Button variant="cta" onClick={handleSummarize} loading={summarizing} disabled={!announcement}>
            Generate Bullet Points
          </Button>
          
          {summary && (
            <div className="fade-in" style={{ marginTop: "var(--space-4)", padding: "var(--space-3)", background: "var(--color-bg-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
              <p className="text-sm"><strong>Summary:</strong></p>
              <div style={{ fontSize: "0.875rem", whiteSpace: "pre-wrap", marginTop: "var(--space-2)" }}>
                {summary}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
