"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
} from "lucide-react";
import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/components/ui/Primitives";

interface SidebarProps {
  username: string;
  published: boolean;
  isAdmin?: boolean;
}

export function Sidebar({ username, published, isAdmin }: SidebarProps) {
  const pathname = usePathname();

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

  return (
    <aside className="fixed top-12 left-0 bottom-0 w-52 bg-sidebar border-r border-sidebar-border flex flex-col z-40">
      {/* Content Section Header */}
      <div className="px-3 py-3 border-b border-sidebar-border">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Content
        </p>
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
                "flex items-center gap-2.5 px-3 py-1.5 rounded-[3px] text-sm transition-colors text-left",
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
                "flex items-center gap-2.5 px-3 py-1.5 rounded-[3px] text-sm transition-colors text-left",
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
      <div className="p-3 border-t border-sidebar-border bg-sidebar/50">
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
    </aside>
  );
}
