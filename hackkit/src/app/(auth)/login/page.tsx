"use client";
// app/(auth)/login/page.tsx

// Prevent SSR — Firebase Auth is client-side only

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

// Note: metadata export doesn't work in "use client" files — set in a parent server component if needed

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
    <main
      className="flex items-center justify-center"
      style={{ minHeight: "100vh", padding: "var(--space-6)" }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo / App name */}
        <div className="text-center" style={{ marginBottom: "var(--space-8)" }}>
          <h1
            className="fade-in"
            style={{ color: "var(--color-primary)", marginBottom: "var(--space-2)" }}
          >
            {process.env.NEXT_PUBLIC_APP_NAME || "App"}
          </h1>
          <p className="text-muted fade-in fade-in-delay-1">
            {process.env.NEXT_PUBLIC_APP_TAGLINE || "Sign in to continue"}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card-elevated p-8 fade-in fade-in-delay-2">
          <h2 style={{ marginBottom: "var(--space-6)", fontSize: "1.25rem" }}>
            Sign in
          </h2>

          {error && <Alert variant="error">{error}</Alert>}

          <form onSubmit={handleSubmit} noValidate aria-label="Sign in form">
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
              autoComplete="current-password"
            />
            <Button
              type="submit"
              variant="primary"
              full
              size="lg"
              loading={loading}
              style={{ marginTop: "var(--space-2)" }}
            >
              Sign in
            </Button>
          </form>

          <div className="divider">or</div>

          <p className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ fontWeight: 600 }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
