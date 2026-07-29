import type { Metadata } from "next";
import { SignInForm } from "@/components/sign-in-form";
import { isAuthConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to sync your saved recipes across devices.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md py-8">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-foreground-muted">
          Optional — the app works fully without an account. Signing in syncs
          your saved recipes across devices.
        </p>
      </header>

      <SignInForm configured={isAuthConfigured()} />
    </div>
  );
}
