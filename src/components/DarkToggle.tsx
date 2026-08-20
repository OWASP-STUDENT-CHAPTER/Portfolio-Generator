"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function DarkToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-[3px] p-1.5 ${className || ""}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-1.5 rounded-[3px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center justify-center ${className || ""}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle color theme"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
