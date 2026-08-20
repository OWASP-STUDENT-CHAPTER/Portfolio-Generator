import React from "react";
import { requireAuth } from "@/lib/auth-utils";
import EducationEditor from "@/components/dashboard/EducationEditor";

export default async function EducationPage() {
  const user = await requireAuth();
  const educations = user.website?.educations || [];

  return <EducationEditor initialEducations={educations} />;
}
