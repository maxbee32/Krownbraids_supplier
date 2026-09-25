// app/(auth)/onboarding/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "../../components/ui/Logo";
import { StepIndicator } from "../../components/auth/onboarding/components/StepIndicator";
import { CompanyDetails } from "../../components/auth/onboarding/components/CompanyDetails";
import { PlanSelection } from "../../components/auth/onboarding/components/PlanSelection";
import { PaymentDetails } from "../../components/auth/onboarding/components/PaymentDetails";
import { ReviewSubmit } from "../../components/auth/onboarding/components/ReviewSubmit";

export interface OnboardingData {
  planId: number | null;
  planName: string;
  planPrice: number;
  billingCycle: "monthly" | "yearly";

  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyWebsite: string;
  companyType: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  registrationNumber: string;
  taxId: string;
  description: string;

  paymentMethod: "card" | "bank_transfer" | null;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvc: string;
}

const INITIAL_DATA: OnboardingData = {
  planId: null,
  planName: "",
  planPrice: 0,
  billingCycle: "monthly",

  companyName: "",
  companyEmail: "",
  companyPhone: "",
  companyWebsite: "",
  companyType: "",
  address: "",
  city: "",
  state: "",
  country: "United Kingdom",
  postalCode: "",
  registrationNumber: "",
  taxId: "",
  description: "",

  paymentMethod: null,
  cardNumber: "",
  cardName: "",
  cardExpiry: "",
  cardCvc: "",
};

const STEPS = [
  { id: 1, name: "Choose Plan", shortName: "Plan" },
  { id: 2, name: "Company Details", shortName: "Company" },
  { id: 3, name: "Payment", shortName: "Payment" },
  { id: 4, name: "Review", shortName: "Review" },
];

function stepToUiStep(backendStep: string | null | undefined): number {
  switch (backendStep) {
    case "PLAN":      return 1;
    case "BUSINESS":  return 2;
    case "PAYMENT":   return 3;
    case "REVIEW":    return 4;
    case "COMPLETED": return 4;
    default:          return 1;
  }
}

export default function OnboardingPage() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────
  // Single bootstrap effect
  // ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch("/api/auth/onboarding/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();

        if (cancelled) return;

        if (!result.data) {
          setCurrentStep(1);
          setIsAuthenticated(true);
          setIsCheckingStatus(false);
          return;
        }

        const business = result.data;
        const status = business.status as string;
        const step = business.onboardingStep as string | null;

        if (status === "PAYMENT_CONFIRMED" || status === "REVIEW") {
          router.replace("/dashboard/pending-approval");
          return;
        }
        if (status === "APPROVED" || status === "ACTIVE") {
          router.replace("/dashboard");
          return;
        }
        if (status === "REJECTED" || status === "DECLINED") {
          router.replace("/dashboard/rejected");
          return;
        }
        if (status === "SUSPENDED") {
          router.replace("/dashboard/suspended");
          return;
        }

        setData((prev) => ({
          ...prev,
          planId: business.selectedPlanId ?? prev.planId,
          planName: business.planName ?? prev.planName,
          billingCycle: (business.billingCycle as "monthly" | "yearly") ?? prev.billingCycle,
          companyName: business.companyName ?? prev.companyName,
          companyType: business.companyType ?? prev.companyType,
          companyEmail: business.email ?? prev.companyEmail,
          companyPhone: business.phoneNumber ?? prev.companyPhone,
          companyWebsite: business.website ?? prev.companyWebsite,
          address: business.address ?? prev.address,
          city: business.city ?? prev.city,
          state: business.state ?? prev.state,
          country: business.country ?? prev.country,
          postalCode: business.postalCode ?? prev.postalCode,
          registrationNumber: business.registrationNumber ?? prev.registrationNumber,
          taxId: business.taxId ?? prev.taxId,
          description: business.description ?? prev.description,
        }));

        setCurrentStep(stepToUiStep(step));
        setIsAuthenticated(true);
        setIsCheckingStatus(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Status check failed:", err);
        setIsAuthenticated(true);
        setIsCheckingStatus(false);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const goToNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const savePlanAndContinue = async () => {
    setError(null);
    if (!data.planId) {
      setError("Please select a plan.");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/supplier-onboarding/plan", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: data.planId,
          planName: data.planName,
          billingCycle: data.billingCycle,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to save plan");
      }

      goToNextStep();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveBusinessAndContinue = async () => {
    setError(null);

    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/supplier-onboarding/business", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: data.companyName,
          companyType: data.companyType,
          description: data.description,
          email: data.companyEmail,
          phoneNumber: data.companyPhone,
          website: data.companyWebsite,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
          registrationNumber: data.registrationNumber,
          taxId: data.taxId,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to save business info");
      }

      goToNextStep();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save business info");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      const paymentRes = await fetch("/api/auth/supplier-payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: data.planId,
          billingCycle: data.billingCycle,
        }),
      });

      const paymentResult = await paymentRes.json();
      if (!paymentRes.ok || !paymentResult.success) {
        throw new Error(paymentResult.message || "Failed to initialize payment");
      }

      if (paymentResult.checkoutId) {
        localStorage.setItem("checkoutId", paymentResult.checkoutId);
      }

      window.location.href = paymentResult.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900 mx-auto" />
          <p className="text-neutral-500 mt-4 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo />
            </Link>
            <div className="text-sm text-neutral-500 hidden sm:block">
              Step {currentStep} of {STEPS.length}
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step < currentStep) setCurrentStep(step);
            }}
          />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm">
          {currentStep === 1 && (
            <PlanSelection
              data={data}
              updateData={updateData}
              onNext={savePlanAndContinue}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === 2 && (
            <CompanyDetails
              data={data}
              updateData={updateData}
              onNext={saveBusinessAndContinue}
              onBack={goToPreviousStep}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === 3 && (
            <PaymentDetails
              data={data}
              updateData={updateData}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
            />
          )}

          {currentStep === 4 && (
            <ReviewSubmit
              data={data}
              onSubmit={handleSubmit}
              onBack={goToPreviousStep}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        <div className="mt-8 text-center text-sm text-neutral-500">
          Need help?{" "}
          <Link href="/contact" className="text-neutral-900 hover:underline font-medium">
            Contact support
          </Link>
        </div>
      </main>
    </div>
  );
}