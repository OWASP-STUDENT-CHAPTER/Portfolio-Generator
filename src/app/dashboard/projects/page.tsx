import React from "react";
import { requireAuth } from "@/lib/auth-utils";
import ProjectsEditor from "@/components/dashboard/ProjectsEditor";

export default async function ProjectsPage() {
  const user = await requireAuth();
  const projects = user.website?.projects || [];

  return <ProjectsEditor initialProjects={projects} />;
}
