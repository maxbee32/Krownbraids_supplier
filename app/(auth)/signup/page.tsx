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
      title="Create your supplier account"
      subtitle="Set up your profile and start listing products"
      panel={{
        eyebrow: "Supplier Portal",
        title: "A better way to run wholesale.",
        body: "Everything you need to sell beauty products to salons, spas, and retailers — without spreadsheets.",
        features: [
          "Upload your full catalog with tiered pricing",
          "Track stock across multiple warehouses",
          "Receive and fulfil wholesale orders",
          "Get discovered by beauty businesses",
        ],
      }}
    >
      <SignupForm />
    </AuthCard>
  );
}