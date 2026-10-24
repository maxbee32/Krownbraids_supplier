// app/(auth)/forgot-password/page.tsx
import { AuthCard } from "../../components/auth/AuthCard";
import { ForgotPasswordForm } from "../../components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Reset Password | KrownBraids Supplier",
  description: "Reset your supplier account password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a verification code"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}