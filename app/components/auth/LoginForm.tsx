// components/auth/LoginForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [prefillEmail, setPrefillEmail] = useState("");

  // ✅ Read query params from redirects
  useEffect(() => {
    const verified = searchParams.get("verified");
    const registered = searchParams.get("registered");
    const emailParam = searchParams.get("email");

    if (verified === "true") {
      setSuccess("Email verified successfully. Please sign in to continue.");
    } else if (registered === "true") {
      setSuccess("Account created. Please sign in to continue.");
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
    const email = formData.get("email") as string;
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

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        setError(loginData.message || "Invalid email or password");
        return;
      }

      const token = loginData.token;
      if (!token) {
        setError("Login failed. No token received.");
        return;
      }

      // ✅ Store token
      localStorage.setItem("adminToken", token);

      // ✅ Store supplier info — read from BOTH field names for safety
      const supplierId = loginData.supplierId || loginData.userId;
      if (supplierId) {
        localStorage.setItem("userId", String(supplierId));
        localStorage.setItem(
          "supplierData",
          JSON.stringify({
            id: supplierId,
            fullName: loginData.fullName ?? null,
            email: loginData.email ?? email,
            role: loginData.role ?? "SUPPLIER",
          })
        );
      }

      if (loginData.role) {
        localStorage.setItem("userRole", loginData.role);
      }

      // ─────────────────────────────────────────
      // STEP 2: Fetch onboarding status
      // ─────────────────────────────────────────
      const statusResponse = await fetch("/api/auth/onboarding/status", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const statusData = await statusResponse.json();

      // ─────────────────────────────────────────
      // STEP 3: Route based on onboarding state
      // ─────────────────────────────────────────

      // No business yet → start onboarding
      if (!statusData.data) {
        router.push("/onboarding");
        return;
      }

      const { onboardingCompleted, status } = statusData.data;

      // Onboarding not finished → resume
      if (!onboardingCompleted) {
        router.push("/onboarding");
        return;
      }

      // Onboarding done, but pending admin review
      if (status === "PENDING_APPROVAL" || status === "REVIEW") {
        router.push("/pending-approval");
        return;
      }

      // Rejected / Declined → show rejection page
      if (status === "REJECTED" || status === "DECLINED") {
        router.push("/dashboard/rejected");
        return;
      }

      // Suspended
      if (status === "SUSPENDED") {
        router.push("/dashboard/suspended");
        return;
      }

      // APPROVED or ACTIVE → full dashboard
      if (status === "APPROVED" || status === "ACTIVE") {
        router.push("/dashboard");
        return;
      }

      // Fallback — treat as needing onboarding
      router.push("/onboarding");
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {success && (
        <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <Input
        type="email"
        name="email"
        placeholder="Email address"
        required
        icon="mail"
        label="Email Address"
        defaultValue={prefillEmail}
        autoComplete="email"
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
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[42px] text-neutral-400 hover:text-neutral-600 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Remember me / Forgot password — responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="remember"
            className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
          />
          <span className="text-sm text-neutral-600">Remember me</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors sm:text-right"
        >
          Forgot password?
        </Link>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" className="w-full justify-center" isLoading={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="text-center text-sm text-neutral-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-neutral-900 hover:underline font-semibold transition-colors"
        >
          Sign up
        </Link>
      </div>
    </form>
  );
}