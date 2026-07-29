"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Sign-in form.
 *
 * Handles both sign-in and registration from one place, because forcing users
 * through two near-identical forms to store an email and a password is
 * friction with nothing behind it.
 */
export function SignInForm({ configured }: { configured: boolean }) {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!configured) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="text-sm leading-relaxed text-foreground-muted">
          Accounts are not enabled in this deployment. Set <code>AUTH_SECRET</code>{" "}
          and at least one provider to turn them on — see the README for details.
          Everything else in the app works without an account.
        </p>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      if (mode === "register") {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(body?.error ?? "Could not create that account.");
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) throw new Error("Those details were not recognised.");

      // Full reload rather than a router push, so the session cookie is picked
      // up by every server component on the next render.
      window.location.href = "/saved";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-5 rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card">
      <div className="flex gap-2" role="tablist">
        {(["signin", "register"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => {
              setMode(value);
              setError(null);
            }}
            className={
              mode === value
                ? "flex-1 rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white"
                : "flex-1 rounded-full px-4 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-muted"
            }
          >
            {value === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
          />
          {mode === "register" && (
            <p className="mt-1 text-xs text-foreground-subtle">
              At least 8 characters.
            </p>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        <Button type="submit" loading={pending} className="w-full">
          {mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <div className="space-y-2">
        <div className="relative text-center">
          <span className="relative z-10 bg-surface px-3 text-xs uppercase tracking-wide text-foreground-subtle">
            or
          </span>
          <span className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden />
        </div>

        {/* Rendered unconditionally: the provider may or may not be configured,
            and NextAuth returns a clear error rather than failing silently. */}
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => signIn("github", { callbackUrl: "/saved" })}
        >
          Continue with GitHub
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: "/saved" })}
        >
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
