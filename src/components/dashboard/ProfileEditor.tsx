"use client";

import React, { useState, useTransition } from "react";
import { updateProfile, syncGoogleProfilePhoto } from "@/actions/website";
import { Field, Btn, Card, SectionHeader } from "@/components/ui/Primitives";
import { Check, AlertCircle, CheckCircle2, X, RefreshCw, ShieldCheck, Clock, ShieldAlert } from "lucide-react";
import { checkLocalProfanity } from "@/lib/moderation/veil-local";

interface ProfileEditorProps {
  initialProfile?: {
    headline?: string | null;
    bio?: string | null;
    location?: string | null;
    avatarUrl?: string | null;
    resumeUrl?: string | null;
  } | null;
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
  googlePhotoIsDefault?: boolean;
  photoModerationStatus?: string;
}

export default function ProfileEditor({
  initialProfile,
  userName,
  userEmail,
  userImage,
  googlePhotoIsDefault = true,
  photoModerationStatus = "NOT_REQUIRED",
}: ProfileEditorProps) {
  const [headline, setHeadline] = useState(initialProfile?.headline || "");
  const [bio, setBio] = useState(initialProfile?.bio || "");
  const [location, setLocation] = useState(
    initialProfile?.location || "Patiala, Punjab, India"
  );
  const [resumeUrl, setResumeUrl] = useState(initialProfile?.resumeUrl || "");
  const [currentImage, setCurrentImage] = useState(userImage || initialProfile?.avatarUrl || "");
  const [isDefaultPhoto, setIsDefaultPhoto] = useState(googlePhotoIsDefault);
  const [modStatus, setModStatus] = useState(photoModerationStatus);

  const [isPending, startTransition] = useTransition();
  const [isSyncing, startSyncTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", title: string, message: string) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast((prev) => (prev?.title === title ? null : prev));
    }, 4000);
  };

  // Real-time live validations
  const headlineCheck = checkLocalProfanity(headline);
  const bioCheck = checkLocalProfanity(bio);
  const locationCheck = checkLocalProfanity(location);
  const resumeUrlCheck = checkLocalProfanity(resumeUrl);
  const isFormClean = headlineCheck.isSafe && bioCheck.isSafe && locationCheck.isSafe && resumeUrlCheck.isSafe;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormClean) {
      showToast("error", "Prohibited Language", "Please fix highlighted fields containing inappropriate language.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateProfile({
          headline: headline.trim(),
          bio: bio.trim(),
          location: location.trim(),
          resumeUrl: resumeUrl.trim(),
        });

        if (res && typeof res === 'object' && 'success' in res && !res.success) {
          showToast("error", "Update Blocked", (res as any).error || "Failed to update profile");
          return;
        }

        if (res && typeof res === 'object' && 'unpublishWarning' in res && (res as any).unpublishWarning) {
          showToast("error", "Saved as Draft", (res as any).error || "Profile saved as draft due to safety review.");
          return;
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        showToast(
          "success",
          "Profile Saved",
          "Your profile information has been saved and updated on your live portfolio."
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update profile";
        showToast("error", "Update Failed", msg);
      }
    });
  };

  const handleSyncPhoto = () => {
    startSyncTransition(async () => {
      try {
        const res = await syncGoogleProfilePhoto();
        if (res.success) {
          if (res.photoUrl) setCurrentImage(res.photoUrl);
          if (res.isDefault !== undefined) setIsDefaultPhoto(res.isDefault);
          if (res.moderationStatus) setModStatus(res.moderationStatus);
          showToast(
            "success",
            "Photo Synced",
            res.isDefault
              ? "Google default letter avatar synced (no moderation required)."
              : "Google profile photograph synced and ready for verification."
          );
        } else {
          showToast("error", "Sync Failed", res.error || "Could not sync photo from Google");
        }
      } catch {
        showToast("error", "Sync Failed", "An error occurred while syncing with Google.");
      }
    });
  };

  const displayAvatar = currentImage;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-toast flex items-start gap-3 bg-card border border-border text-foreground px-4 py-3 rounded-[3px] shadow-lg max-w-sm">
          <div className="mt-0.5 shrink-0">
            {toast.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle size={16} className="text-destructive" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold">{toast.title}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              {toast.message}
            </div>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-muted-foreground hover:text-foreground p-0.5 rounded-[2px]"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={handleSave}>
        <SectionHeader
          title="Profile"
          action={
            <Btn
              type="submit"
              variant={saved ? "secondary" : "primary"}
              size="sm"
              disabled={isPending}
            >
              {isPending ? (
                "Saving..."
              ) : saved ? (
                <>
                  <Check size={13} /> Saved
                </>
              ) : (
                "Save changes"
              )}
            </Btn>
          }
        />

        <div className="space-y-5">
          {/* Avatar Card - Google Synced */}
          <div className="flex flex-col sm:flex-row items-start gap-5 p-5 bg-card border border-border rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover bg-muted shrink-0 border border-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground shrink-0 border border-border">
                {(userName || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">Profile photo</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically synced from your authenticated Google account.
                  </p>
                </div>
                <Btn
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleSyncPhoto}
                  disabled={isSyncing}
                >
                  <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
                  {isSyncing ? "Syncing..." : "Sync with Google"}
                </Btn>
              </div>

              {/* Status Indicator Badge */}
              <div className="pt-1 flex items-center gap-2">
                {isDefaultPhoto ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck size={13} />
                    Google Default Avatar (Safe)
                  </span>
                ) : modStatus === "APPROVED" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck size={13} />
                    Verified Google Photo
                  </span>
                ) : modStatus === "BLOCKED" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                    <ShieldAlert size={13} />
                    Photo Flagged in Safety Review (Update Google photo)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Clock size={13} />
                    Pending Verification (Moderated upon publishing)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                To update your photograph, change your picture in your Google account and click Sync with Google.
              </p>
            </div>
          </div>

          {/* Details Card */}
          <Card className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Full name"
                value={userName || ""}
                onChange={() => {}}
                disabled
                hint={`Linked to Google account (${userEmail || ""})`}
              />
              <Field
                label="Location"
                value={location}
                onChange={setLocation}
                placeholder="Patiala, Punjab, India"
                error={!locationCheck.isSafe ? locationCheck.reason || "Location contains prohibited language" : undefined}
              />
            </div>

            <Field
              label="Professional Headline / Title"
              value={headline}
              onChange={setHeadline}
              placeholder="e.g. Full-Stack Developer & ML Researcher"
              hint="Displayed prominently under your name across all templates."
              error={!headlineCheck.isSafe ? headlineCheck.reason || "Headline contains prohibited language" : undefined}
            />

            <Field
              label="Biography / About"
              value={bio}
              onChange={setBio}
              multiline
              rows={4}
              placeholder="Write a compelling summary about your background, passion projects, and technical skills..."
              hint="Supports multi-paragraph descriptions."
              error={!bioCheck.isSafe ? bioCheck.reason || "Bio contains prohibited language" : undefined}
            />

            <Field
              label="Resume / CV URL"
              type="url"
              value={resumeUrl}
              onChange={setResumeUrl}
              placeholder="https://drive.google.com/... or /resume.pdf"
              hint="Direct link for visitors to download or view your resume."
              error={!resumeUrlCheck.isSafe ? resumeUrlCheck.reason || "Resume link contains prohibited language or invalid scripts" : undefined}
            />
          </Card>
        </div>
      </form>
    </div>
  );
}
