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
  // Step 1: Plan
  planId: number | null;
  planName: string;
  planPrice: number;
  billingCycle: "monthly" | "yearly";

  // Step 2: Company
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

  // Step 3: Payment (display only — actual payment via SumUp)
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

export default function OnboardingPage() {
  const router = useRouter();

  // ✅ Hydration guard
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────
  // STEP 1: Mark hydrated
  // ─────────────────────────────────────────────
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // ─────────────────────────────────────────────
  // STEP 2: Check auth + onboarding status
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!isHydrated) return;

    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch("/api/auth/onboarding/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();

        // If already submitted, route them appropriately
        if (result.data?.onboardingCompleted) {
          const status = result.data.status;

        //   if (status === "PENDING_APPROVAL") {
        //     // Business saved but payment not done → go to payment
        //     router.replace("/onboarding/payment");
        //     return;
        //   }

        // ✅ CORRECT — resume the wizard
if (status === "PENDING_APPROVAL") {
  // Prefill from backend if data exists
  if (result.data) {
    setData((prev) => ({
      ...prev,
      planId: result.data.selectedPlanId || prev.planId,
      planName: result.data.planName || prev.planName,
      planPrice: result.data.planPrice || prev.planPrice,
      billingCycle: result.data.billingCycle || prev.billingCycle,
      companyName: result.data.companyName || prev.companyName,
      companyType: result.data.companyType || prev.companyType,
      companyEmail: result.data.email || prev.companyEmail,
      companyPhone: result.data.phoneNumber || prev.companyPhone,
      companyWebsite: result.data.website || prev.companyWebsite,
      address: result.data.address || prev.address,
      city: result.data.city || prev.city,
      state: result.data.state || prev.state,
      country: result.data.country || prev.country,
      postalCode: result.data.postalCode || prev.postalCode,
      description: result.data.description || prev.description,
    }));
    setCurrentStep(4); // Jump to review step
  }
  setIsAuthenticated(true);
  setIsCheckingStatus(false);
  return;
}

          if (status === "PAYMENT_CONFIRMED") {
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
        }

        setIsAuthenticated(true);
        setIsCheckingStatus(false);
      } catch (err) {
        console.error("Status check failed:", err);
        setIsAuthenticated(true);
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [isHydrated, router]);

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

  // ─────────────────────────────────────────────
  // SUBMIT → SAVE BUSINESS → INIT PAYMENT → REDIRECT TO SUMUP
  // ─────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      // ═══════════════════════════════════════
      // STEP A: Save business (status = PENDING_APPROVAL)
      // ═══════════════════════════════════════
      console.log("Submitting onboarding...");

      const onboardingRes = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Plan
          planId: data.planId,
          planName: data.planName,
          planPrice: data.planPrice,
          billingCycle: data.billingCycle,

          // Company
          companyName: data.companyName,
          companyType: data.companyType,
          description: data.description,
          email: data.companyEmail,
          phoneNumber: data.companyPhone,
          website: data.companyWebsite,

          // Address
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,

          // Legal
          registrationNumber: data.registrationNumber,
          taxId: data.taxId,

          // Payment (display hint only)
          paymentMethod: data.paymentMethod,
          paymentLast4: data.cardNumber
            ? data.cardNumber.replace(/\s/g, "").slice(-4)
            : null,
        }),
      });

      const onboardingResult = await onboardingRes.json();
      console.log("Onboarding result:", onboardingResult);

      if (!onboardingRes.ok) {
        throw new Error(
          onboardingResult.message || "Failed to save onboarding"
        );
      }

      // ═══════════════════════════════════════
      // STEP B: Initialize SumUp payment
      // ═══════════════════════════════════════
      console.log("Initializing payment...");

      const paymentRes = await fetch(
        "/api/auth/supplier-payment/initialize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            supplierId: onboardingResult.data?.supplierId,
            planId: data.planId,
            billingCycle: data.billingCycle,
          }),
        }
      );

      const paymentResult = await paymentRes.json();
      console.log("Payment result:", paymentResult);

      if (!paymentRes.ok || !paymentResult.success) {
        throw new Error(
          paymentResult.message || "Failed to initialize payment"
        );
      }

      // ═══════════════════════════════════════
      // STEP C: Store checkoutId + Redirect to SumUp
      // ═══════════════════════════════════════
      console.log("Redirecting to SumUp:", paymentResult.redirectUrl);

      // ✅ FIX: Store checkoutId in localStorage for the verify page
      if (paymentResult.checkoutId) {
        localStorage.setItem("checkoutId", paymentResult.checkoutId);
        console.log("💾 Stored checkoutId:", paymentResult.checkoutId);
      } else {
        console.warn("⚠️ No checkoutId in payment response!");
      }

      window.location.href = paymentResult.redirectUrl;
    } catch (err) {
      console.error("Submit error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────
  // RENDER GUARDS
  // ─────────────────────────────────────────────
  if (!isHydrated || isCheckingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900 mx-auto" />
          <p className="text-neutral-500 mt-4 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
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

      {/* Progress */}
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

      {/* Content */}
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
              onNext={goToNextStep}
            />
          )}

          {currentStep === 2 && (
            <CompanyDetails
              data={data}
              updateData={updateData}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
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
          <Link
            href="/contact"
            className="text-neutral-900 hover:underline font-medium"
          >
            Contact support
          </Link>
        </div>
      </main>
    </div>
  );
}