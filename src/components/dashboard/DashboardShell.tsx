"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  Layers,
  Briefcase,
  GraduationCap,
  Code2,
  Link2,
  Sparkles,
  LayoutTemplate,
  Settings,
  Shield,
  LayoutDashboard,
  Eye,
  Globe,
  LogOut,
} from "lucide-react";
import { APP_CONFIG, getPublicSiteUrl } from "@/lib/config";
import { Btn, cn } from "@/components/ui/Primitives";
import { DarkToggle } from "@/components/DarkToggle";
import { signOut } from "next-auth/react";

interface DashboardShellProps {
  username: string;
  published: boolean;
  userImage?: string | null;
  userName?: string | null;
  isAdmin?: boolean;
  children: React.ReactNode;
}

export function DashboardShell({
  username,
  published,
  userImage,
  userName,
  isAdmin,
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const rootDomain = APP_CONFIG.rootDomain;
  const siteName = APP_CONFIG.name;
  const publicUrl = getPublicSiteUrl(username);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  const navItems = [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Profile", icon: User, href: "/dashboard/profile" },
    { label: "Projects", icon: Layers, href: "/dashboard/projects" },
    { label: "Experience", icon: Briefcase, href: "/dashboard/experience" },
    { label: "Education", icon: GraduationCap, href: "/dashboard/education" },
    { label: "Skills", icon: Code2, href: "/dashboard/skills" },
    { label: "Social Links", icon: Link2, href: "/dashboard/social" },
  ];

  const toolItems = [
    { label: "AI Import", icon: Sparkles, href: "/dashboard/import" },
    { label: "Templates", icon: LayoutTemplate, href: "/dashboard/templates" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
    ...(isAdmin ? [{ label: "Admin Panel", icon: Shield, href: "/dashboard/admin" }] : []),
  ];

  const renderNavContent = () => (
    <div className="flex flex-col h-full">
      {/* Content Section Header */}
      <div className="px-3 py-3 border-b border-sidebar-border flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Content
        </p>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-muted-foreground hover:text-foreground rounded-[2px]"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-[3px] text-sm transition-colors text-left",
                isActive
                  ? "bg-foreground text-background font-medium"
                  : "text-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon size={14} className="shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}

        <div className="my-2 border-t border-sidebar-border" />

        <div className="px-1 py-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-1">
            Tools
          </p>
        </div>

        {toolItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-[3px] text-sm transition-colors text-left",
                isActive
                  ? "bg-foreground text-background font-medium"
                  : "text-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon size={14} className="shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar/50 mt-auto">
        <div className="text-xs text-muted-foreground mb-1.5 truncate">
          <span className="font-mono-code truncate block">
            {username}.{APP_CONFIG.rootDomain}
          </span>
        </div>
        <div
          className={cn(
            "text-[11px] px-2 py-0.5 rounded-[3px] font-medium inline-flex items-center gap-1.5",
            published
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-muted text-muted-foreground"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              published ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
            )}
          />
          {published ? "Published" : "Draft Mode"}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full">
      {/* TopNav Header */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 border-b border-border bg-card/95 backdrop-blur-md flex items-center px-3 sm:px-4 md:px-6 transition-colors duration-200 justify-between">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-1.5 -ml-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-[3px] transition-colors"
            title="Open navigation menu"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold text-sm tracking-tight text-foreground"
          >
            <span className="w-6 h-6 bg-foreground text-background rounded-[3px] flex items-center justify-center text-xs font-bold shrink-0">
              {siteName.charAt(0)}
            </span>
            <span className="text-foreground font-semibold">{siteName}</span>
          </Link>
        </div>

        {/* Center: Subdomain Info */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground font-mono-code">
          <span>
            {username}.{rootDomain}
          </span>
          <span className="text-border">·</span>
          <span className="inline-flex items-center gap-1.5 font-sans">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                published ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/60"
              }`}
            />
            <span
              className={
                published
                  ? "text-emerald-700 dark:text-emerald-400 font-medium"
                  : "text-muted-foreground"
              }
            >
              {published ? "Published" : "Draft"}
            </span>
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <DarkToggle />

          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex"
          >
            <Btn variant="secondary" size="sm">
              <Eye size={13} />
              <span>Visit Site</span>
            </Btn>
          </a>

          <Link href="/dashboard/settings" className="hidden sm:inline-flex">
            <Btn variant="primary" size="sm">
              <Globe size={13} />
              <span>{published ? "Live Settings" : "Publish"}</span>
            </Btn>
          </Link>

          <div className="h-4 w-px bg-border mx-1" />

          {/* User profile avatar & logout */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {userImage ? (
              <img
                src={userImage}
                alt="User"
                className="w-7 h-7 rounded-full object-cover bg-muted border border-border shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                {(userName || "U").charAt(0).toUpperCase()}
              </div>
            )}

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-[3px] hover:bg-muted cursor-pointer"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:flex fixed top-14 left-0 bottom-0 w-56 bg-sidebar border-r border-sidebar-border flex-col z-30">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer (Overlay + Sliding Drawer) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-out drawer */}
          <div className="relative w-64 max-w-[80vw] bg-sidebar border-r border-sidebar-border h-full shadow-2xl flex flex-col z-10 animate-fade-in">
            {renderNavContent()}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full md:pl-56 pt-14 bg-background min-h-screen">
        <main className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
