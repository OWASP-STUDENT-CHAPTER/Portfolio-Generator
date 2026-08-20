import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { APP_CONFIG, getPublicSiteUrl } from "@/lib/config";
import { ArrowLeft, Lock } from "lucide-react";
import { DarkToggle } from "@/components/DarkToggle";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;
  const siteName = APP_CONFIG.name;
  const demoUrl = getPublicSiteUrl("harsh");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border/60 bg-background/85 backdrop-blur-md flex items-center px-6 md:px-12">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="w-7 h-7 bg-foreground text-background rounded-[3px] flex items-center justify-center text-xs font-bold">
            {siteName.charAt(0)}
          </span>
          <span className="text-foreground">{siteName}</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <DarkToggle />
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Live Demo
          </a>
        </div>
      </header>

      {/* Login Box */}
      <div className="flex-1 flex items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="w-12 h-12 bg-foreground text-background rounded-[4px] flex items-center justify-center text-xl font-bold mb-6">
              {siteName.charAt(0)}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
              Sign in to {siteName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in with your Google account to manage your portfolio.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-[3px] bg-destructive/10 border border-destructive/20 text-xs text-destructive">
              Authentication failed. Please try again.
            </div>
          )}

          <div className="space-y-4">
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border rounded-[3px] text-sm font-medium bg-card hover:bg-muted text-foreground transition-colors cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>

            <div className="p-3 rounded-[3px] bg-muted/50 border border-border/40 text-xs text-muted-foreground leading-relaxed">
              <strong>Instant access:</strong> Your unique portfolio subdomain will be automatically reserved upon signing in.
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
              <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                <ArrowLeft size={13} /> Back to home
              </Link>
              <div className="flex items-center gap-1">
                <Lock size={11} />
                <span>Secure OAuth 2.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
