// components/auth/ForgotPasswordForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { AlertCircle, ArrowLeft, MailCheck } from "lucide-react";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim().toLowerCase();

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Email-enumeration-safe: we treat 404 as success.
      // Only surface real failures (network, 500, rate limit).
      if (!response.ok && response.status !== 404) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "Could not send reset code. Please try again.");
        return;
      }

      // Redirect to the reset page. The email is passed in the
      // query so the reset form can prefill it.
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Confirmation state — shown if you decide to keep the user
  // on this page instead of redirecting. Currently unused since
  // we redirect, but kept here for easy switch-back.
  if (sentTo) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
            <MailCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-900">
              Check your inbox
            </p>
            <p className="mt-1 text-sm text-green-800">
              If an account exists for <strong>{sentTo}</strong>, you&apos;ll
              receive a verification code shortly.
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-neutral-900 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        type="email"
        name="email"
        placeholder="you@company.com"
        required
        icon="mail"
        label="Email Address"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
      />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" className="w-full justify-center" isLoading={isLoading}>
        {isLoading ? "Sending code..." : "Send reset code"}
      </Button>

      <div className="text-center text-sm text-neutral-600">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-neutral-900 transition-colors hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </form>
  );
}