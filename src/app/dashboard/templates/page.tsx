import React from "react";
import { requireAuth } from "@/lib/auth-utils";
import TemplateGallery from "@/components/dashboard/TemplateGallery";

export default async function TemplatesPage() {
  const user = await requireAuth();
  const website = user.website;
  const currentTemplateId = website?.templateId || "minimal";
  const username = website?.username || "student";

  return (
    <TemplateGallery
      currentTemplateId={currentTemplateId}
      username={username}
    />
  );
}
