"use client";

import React, { useState } from "react";
import { GuidedWalkthroughModal } from "@/components/dashboard/GuidedWalkthroughModal";
import { PlayCircle } from "lucide-react";
import { Btn, Card } from "@/components/ui/Primitives";

interface DashboardClientProps {
  initialData: {
    username: string;
    name?: string | null;
    headline?: string | null;
    location?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    skills?: { name: string; category?: string | null }[];
    projects?: {
      title: string;
      tags?: string | null;
      description?: string | null;
      liveUrl?: string | null;
      sourceUrl?: string | null;
    }[];
    experiences?: {
      role: string;
      company: string;
      startDate?: string | null;
      endDate?: string | null;
      current?: boolean;
      description?: string | null;
    }[];
    socialLinks?: { platform: string; url: string }[];
    templateId?: string | null;
    published?: boolean;
    completenessPct?: number;
  };
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Walkthrough Modal */}
      <GuidedWalkthroughModal
        initialData={initialData}
        forceOpen={modalOpen}
        onCloseManual={() => setModalOpen(false)}
      />

      {/* Guided Walkthrough Launcher Card */}
      <Card className="bg-card border-border/80 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Interactive Assistant
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-[2px] bg-muted text-muted-foreground font-mono-code">
                Q&A Mode
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Conversational Portfolio Walkthrough
            </h3>
            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
              Step through our interactive questionnaire to set up your headline, skills, project, experience, and custom template with instant live publishing.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Btn
              variant="primary"
              size="sm"
              onClick={() => setModalOpen(true)}
            >
              <PlayCircle size={14} />
              <span>Launch Walkthrough</span>
            </Btn>
          </div>
        </div>
      </Card>
    </>
  );
}
