// components/auth/OTPForm.tsx
"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/Button";
import { AlertCircle, CheckCircle, Mail, RefreshCw } from "lucide-react";

const OTP_LENGTH = 4;
const RESEND_COOLDOWN = 60; // seconds

export function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Handle input change
  const handleChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every((digit) => digit !== "") && index === OTP_LENGTH - 1) {
      setTimeout(() => handleSubmit(newOtp.join("")), 100);
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, OTP_LENGTH).split("");
    const newOtp = [...otp];

    digits.forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    const lastIndex = Math.min(digits.length, OTP_LENGTH - 1);
    inputRefs.current[lastIndex]?.focus();

    if (digits.length === OTP_LENGTH) {
      setTimeout(() => handleSubmit(digits.join("")), 100);
    }
  };

  // Submit OTP — email comes from the JWT token
  const handleSubmit = async (code?: string) => {
    const otpCode = code || otp.join("");

    if (otpCode.length !== OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits`);
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // ✅ Get the token stored during signup
      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError("Session expired. Please sign up again.");
        setTimeout(() => router.push("/signup"), 1500);
        return;
      }

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // ✅ Only send OTP — email comes from token
        body: JSON.stringify({ otp: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid verification code");
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }

      // ✅ Clear the signup token — user must log in fresh
      localStorage.removeItem("adminToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");

      setSuccess("Email verified! Please sign in to continue.");

      // ✅ Redirect to LOGIN with verified flag + prefilled email
      setTimeout(() => {
        router.push(
          `/login?verified=true&email=${encodeURIComponent(email)}`
        );
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP — email comes from the JWT token
  const handleResend = async () => {
    if (cooldown > 0) return;

    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError("Session expired. Please sign up again.");
        return;
      }

      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // ✅ No body needed — email comes from token
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to resend code");
        return;
      }

      setSuccess("New code sent to your email");
      setCooldown(RESEND_COOLDOWN);

      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Email display (for reference only — not sent to backend) */}
      {email && (
        <div className="flex items-center justify-center gap-2 text-sm text-neutral-600">
          <Mail className="w-4 h-4" />
          <span>
            Code sent to{" "}
            <span className="font-medium text-neutral-900">{email}</span>
          </span>
        </div>
      )}

      {/* OTP Inputs */}
      <div>
        <label className="block text-sm font-medium text-neutral-900 mb-3 text-center">
          Enter verification code
        </label>
        <div className="flex gap-3 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
                ref={(el) => {
                inputRefs.current[index] = el;
                }}            
            type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isLoading || !!success}
              className={`
                w-14 h-16 sm:w-16 sm:h-18
                text-center text-2xl sm:text-3xl font-bold
                rounded-lg border-2
                bg-white text-neutral-900
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  error
                    ? "border-red-500"
                    : success
                    ? "border-green-500"
                    : "border-neutral-200"
                }
              `}
            />
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full justify-center"
        isLoading={isLoading}
        disabled={otp.some((d) => !d) || !!success}
      >
        {isLoading ? "Verifying..." : "Verify Email"}
      </Button>

      {/* Resend */}
      <div className="text-center text-sm text-neutral-600">
        Didn&apos;t receive the code?{" "}
        {cooldown > 0 ? (
          <span className="text-neutral-400">
            Resend in <span className="font-semibold">{cooldown}s</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="font-semibold text-neutral-900 hover:underline transition-colors inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`}
            />
            {isResending ? "Sending..." : "Resend code"}
          </button>
        )}
      </div>

      {/* Back to signup */}
      <div className="text-center text-sm text-neutral-500">
        Wrong email?{" "}
        <Link
          href="/signup"
          className="text-neutral-900 hover:underline font-medium transition-colors"
        >
          Go back
        </Link>
      </div>
    </form>
  );
}