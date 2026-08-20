import React from "react";
import { requireAuth } from "@/lib/auth-utils";
import ImportWizard from "@/components/dashboard/ImportWizard";

export default async function ImportPage() {
  await requireAuth();

  return <ImportWizard />;
}
