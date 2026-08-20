import React from "react";
import { requireAuth } from "@/lib/auth-utils";
import ProfileEditor from "@/components/dashboard/ProfileEditor";

export default async function ProfilePage() {
  const user = await requireAuth();
  const profile = user.website?.profile;

  return (
    <ProfileEditor
      initialProfile={profile}
      userImage={user.googlePhotoUrl || user.profileImage}
      googlePhotoIsDefault={user.googlePhotoIsDefault}
      photoModerationStatus={user.photoModerationStatus}
      userName={user.name}
      userEmail={user.email}
    />
  );
}
