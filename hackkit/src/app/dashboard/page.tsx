"use client";
// app/dashboard/page.tsx
// Generic dashboard — shows role-appropriate content
// HACKATHON DAY: Replace the placeholder sections with your actual features

// Prevent SSR — Firebase Auth is client-side only
export const dynamic = "force-dynamic";


import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ReportGenerator } from "@/components/features/ReportGenerator";
import { MessageInbox } from "@/components/features/MessageInbox";
import { FileUpload } from "@/components/features/FileUpload";
import { ResourceList } from "@/components/features/ResourceList";

export default function DashboardPage() {
  const { appUser, loading } = useAuth();
  const router = useRouter();

  // Auth guard
  useEffect(() => {
    if (!loading && !appUser) {
      router.push("/login");
    }
  }, [appUser, loading, router]);

  if (loading) {
    return (
      <div className="loading-screen" role="status" aria-label="Loading">
        <div className="spinner" />
        <p className="text-muted text-sm">Loading...</p>
      </div>
    );
  }

  if (!appUser) return null;

  // ⚡ HACKATHON DAY: Add role-based nav items here
  const navItems = appUser.role === "teacher" 
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "My Students", href: "/students" },
      ]
    : [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Messages", href: "/messages" },
      ];

  return (
    <>
      <Navbar navItems={navItems} />

      <main className="page-content">
        <div className="container">

          {/* Welcome */}
          <div className="fade-in" style={{ marginBottom: "var(--space-8)" }}>
            <h1>
              Welcome back, {appUser.displayName?.split(" ")[0]}
            </h1>
            <p className="text-muted" style={{ marginBottom: "var(--space-3)" }}>
              You&apos;re signed in as{" "}
              <Badge variant="primary">{appUser.role}</Badge>
            </p>
          </div>

          {/* ⚡ HACKATHON DAY: Role-specific UI */}
          {appUser.role === "teacher" ? (
            <div className="grid-3 fade-in fade-in-delay-1">
              <Card as="article" elevated>
                <CardHeader title="Class Overview" subtitle="Grade 4 - Section B" />
                <p className="text-muted text-sm" style={{ marginBottom: "var(--space-4)" }}>
                  24 students are currently performing above average. 2 students need attention.
                </p>
                <Button variant="outline" size="sm">View Class Roster</Button>
              </Card>

              <ReportGenerator />
              <FileUpload />

              <Card as="article" elevated>
                <CardHeader title="Recent Messages" subtitle="2 unread" />
                <p className="text-muted text-sm">
                  - Sarah's Mom: "Thanks for the update!"<br />
                  - John's Dad: "When is the project due?"
                </p>
              </Card>
            </div>
          ) : (
            <div className="grid-3 fade-in fade-in-delay-1">
              <Card as="article" elevated>
                <CardHeader title="Student: Alex" subtitle="Grade 4 - Section B" />
                <p className="text-muted text-sm" style={{ marginBottom: "var(--space-4)" }}>
                  Alex's math scores have improved by 15% this month! Keep it up.
                </p>
                <Button variant="outline" size="sm">View Full Report</Button>
              </Card>

              <MessageInbox />
              <ResourceList />
            </div>
          )}

        </div>
      </main>
    </>
  );
}
