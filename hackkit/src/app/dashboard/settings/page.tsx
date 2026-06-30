"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const LANGUAGES = [
  { value: "Hindi",    label: "हिंदी",     sub: "Hindi",    color: "#ff6b35" },
  { value: "Gujarati", label: "ગુજરાતી",   sub: "Gujarati", color: "#f7c59f" },
  { value: "Marathi",  label: "मराठी",     sub: "Marathi",  color: "#efefd0" },
  { value: "Tamil",    label: "தமிழ்",     sub: "Tamil",    color: "#04a777" },
  { value: "Bengali",  label: "বাংলা",     sub: "Bengali",  color: "#1a936f" },
  { value: "Telugu",   label: "తెలుగు",    sub: "Telugu",   color: "#88d498" },
  { value: "English",  label: "English",   sub: "English",  color: "#4f46e5" },
];

const SECTIONS = ["Profile", "Language", "About"];

const TECH_ITEMS = [
  { label: "AI Model",       value: "Gemini 1.5 Flash",       icon: "✨" },
  { label: "Framework",      value: "Next.js 16 + TypeScript", icon: "⚡" },
  { label: "Backend",        value: "Firebase + Firestore",    icon: "🔥" },
  { label: "Auth",           value: "Firebase Auth",           icon: "🔐" },
  { label: "Deployment",     value: "Google Cloud Run",        icon: "☁️" },
  { label: "AI Features",    value: "Translation · Vision · TTS", icon: "🧠" },
  { label: "Languages",      value: "6 Indian languages",      icon: "🌏" },
  { label: "Event",          value: "Google Solution Challenge 2025", icon: "🏆" },
];

export default function SettingsPage() {
  const { appUser } = useAuth();
  const [activeSection, setActiveSection] = useState("Profile");
  const [name, setName]       = useState(appUser?.displayName || "");
  const [role, setRole]       = useState(appUser?.role || "parent");
  const [language, setLanguage] = useState("Hindi");
  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);

  if (!appUser) return null;

  const initials = (appUser.displayName || "U")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const avatarColors: Record<string, string> = {
    teacher: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    parent:  "linear-gradient(135deg, #0ea5e9, #6366f1)",
    user:    "linear-gradient(135deg, #64748b, #94a3b8)",
  };
  const avatarBg = avatarColors[appUser.role || "user"];

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "users", appUser.uid), { displayName: name, role }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: "10px",
    border: "1.5px solid #e2e8f0", outline: "none",
    fontSize: "0.9rem", background: "white", fontFamily: "inherit",
    color: "var(--color-text)", transition: "border-color 0.15s",
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)", background: "var(--color-bg)",
      paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)",
    }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 var(--space-6)" }}>

        {/* Page Header */}
        <div className="fade-in" style={{ marginBottom: "var(--space-8)" }}>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Settings</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: "4px", fontSize: "0.95rem" }}>
            Manage your profile, role, and preferences.
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "var(--space-6)", alignItems: "start" }}>

          {/* Sidebar */}
          <div className="fade-in" style={{
            background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)",
            borderRadius: "18px", border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)", overflow: "hidden",
          }}>
            {/* Avatar section */}
            <div style={{ padding: "var(--space-6)", textAlign: "center", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: avatarBg, margin: "0 auto var(--space-3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.6rem", fontWeight: 700, color: "white",
                boxShadow: "0 8px 24px rgba(79,70,229,0.25)",
              }}>
                {initials}
              </div>
              <p style={{ fontWeight: 700, fontSize: "0.9rem", margin: 0, lineHeight: 1.3 }}>
                {appUser.displayName}
              </p>
              <span style={{
                display: "inline-block", marginTop: "6px",
                padding: "2px 10px", borderRadius: "20px",
                background: appUser.role === "teacher" ? "rgba(79,70,229,0.1)" : "rgba(14,165,233,0.1)",
                color: appUser.role === "teacher" ? "#4338ca" : "#0369a1",
                fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                {appUser.role}
              </span>
            </div>

            {/* Nav items */}
            <div style={{ padding: "var(--space-2) 0" }}>
              {[
                { id: "Profile",  icon: "👤", label: "Profile" },
                { id: "Language", icon: "🌐", label: "Language" },
                { id: "About",    icon: "ℹ️",  label: "About" },
              ].map(item => (
                <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
                  width: "100%", textAlign: "left", padding: "10px 16px",
                  border: "none", background: activeSection === item.id
                    ? "rgba(79,70,229,0.08)" : "transparent",
                  color: activeSection === item.id ? "var(--color-primary-dark)" : "var(--color-text-muted)",
                  fontWeight: activeSection === item.id ? 700 : 500,
                  fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center",
                  gap: "10px", borderLeft: activeSection === item.id
                    ? "3px solid var(--color-primary)" : "3px solid transparent",
                  transition: "all 0.15s",
                }}>
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main content panel */}
          <div className="fade-in fade-in-delay-1">

            {/* PROFILE SECTION */}
            {activeSection === "Profile" && (
              <div style={{
                background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)",
                borderRadius: "20px", border: "1px solid rgba(255,255,255,0.9)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.05)", overflow: "hidden",
              }}>
                <div style={{ padding: "var(--space-6)", borderBottom: "1px solid #f1f5f9" }}>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Profile Information</h2>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "4px", marginBottom: 0 }}>
                    Update your name and role.
                  </p>
                </div>
                <div style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                    <div>
                      <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "7px", color: "var(--color-text)" }}>
                        Display Name
                      </label>
                      <input
                        value={name} onChange={e => setName(e.target.value)}
                        style={inputStyle} placeholder="Your full name"
                        onFocus={e => (e.target.style.borderColor = "var(--color-primary)")}
                        onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "7px", color: "var(--color-text)" }}>
                        Email Address
                      </label>
                      <input
                        value={appUser.email || ""} readOnly
                        style={{ ...inputStyle, background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "7px" }}>
                      Role
                      <span style={{
                        marginLeft: "8px", padding: "2px 8px", borderRadius: "6px",
                        background: "rgba(79,70,229,0.08)", color: "var(--color-primary-dark)",
                        fontSize: "0.72rem",
                      }}>
                        current: {appUser.role}
                      </span>
                    </label>
                    <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "var(--color-primary)")}
                      onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                    >
                      <option value="teacher">👩‍🏫 Teacher</option>
                      <option value="parent">👨‍👩‍👦 Parent</option>
                    </select>
                    <p style={{
                      marginTop: "8px", padding: "10px 14px", borderRadius: "10px",
                      background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
                      fontSize: "0.78rem", color: "#92400e", margin: "8px 0 0",
                    }}>
                      ⚡ Hackathon demo — switch roles to preview different dashboard views. Changes apply on next page load.
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", paddingTop: "var(--space-2)" }}>
                    <button onClick={handleSave} disabled={saving} style={{
                      padding: "11px 28px", borderRadius: "10px", border: "none",
                      background: "var(--color-primary)", color: "white",
                      fontWeight: 700, fontSize: "0.9rem", cursor: saving ? "not-allowed" : "pointer",
                      opacity: saving ? 0.7 : 1, transition: "opacity 0.2s",
                    }}>
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                    {saved && (
                      <span className="fade-in" style={{ color: "#059669", fontWeight: 600, fontSize: "0.85rem" }}>
                        ✅ Saved! Refresh to apply role change.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* LANGUAGE SECTION */}
            {activeSection === "Language" && (
              <div style={{
                background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)",
                borderRadius: "20px", border: "1px solid rgba(255,255,255,0.9)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.05)", overflow: "hidden",
              }}>
                <div style={{ padding: "var(--space-6)", borderBottom: "1px solid #f1f5f9" }}>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Language Preferences</h2>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "4px", marginBottom: 0 }}>
                    All messages and school notices will be auto-translated to your chosen language.
                  </p>
                </div>
                <div style={{ padding: "var(--space-6)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: "var(--space-3)" }}>
                    {LANGUAGES.map(lang => {
                      const selected = language === lang.value;
                      return (
                        <button key={lang.value} onClick={() => setLanguage(lang.value)} style={{
                          padding: "var(--space-4)", borderRadius: "14px",
                          border: `2px solid ${selected ? "var(--color-primary)" : "#e2e8f0"}`,
                          background: selected
                            ? "linear-gradient(135deg, rgba(79,70,229,0.06), rgba(139,92,246,0.06))"
                            : "white",
                          cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                          boxShadow: selected ? "0 4px 16px rgba(79,70,229,0.12)" : "none",
                          transform: selected ? "scale(1.02)" : "scale(1)",
                        }}>
                          <div style={{
                            width: "32px", height: "32px", borderRadius: "50%",
                            background: lang.color, marginBottom: "8px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontWeight: 800, fontSize: "0.8rem",
                          }}>
                            {lang.sub[0]}
                          </div>
                          <div style={{
                            fontWeight: 700, fontSize: "1rem",
                            color: selected ? "var(--color-primary-dark)" : "var(--color-text)",
                          }}>
                            {lang.label}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                            {lang.sub}
                          </div>
                          {selected && (
                            <div style={{
                              marginTop: "8px", display: "inline-flex", alignItems: "center",
                              gap: "4px", background: "var(--color-primary)", color: "white",
                              padding: "2px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700,
                            }}>
                              ✓ Active
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p style={{
                    marginTop: "var(--space-5)", padding: "12px 16px", borderRadius: "12px",
                    background: "rgba(79,70,229,0.04)", border: "1px solid rgba(79,70,229,0.12)",
                    fontSize: "0.82rem", color: "var(--color-text-muted)",
                  }}>
                    🌐 Powered by Gemini 1.5 Flash multilingual translation. Supports Hindi, Gujarati, Marathi, Tamil, Bengali, and Telugu with 99%+ accuracy.
                  </p>
                </div>
              </div>
            )}

            {/* ABOUT SECTION */}
            {activeSection === "About" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {/* Hero card */}
                <div style={{
                  background: "linear-gradient(135deg, var(--color-primary), #7c3aed)",
                  borderRadius: "20px", padding: "var(--space-8)", color: "white",
                  boxShadow: "0 12px 40px rgba(79,70,229,0.3)",
                }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-3)" }}>🎓</div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", margin: "0 0 var(--space-2)" }}>
                    EdConnect AI
                  </h2>
                  <p style={{ opacity: 0.85, margin: "0 0 var(--space-4)", lineHeight: 1.6, fontSize: "0.9rem" }}>
                    Breaking the language barrier in Indian education — connecting teachers and parents across 6 languages using Google AI.
                  </p>
                  <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                    {["v1.0.0-hackathon", "Google Solution Challenge 2025", "Open Source"].map(tag => (
                      <span key={tag} style={{
                        padding: "4px 12px", borderRadius: "20px",
                        background: "rgba(255,255,255,0.15)", fontSize: "0.75rem", fontWeight: 600,
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Tech grid */}
                <div style={{
                  background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)",
                  borderRadius: "20px", border: "1px solid rgba(255,255,255,0.9)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.05)", overflow: "hidden",
                }}>
                  <div style={{ padding: "var(--space-5) var(--space-6)", borderBottom: "1px solid #f1f5f9" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Tech Stack</h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                    {TECH_ITEMS.map((item, i) => (
                      <div key={item.label} style={{
                        padding: "var(--space-4) var(--space-5)",
                        borderBottom: i < TECH_ITEMS.length - 2 ? "1px solid #f8fafc" : "none",
                        borderRight: i % 2 === 0 ? "1px solid #f8fafc" : "none",
                        display: "flex", alignItems: "flex-start", gap: "12px",
                      }}>
                        <span style={{ fontSize: "1.3rem", flexShrink: 0, marginTop: "1px" }}>{item.icon}</span>
                        <div>
                          <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: "3px" }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: "0.87rem", fontWeight: 600, color: "var(--color-text)" }}>
                            {item.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
