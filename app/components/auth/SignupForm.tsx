// components/auth/SignupForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const data = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(responseData.message || "Registration failed");
        return;
      }

      if (responseData.token) {
        localStorage.setItem("adminToken", responseData.token);
        if (responseData.userId) {
          localStorage.setItem("userId", String(responseData.userId));
        }
        if (responseData.role) {
          localStorage.setItem("userRole", responseData.role);
        }
      }

      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        type="text"
        name="fullName"
        placeholder="John Doe"
        required
        icon="user"
        label="Full Name *"
        autoComplete="name"
      />

      <Input
        type="email"
        name="email"
        placeholder="you@company.com"
        required
        icon="mail"
        label="Email Address *"
        autoComplete="email"
      />

      <Input
        type="tel"
        name="phone"
        placeholder="+44 7000 000000"
        required
        icon="phone"
        label="Phone Number *"
        autoComplete="tel"
      />

      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Create a password"
          required
          icon="lock"
          label="Password *"
          hint="Must be at least 8 characters"
          autoComplete="new-password"
          minLength={8}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-neutral-400 transition-colors hover:text-neutral-600"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="flex items-start gap-2 pt-1">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
        />
        <label htmlFor="terms" className="text-sm leading-relaxed text-neutral-600">
          I agree to the{" "}
          <Link href="/terms" className="font-medium text-neutral-900 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-neutral-900 hover:underline">
            Privacy Policy
          </Link>
        </label>
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

      <Button type="submit" className="w-full justify-center" isLoading={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>

      <div className="text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-neutral-900 transition-colors hover:underline"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}