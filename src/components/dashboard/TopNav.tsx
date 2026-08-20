"use client";

import React from "react";
import Link from "next/link";
import { Eye, Globe, LogOut } from "lucide-react";
import { DarkToggle } from "@/components/DarkToggle";
import { Btn } from "@/components/ui/Primitives";
import { APP_CONFIG, getPublicSiteUrl } from "@/lib/config";
import { signOut } from "next-auth/react";

interface TopNavProps {
  username: string;
  published: boolean;
  userImage?: string | null;
  userName?: string | null;
}

export function TopNav({
  username,
  published,
  userImage,
  userName,
}: TopNavProps) {
  const rootDomain = APP_CONFIG.rootDomain;
  const siteName = APP_CONFIG.name;
  const publicUrl = getPublicSiteUrl(username);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 border-b border-border bg-card/90 backdrop-blur-md flex items-center px-4 md:px-6 transition-colors duration-200">
      {/* Brand & Subdomain Display */}
      <div className="flex items-center gap-3 w-52 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sm tracking-tight text-foreground">
          <span className="w-6 h-6 bg-foreground text-background rounded-[3px] flex items-center justify-center text-xs font-bold">
            {siteName.charAt(0)}
          </span>
          <span className="text-foreground">{siteName}</span>
        </Link>
      </div>

      {/* Center Subdomain Info */}
      <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono-code">
        <span>{username}.{rootDomain}</span>
        <span className="text-border">·</span>
        <span className="inline-flex items-center gap-1.5 font-sans">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              published ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/60"
            }`}
          />
          <span className={published ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-muted-foreground"}>
            {published ? "Published" : "Draft"}
          </span>
        </span>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
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

        <Link href="/dashboard/settings">
          <Btn variant="primary" size="sm">
            <Globe size={13} />
            <span>{published ? "Live Settings" : "Publish"}</span>
          </Btn>
        </Link>

        <div className="h-4 w-px bg-border mx-1" />

        {/* User profile & logout */}
        <div className="flex items-center gap-2">
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
  );
}
