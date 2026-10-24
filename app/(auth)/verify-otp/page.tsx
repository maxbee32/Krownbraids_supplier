// app/(auth)/verify-otp/page.tsx
import { AuthCard } from "../../components/auth/AuthCard";
import { OTPForm } from "../../components/auth/OTPForm";
import { Suspense } from "react";

export const metadata = {
  title: "Verify Your Email | KrownBraids Supplier",
  description: "Enter the verification code we sent to your email",
};

export default function VerifyOTPPage() {
  return (
    <AuthCard
      title="Verify your email"
      subtitle="We've sent a 4-digit code to your email"
      panel={{
        eyebrow: "Almost there",
        title: "One step left.",
        body: "Verify your email to activate your supplier account and start listing products.",
        features: [
          "Secure email verification",
          "Resend the code if it expires",
          "Instant account activation",
        ],
      }}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
          </div>
        }
      >
        <OTPForm />
      </Suspense>
    </AuthCard>
  );
}