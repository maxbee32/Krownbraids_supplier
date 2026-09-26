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

// 🔄 Step order: Business → Plan → Payment → Review
const STEPS = [
  { id: 1, name: "Company Details", shortName: "Company" },
  { id: 2, name: "Choose Plan", shortName: "Plan" },
  { id: 3, name: "Payment", shortName: "Payment" },
  { id: 4, name: "Review", shortName: "Review" },
];

// 🔄 Backend step → UI step (backend step means "next step to do")
function stepToUiStep(backendStep: string | null | undefined): number {
  switch (backendStep) {
    case "BUSINESS":  return 1;
    case "PLAN":      return 2;
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
  // Bootstrap: check auth + resume from saved step
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

  // ═══════════════════════════════════════
  // STEP 1 — Save business info (creates the row)
  // ═══════════════════════════════════════
  const saveBusinessAndContinue = async () => {
    setError(null);

    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/onboarding/business", {
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

  // ═══════════════════════════════════════
  // STEP 2 — Save plan selection
  // ═══════════════════════════════════════
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
      const res = await fetch("/api/auth/onboarding/plan", {
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

  // ═══════════════════════════════════════
  // STEP 4 — Initialize payment (SumUp redirect)
  // ═══════════════════════════════════════
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      // ─────────────────────────────────────────
      // Resolve supplierId from localStorage
      // ─────────────────────────────────────────
      let supplierId: string | null = null;

      // 1. Try supplierData.id
      try {
        const stored = localStorage.getItem("supplierData");
        if (stored) {
          const parsed = JSON.parse(stored);
          supplierId = parsed.id ?? parsed.supplierId ?? null;
        }
      } catch {
        // ignore
      }

      // 2. Fallback to userId
      if (!supplierId) {
        supplierId = localStorage.getItem("userId");
      }

      // 3. Last resort — fetch from the API
      if (!supplierId) {
        try {
          const meRes = await fetch("/api/auth/supplier/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const meData = await meRes.json();
          if (meData.success && meData.data?.id) {
            supplierId = meData.data.id;
            localStorage.setItem("userId", supplierId as string);
            localStorage.setItem(
              "supplierData",
              JSON.stringify({
                id: supplierId,
                fullName: meData.data.fullName,
                email: meData.data.email,
                role: meData.data.role ?? "SUPPLIER",
              })
            );
          }
        } catch {
          // ignore
        }
      }

      if (!supplierId) {
        throw new Error(
          "Could not determine your supplier ID. Please log in again."
        );
      }

      console.log("[payment-init] supplierId:", supplierId);

      // ─────────────────────────────────────────
      // Initialize payment with supplierId
      // ─────────────────────────────────────────
      const paymentRes = await fetch("/api/auth/supplier-payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supplierId,
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
      {/* Fixed top bar — matches landing page and auth pages */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex-shrink-0">
              <Logo />
            </Link>
            <div className="text-sm text-neutral-500 hidden sm:block">
              Step {currentStep} of {STEPS.length}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for the fixed header */}
      <div className="h-16 md:h-20" />

      {/* Step indicator */}
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
          {/* Step 1 — Company Details */}
          {currentStep === 1 && (
            <CompanyDetails
              data={data}
              updateData={updateData}
              onNext={saveBusinessAndContinue}
              onBack={goToPreviousStep}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Step 2 — Choose Plan */}
          {currentStep === 2 && (
            <PlanSelection
              data={data}
              updateData={updateData}
              onNext={savePlanAndContinue}
              onBack={goToPreviousStep}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Step 3 — Payment */}
          {currentStep === 3 && (
            <PaymentDetails
              data={data}
              updateData={updateData}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
            />
          )}

          {/* Step 4 — Review */}
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