"use client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const FEATURES = [
  {
    icon: "💬",
    title: "Real-Time Translation Chat",
    desc: "Teachers type in English. Parents read and reply in Hindi, Gujarati, Marathi, or Tamil — powered by Gemini 1.5 Flash.",
    color: "rgba(79, 70, 229, 0.08)",
    border: "rgba(79, 70, 229, 0.2)"
  },
  {
    icon: "🎤",
    title: "AI Voice Notes",
    desc: "Parents who can't type can hold a button and speak in their native tongue. Gemini transcribes and translates in one pass.",
    color: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.3)"
  },
  {
    icon: "📸",
    title: "Smart Notice Explainer",
    desc: "Upload a photo of any school circular. Gemini Vision extracts the text, summarizes key points, and translates instantly.",
    color: "rgba(16, 185, 129, 0.08)",
    border: "rgba(16, 185, 129, 0.25)"
  },
  {
    icon: "📅",
    title: "Smart Event Feed + Google Calendar",
    desc: "Teachers post announcements in English. Gemini detects events (PTMs, exams) and auto-generates 'Add to Google Calendar' links for parents — in their language.",
    color: "rgba(66, 133, 244, 0.08)",
    border: "rgba(66, 133, 244, 0.25)"
  },
  {
    icon: "🔊",
    title: "Universal Read-Aloud",
    desc: "Every translated message and notice can be spoken aloud using native Text-to-Speech in regional Indian accents.",
    color: "rgba(239, 68, 68, 0.08)",
    border: "rgba(239, 68, 68, 0.2)"
  },
];

export default function Home() {
  return (
    <div style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)", minHeight: "100vh" }}>
      
      {/* Navbar */}
      <nav style={{
        padding: "var(--space-4) var(--space-8)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(238,242,255,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--color-border)"
      }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 800, color: "var(--color-primary-dark)" }}>
          🎓 EdConnect AI
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <Link href="/login"><Button variant="ghost">Sign In</Button></Link>
          <Link href="/login"><Button variant="primary">Try Demo</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="container fade-in" style={{ textAlign: "center", paddingTop: "var(--space-16)", paddingBottom: "var(--space-16)" }}>
        
        <div style={{
          display: "inline-block", background: "rgba(79,70,229,0.1)", border: "1px solid rgba(79,70,229,0.25)",
          borderRadius: "var(--radius-full)", padding: "6px 16px", fontSize: "0.85rem",
          fontWeight: 600, color: "var(--color-primary-dark)", marginBottom: "var(--space-6)"
        }}>
          ✨ Powered by Gemini 1.5 Flash · Google Cloud Run
        </div>

        <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.08, fontWeight: 800, marginBottom: "var(--space-6)" }}>
          Breaking the Language Barrier<br />
          <span style={{ color: "var(--color-primary)" }}>in Indian Education.</span>
        </h1>

        <p className="text-muted" style={{ fontSize: "1.2rem", maxWidth: "700px", margin: "0 auto var(--space-10) auto", lineHeight: 1.7 }}>
          Over <strong>250 million</strong> parents in India struggle to engage with their children's schooling because school communication is strictly in English. EdConnect AI bridges this gap with Gemini-powered translation, vision OCR, and voice input.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
          <Link href="/login">
            <Button variant="primary" size="lg" style={{ padding: "var(--space-4) var(--space-10)", fontSize: "1.1rem", borderRadius: "var(--radius-full)" }}>
              👩‍🏫 Try Teacher Demo
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" style={{ padding: "var(--space-4) var(--space-10)", fontSize: "1.1rem", borderRadius: "var(--radius-full)" }}>
              👨‍👩‍👦 Try Parent Demo
            </Button>
          </Link>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", justifyContent: "center", gap: "var(--space-10)", flexWrap: "wrap",
          marginTop: "var(--space-12)", paddingTop: "var(--space-10)",
          borderTop: "1px solid var(--color-border)"
        }}>
          {[
            { n: "250M+", label: "Parents underserved" },
            { n: "6", label: "Regional languages" },
            { n: "3", label: "AI modalities" },
            { n: "1", label: "Unified platform" },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--color-primary-dark)", fontFamily: "var(--font-heading)" }}>{stat.n}</div>
              <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container fade-in fade-in-delay-1" style={{ paddingBottom: "var(--space-16)" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-10)" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
            Every Feature Built for Real Parents
          </h2>
          <p className="text-muted" style={{ fontSize: "1.1rem" }}>Not just translation. A complete communication suite.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-6)" }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              padding: "var(--space-8)",
              background: f.color,
              borderRadius: "20px",
              border: `1px solid ${f.border}`,
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "default"
            }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 15px 30px rgba(0,0,0,0.07)";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-4)" }}>{f.icon}</div>
              <h3 style={{ marginBottom: "var(--space-2)", fontSize: "1.15rem" }}>{f.title}</h3>
              <p className="text-muted text-sm" style={{ lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section style={{
        background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
        color: "white", textAlign: "center", padding: "var(--space-16) var(--space-6)"
      }}>
        <h2 style={{ color: "white", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", marginBottom: "var(--space-4)" }}>
          See it in action in 30 seconds
        </h2>
        <p style={{ opacity: 0.85, marginBottom: "var(--space-8)", fontSize: "1.1rem" }}>
          No sign-up required. Click below to load a pre-configured demo instantly.
        </p>
        <Link href="/login">
          <Button size="lg" style={{
            background: "var(--color-secondary)", color: "white", border: "none",
            padding: "var(--space-4) var(--space-10)", fontSize: "1.1rem", borderRadius: "var(--radius-full)"
          }}>
            Experience the Demo →
          </Button>
        </Link>
      </section>
    </div>
  );
}
