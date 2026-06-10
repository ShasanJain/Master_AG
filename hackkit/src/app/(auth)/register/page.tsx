"use client";
// app/(auth)/register/page.tsx
// HACKATHON DAY: Add your role options to ROLE_OPTIONS array below

// Prevent SSR — Firebase Auth is client-side only

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

// ⚡ HACKATHON DAY: Roles adapted for "Parent-Teacher Communication App"
const ROLE_OPTIONS = [
  { value: "parent", label: "Parent" },
  { value: "teacher", label: "Teacher" },
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0].value);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await registerUser(email, password, name, role);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg.includes("email-already-in-use") ? "Email already registered" : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex items-center justify-center"
      style={{ minHeight: "100vh", padding: "var(--space-6)" }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div className="text-center" style={{ marginBottom: "var(--space-8)" }}>
          <h1
            className="fade-in"
            style={{ color: "var(--color-primary)", marginBottom: "var(--space-2)" }}
          >
            {process.env.NEXT_PUBLIC_APP_NAME || "App"}
          </h1>
          <p className="text-muted fade-in fade-in-delay-1">Create your account</p>
        </div>

        <div className="glass-card-elevated p-8 fade-in fade-in-delay-2">
          <h2 style={{ marginBottom: "var(--space-6)", fontSize: "1.25rem" }}>
            Get started
          </h2>

          {error && <Alert variant="error">{error}</Alert>}

          <form onSubmit={handleSubmit} noValidate aria-label="Create account form">
            <Input
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
              autoComplete="name"
            />
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              hint="Minimum 8 characters"
            />

            {/* Role selector */}
            <div className="form-group">
              <label htmlFor="role-select">I am a</label>
              <select
                id="role-select"
                className="input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                aria-label="Select your role"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              variant="cta"
              full
              size="lg"
              loading={loading}
              style={{ marginTop: "var(--space-2)" }}
            >
              Create account
            </Button>
          </form>

          <div className="divider">or</div>

          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" style={{ fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
