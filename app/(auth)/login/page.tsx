// app/(auth)/login/page.tsx
import { AuthCard } from "../../components/auth/AuthCard";
import { LoginForm } from "../../components/auth/LoginForm";
import { Suspense } from "react";

export const metadata = {
  title: "Sign In | KrownBraids Supplier",
  description: "Sign in to your supplier account",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your supplier account"
      panel={{
        eyebrow: "Supplier Portal",
        title: "Pick up where you left off.",
        body: "Your catalog, orders, and buyer conversations are exactly where you left them.",
        features: [
          "Real-time stock across every warehouse",
          "Wholesale orders and tiered pricing in one view",
          "Invoices, payments, and credit terms",
          "Direct conversations with your buyers",
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
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}