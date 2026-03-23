"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  Calculator,
  BookOpen,
  Stethoscope,
  Settings,
  Menu,
  X,
  LogOut,
  Syringe,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  user: UserProfile | null;
  overdueCount?: number;
}

export default function Sidebar({ user, overdueCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Clients", href: "/clients", icon: <Users size={18} />, badge: overdueCount > 0 ? overdueCount : undefined },
    { label: "Protocol Selector", href: "/protocol-selector", icon: <Syringe size={18} /> },
    { label: "Peptide Library", href: "/peptides", icon: <FlaskConical size={18} /> },
    { label: "Calculator", href: "/calculator", icon: <Calculator size={18} /> },
    { label: "Knowledge Base", href: "/knowledge-base", icon: <BookOpen size={18} /> },
    { label: "Vet Protocols", href: "/vet-protocols", icon: <Stethoscope size={18} /> },
    { label: "Settings", href: "/settings", icon: <Settings size={18} /> },
  ];

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  // Inlined as a JSX variable — avoids the remount-on-every-render bug
  // that occurs when a component function is defined inside another component.
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: "#1e3055" }}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(201, 151, 58, 0.12)", border: "1px solid rgba(201, 151, 58, 0.3)" }}
          >
            <span style={{ color: "#c9973a", fontSize: "1.1rem" }}>⬡</span>
          </div>
          <span
            className="text-lg font-bold"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#c9973a" }}
          >
            Atlas Engine
          </span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: active ? "rgba(201, 151, 58, 0.12)" : "transparent",
                color: active ? "#c9973a" : "#f0ead8",
                borderLeft: active ? "2px solid #c9973a" : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "#162840";
                  e.currentTarget.style.color = "#f0ead8";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#f0ead8";
                }
              }}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-mono"
                  style={{
                    backgroundColor: "rgba(232, 184, 109, 0.2)",
                    color: "#e8b86d",
                    border: "1px solid rgba(232, 184, 109, 0.3)",
                    fontSize: "0.65rem",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="px-4 py-4 border-t" style={{ borderColor: "#1e3055" }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
              style={{ backgroundColor: "#1e3055", color: "#c9973a" }}
            >
              {user.full_name
                ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "#f0ead8" }}>
                {user.full_name || "Unknown User"}
              </p>
              <span
                className="text-xs px-2 py-0.5 rounded-full mt-0.5 inline-block"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  backgroundColor: "rgba(201, 151, 58, 0.1)",
                  color: "#c9973a",
                  border: "1px solid rgba(201, 151, 58, 0.2)",
                  fontSize: "0.6rem",
                }}
              >
                {user.role?.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
            style={{ color: "#f0ead8" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(224, 90, 106, 0.1)";
              e.currentTarget.style.color = "#e05a6a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#f0ead8";
            }}
          >
            <LogOut size={15} />
            <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg lg:hidden"
        style={{ backgroundColor: "#0f1a2e", border: "1px solid #1e3055", color: "#f0ead8" }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "rgba(11, 17, 32, 0.8)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#0f1a2e", borderRight: "1px solid #1e3055" }}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div
        className="hidden lg:flex lg:flex-col w-64 flex-shrink-0 h-screen sticky top-0"
        style={{ backgroundColor: "#0f1a2e", borderRight: "1px solid #1e3055" }}
      >
        {sidebarContent}
      </div>
    </>
  );
}
