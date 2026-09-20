// app/(auth)/signup/page.tsx
import { AuthCard } from "../../components/auth/AuthCard";
import { SignupForm } from "../../components/auth/SignupForm";

export const metadata = {
  title: "Sign Up | KrownBraids Supplier",
  description: "Create your supplier account",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Create Account"
      subtitle="Start your journey as a supplier"
      image="signup"
    >
      <SignupForm />
    </AuthCard>
  );
}