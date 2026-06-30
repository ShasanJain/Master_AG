"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { logoutUser } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, User, Bell } from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  navItems?: NavItem[];
  appName?: string;
}

// Mock notifications — in production these come from Firestore
const MOCK_NOTIFICATIONS = [
  { id: 1, icon: "📅", text: "Parent-Teacher Meeting on 20 Jun at 4:00 PM", time: "2h ago", unread: true },
  { id: 2, icon: "📝", text: "Priya's Math test result is now available", time: "5h ago", unread: true },
  { id: 3, icon: "💬", text: "New message from Sunita Verma (Rahul's parent)", time: "Yesterday", unread: false },
  { id: 4, icon: "📸", text: "School circular uploaded — AI summary ready", time: "Yesterday", unread: false },
];

export function Navbar({ navItems = [], appName }: NavbarProps) {
  const { appUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const displayName = appName || process.env.NEXT_PUBLIC_APP_NAME || "EdConnect AI";
  const unreadCount = notifications.filter(n => n.unread).length;

  async function handleLogout() {
    await logoutUser();
    router.push("/login");
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation" style={{ position: "relative" }}>
      <Link href="/dashboard" className="navbar-brand" aria-label={`${displayName} home`}>
        {displayName}
      </Link>

      <ul className="navbar-nav" role="list">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`nav-link ${pathname === item.href ? "active" : ""}`}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {appUser && (
        <div className="flex items-center gap-4" style={{ position: "relative" }}>

          {/* Notification Bell */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotif(prev => !prev)}
              aria-label={`Notifications (${unreadCount} unread)`}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "8px", borderRadius: "10px", position: "relative",
                color: "var(--color-text-muted)",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(79,70,229,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: "4px", right: "4px",
                  width: "16px", height: "16px", borderRadius: "50%",
                  background: "#ef4444", color: "white",
                  fontSize: "0.6rem", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  lineHeight: 1,
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotif && (
              <>
                {/* Backdrop */}
                <div
                  onClick={() => setShowNotif(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 40 }}
                />
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  width: "340px", background: "white",
                  borderRadius: "16px", border: "1px solid var(--color-border)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
                  zIndex: 50, overflow: "hidden",
                }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 16px", borderBottom: "1px solid var(--color-border)"
                  }}>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>🔔 Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 600
                      }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{
                        display: "flex", gap: "12px", padding: "12px 16px",
                        borderBottom: "1px solid rgba(0,0,0,0.04)",
                        background: n.unread ? "rgba(79,70,229,0.04)" : "white",
                        cursor: "pointer", transition: "background 0.15s",
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.02)")}
                        onMouseLeave={e => (e.currentTarget.style.background = n.unread ? "rgba(79,70,229,0.04)" : "white")}
                      >
                        <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{n.icon}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "0.82rem", lineHeight: 1.5, margin: 0, fontWeight: n.unread ? 600 : 400 }}>
                            {n.text}
                          </p>
                          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>{n.time}</span>
                        </div>
                        {n.unread && (
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-primary)", flexShrink: 0, marginTop: "4px" }} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "10px 16px", textAlign: "center", borderTop: "1px solid var(--color-border)" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>Powered by real-time Firestore events</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User info */}
          <div className="flex items-center gap-2">
            <User size={16} aria-hidden="true" />
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {appUser.displayName}
            </span>
            <span className="badge badge-primary" style={{ textTransform: "capitalize" }}>
              {appUser.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={16} aria-hidden="true" />
            <span className="sr-only">Sign out</span>
          </button>
        </div>
      )}
    </nav>
  );
}
