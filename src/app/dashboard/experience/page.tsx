import React from "react";
import { requireAuth } from "@/lib/auth-utils";
import ExperienceEditor from "@/components/dashboard/ExperienceEditor";

export default async function ExperiencePage() {
  const user = await requireAuth();
  const experiences = user.website?.experiences || [];

  return <ExperienceEditor initialExperiences={experiences} />;
}
