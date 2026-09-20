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
      image="signup"
    >
      <Suspense fallback={<div className="text-center text-neutral-500">Loading...</div>}>
        <OTPForm />
      </Suspense>
    </AuthCard>
  );
}