// components/auth/LoginForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

const STORAGE_KEYS = {
  token: "adminToken",
  userId: "userId",
  supplierData: "supplierData",
  userRole: "userRole",
} as const;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [prefillEmail, setPrefillEmail] = useState("");

  useEffect(() => {
    const verified = searchParams.get("verified");
    const registered = searchParams.get("registered");
    const reset = searchParams.get("reset");
    const reason = searchParams.get("reason");
    const emailParam = searchParams.get("email");

    if (verified === "true") {
      setSuccess("Email verified successfully. Please sign in to continue.");
    } else if (registered === "true") {
      setSuccess("Account created. Please sign in to continue.");
    } else if (reset === "true") {
      setSuccess(
        "Password reset successful. Please sign in with your new password."
      );
    } else if (reason === "expired") {
      setError("Your session has expired. Please sign in again.");
    } else if (reason === "missing") {
      setError("Please sign in to continue.");
    } else if (reason === "signed-out") {
      setSuccess("You've been signed out.");
    }

    if (emailParam) {
      setPrefillEmail(emailParam);
    }
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;

    try {
      // ─────────────────────────────────────────
      // STEP 1: Login to get JWT
      // ─────────────────────────────────────────
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json().catch(() => ({}));

      if (!loginResponse.ok) {
        setError(loginData.message || "Invalid email or password");
        return;
      }

      const token = loginData.token;
      if (!token) {
        setError("Login failed. No token received.");
        return;
      }

      // Persist session
      localStorage.setItem(STORAGE_KEYS.token, token);

      const supplierId = loginData.supplierId || loginData.userId;
      if (supplierId) {
        localStorage.setItem(STORAGE_KEYS.userId, String(supplierId));
        localStorage.setItem(
          STORAGE_KEYS.supplierData,
          JSON.stringify({
            id: supplierId,
            fullName: loginData.fullName ?? null,
            email: loginData.email ?? email,
            role: loginData.role ?? "SUPPLIER",
          })
        );
      }

      if (loginData.role) {
        localStorage.setItem(STORAGE_KEYS.userRole, loginData.role);
      }

      // ─────────────────────────────────────────
      // STEP 2: Fetch onboarding status
      // ─────────────────────────────────────────
      let statusData: {
        data?: { onboardingCompleted?: boolean; status?: string };
      } | null = null;

      try {
        const statusResponse = await fetch("/api/auth/onboarding/status", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (statusResponse.ok) {
          statusData = await statusResponse.json().catch(() => null);
        }
      } catch {
        // Swallow — fall through to /onboarding
      }

      // ─────────────────────────────────────────
      // STEP 3: Route based on onboarding state
      // ─────────────────────────────────────────
      const status = statusData?.data;

      // No business row yet → fresh account
      if (!status) {
        router.replace("/onboarding");
        return;
      }

      // Onboarding started but not complete → resume
      if (!status.onboardingCompleted) {
        router.replace("/onboarding");
        return;
      }

      // Onboarding complete → route by review status.
      // IMPORTANT: only go to /dashboard for approved accounts.
      // Every other state has an explicit destination.
      switch (status.status) {
        case "PAYMENT_CONFIRMED":
        case "PENDING_APPROVAL":
        case "REVIEW":
          router.replace("/pending-approval");
          return;

        case "REJECTED":
        case "DECLINED":
          router.replace("/reject");
          return;

        case "SUSPENDED":
          router.replace("/dashboard/suspended");
          return;

        case "APPROVED":
        case "ACTIVE":
          router.replace("/dashboard");
          return;

        // In-progress states → back to onboarding
        case "IN_PROGRESS":
        case "BUSINESS":
        case "PLAN":
        case "PAYMENT":
          router.replace("/onboarding");
          return;

        default:
          // Unknown or undefined status — safest is onboarding.
          // The onboarding bootstrap will re-check and route correctly.
          router.replace("/onboarding");
          return;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate={false}>
      {success && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <Input
        key={prefillEmail}
        type="email"
        name="email"
        placeholder="Email address"
        required
        icon="mail"
        label="Email Address"
        defaultValue={prefillEmail}
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
      />

      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Enter your password"
          required
          icon="lock"
          label="Password"
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-9 text-neutral-400 transition-colors hover:text-neutral-600"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          tabIndex={0}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
          />
          <span className="text-sm text-neutral-600">Remember me</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm text-neutral-600 transition-colors hover:text-neutral-900 sm:text-right"
        >
          Forgot password?
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        className="w-full justify-center"
        isLoading={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="text-center text-sm text-neutral-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-neutral-900 transition-colors hover:underline"
        >
          Sign up
        </Link>
      </div>
    </form>
  );
}