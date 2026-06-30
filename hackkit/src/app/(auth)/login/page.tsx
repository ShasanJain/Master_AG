"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, registerUser } from "@/lib/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const DEMO_ACCOUNTS = [
  { email: "teacher@edconnect.ai", password: "demo1234", name: "Ms. Sharma", role: "teacher" },
  { email: "parent@edconnect.ai", password: "demo1234", name: "Priya's Parent", role: "parent" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg.includes("invalid-credential") ? "Invalid email or password" : msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(account: typeof DEMO_ACCOUNTS[0]) {
    setError("");
    setDemoLoading(account.role);
    try {
      let credential;
      try {
        // Try login first
        credential = await loginUser(account.email, account.password);
      } catch {
        // Account doesn't exist — create it (also writes the role)
        await registerUser(account.email, account.password, account.name, account.role);
        credential = await loginUser(account.email, account.password);
      }

      // Always force-write the correct role to Firestore (fixes stale 'user' profiles)
      const { doc, setDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      await setDoc(doc(db, "users", credential.user.uid), {
        uid: credential.user.uid,
        email: account.email,
        displayName: account.name,
        role: account.role,
      }, { merge: true });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(`Demo login failed: ${msg}`);
      setDemoLoading(null);
      return;
    }
    router.push("/dashboard");
    setDemoLoading(null);
  }

  return (
    <main className="flex items-center justify-center" style={{ minHeight: "100vh", padding: "var(--space-6)" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div className="text-center" style={{ marginBottom: "var(--space-8)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-2)" }}>🎓</div>
          <h1 className="fade-in" style={{ color: "var(--color-primary)", marginBottom: "var(--space-2)" }}>
            {process.env.NEXT_PUBLIC_APP_NAME || "EdConnect AI"}
          </h1>
          <p className="text-muted fade-in fade-in-delay-1">
            {process.env.NEXT_PUBLIC_APP_TAGLINE || "Breaking the Language Barrier in Indian Education"}
          </p>
        </div>

        {/* Demo Buttons — most prominent for hackathon */}
        <div className="fade-in fade-in-delay-1" style={{
          background: "linear-gradient(135deg, rgba(79,70,229,0.08), rgba(245,158,11,0.08))",
          border: "1px solid rgba(79,70,229,0.2)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-5)",
          marginBottom: "var(--space-6)"
        }}>
          <p style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary-dark)", marginBottom: "var(--space-3)" }}>
            ⚡ Try the Live Demo
          </p>
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <button
              onClick={() => handleDemoLogin(DEMO_ACCOUNTS[0])}
              disabled={!!demoLoading}
              style={{
                flex: 1, padding: "12px", borderRadius: "12px", border: "2px solid var(--color-primary)",
                background: demoLoading === "teacher" ? "var(--color-primary)" : "white",
                color: demoLoading === "teacher" ? "white" : "var(--color-primary-dark)",
                fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontSize: "0.9rem"
              }}
            >
              {demoLoading === "teacher" ? "Loading..." : "👩‍🏫 Teacher Demo"}
            </button>
            <button
              onClick={() => handleDemoLogin(DEMO_ACCOUNTS[1])}
              disabled={!!demoLoading}
              style={{
                flex: 1, padding: "12px", borderRadius: "12px", border: "2px solid var(--color-secondary)",
                background: demoLoading === "parent" ? "var(--color-secondary)" : "white",
                color: demoLoading === "parent" ? "white" : "#92400e",
                fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontSize: "0.9rem"
              }}
            >
              {demoLoading === "parent" ? "Loading..." : "👨‍👩‍👦 Parent Demo"}
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card-elevated p-8 fade-in fade-in-delay-2">
          <h2 style={{ marginBottom: "var(--space-6)", fontSize: "1.25rem" }}>Sign in with your account</h2>

          {error && <Alert variant="error">{error}</Alert>}

          <form onSubmit={handleSubmit} noValidate aria-label="Sign in form">
            <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
            <Button type="submit" variant="primary" full size="lg" loading={loading} style={{ marginTop: "var(--space-2)" }}>
              Sign in
            </Button>
          </form>

          <div className="divider">or</div>

          <p className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
