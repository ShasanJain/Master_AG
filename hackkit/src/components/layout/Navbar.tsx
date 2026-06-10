"use client";
// components/layout/Navbar.tsx
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { logoutUser } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, User } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  /** Pass nav items based on current user role — determined on hackathon day */
  navItems?: NavItem[];
  appName?: string;
}

export function Navbar({ navItems = [], appName }: NavbarProps) {
  const { appUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const displayName = appName || process.env.NEXT_PUBLIC_APP_NAME || "App";

  async function handleLogout() {
    await logoutUser();
    router.push("/login");
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
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
        <div className="flex items-center gap-4">
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
