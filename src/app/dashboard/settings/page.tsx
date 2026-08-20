import React from "react";
import { requireAuth } from "@/lib/auth-utils";
import SettingsEditor from "@/components/dashboard/SettingsEditor";

export default async function SettingsPage() {
  const user = await requireAuth();
  const website = user.website;
  const username = website?.username || "student";
  const isPublished = website?.published || false;
  const templateId = website?.templateId || "minimal";

  return (
    <SettingsEditor
      initialUsername={username}
      initialPublished={isPublished}
      templateId={templateId}
      userEmail={user.email}
    />
  );
}
