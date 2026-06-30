"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { appUser, loading } = useAuth();
  const router = useRouter();

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

  const navItems = appUser.role === "teacher" 
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Students", href: "/dashboard/students" },
        { label: "Calendar", href: "/dashboard/calendar" },
        { label: "Messages", href: "/dashboard/messages" },
        { label: "Settings", href: "/dashboard/settings" },
      ]
    : [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Updates", href: "/dashboard/messages" },
        { label: "Calendar", href: "/dashboard/calendar" },
        { label: "Settings", href: "/dashboard/settings" },
      ];

  return (
    <>
      <Navbar navItems={navItems} />
      <main className="page-content">
        {children}
      </main>
    </>
  );
}
