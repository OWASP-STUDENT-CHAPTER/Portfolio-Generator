import React from "react";
import { requireAuth } from "@/lib/auth-utils";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const website = user.website;
  const username = website?.username || "student";
  const published = !!website?.published;
  const isAdmin = user.role === "ADMIN";

  return (
    <DashboardShell
      username={username}
      published={published}
      userImage={user.profileImage || user.image}
      userName={user.name}
      isAdmin={isAdmin}
    >
      {children}
    </DashboardShell>
  );
}

