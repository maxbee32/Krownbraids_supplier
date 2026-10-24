"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { CompanyDetails } from "../../components/auth/onboarding/components/CompanyDetails";
import { PlanSelection } from "../../components/auth/onboarding/components/PlanSelection";
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

  paymentMethod: "card"  | null;
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

type StepId = 1 | 2 | 3;

const STEPS: { id: StepId; name: string; shortName: string; blurb: string }[] = [
  { id: 1, name: "Company Details", shortName: "Company", blurb: "Who you are" },
  { id: 2, name: "Choose Plan", shortName: "Plan", blurb: "How you'll sell" },
  { id: 3, name: "Review & Submit", shortName: "Review", blurb: "Confirm & finish" },
];

// Backend has 4 states: BUSINESS → PLAN → PAYMENT → REVIEW → COMPLETED
// Frontend collapses PAYMENT/REVIEW/COMPLETED into step 3.
function stepToUiStep(backendStep: string | null | undefined): StepId {
  switch (backendStep) {
    case "BUSINESS":
      return 1;
    case "PLAN":
      return 2;
    case "PAYMENT":
    case "REVIEW":
    case "COMPLETED":
      return 3;
    default:
      return 1;
  }
}

type BootstrapState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready" };

export default function OnboardingPage() {
  const router = useRouter();

  const [bootstrap, setBootstrap] = useState<BootstrapState>({ kind: "loading" });
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────
  // Bootstrap: auth + resume from saved step
  // ─────────────────────────────────────────────
  const bootstrapOnboarding = useCallback(async () => {
    setBootstrap({ kind: "loading" });
    setError(null);

    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/login?reason=missing");
      return;
    }

    try {
      const res = await fetch("/api/auth/onboarding/status", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Status check failed (${res.status})`);
      }

      const result = await res.json();

      // `{ data: null }` → fresh account, no business row yet
      if (result?.data == null) {
        setBootstrap({ kind: "ready" });
        setCurrentStep(1);
        return;
      }

      const business = result.data;
      const status = business.status as string | null;
      const step = business.onboardingStep as string | null;

      // Terminal states → redirect out of onboarding
      if (status === "PAYMENT_CONFIRMED" || status === "REVIEW") {
        router.replace("/pending-approval");
        return;
      }
      if (status === "APPROVED" || status === "ACTIVE") {
        router.replace("/dashboard");
        return;
      }
      if (status === "REJECTED" || status === "DECLINED") {
        router.replace("/reject");
        return;
      }
      if (status === "SUSPENDED") {
        router.replace("/dashboard/suspended");
        return;
      }

      // Resume: hydrate fields from backend
      setData((prev) => ({
        ...prev,
        planId: business.selectedPlanId ?? prev.planId,
        planName: business.planName ?? prev.planName,
        billingCycle:
          (business.billingCycle as "monthly" | "yearly") ?? prev.billingCycle,
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
        registrationNumber:
          business.registrationNumber ?? prev.registrationNumber,
        taxId: business.taxId ?? prev.taxId,
        description: business.description ?? prev.description,
      }));

      setCurrentStep(stepToUiStep(step));
      setBootstrap({ kind: "ready" });
    } catch (err) {
      setBootstrap({
        kind: "error",
        message:
          err instanceof Error
            ? err.message
            : "Could not reach the server. Please try again.",
      });
    }
  }, [router]);

  useEffect(() => {
    bootstrapOnboarding();
  }, [bootstrapOnboarding]);

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const goToStep = (step: StepId) => {
    setCurrentStep(step);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (currentStep > 1) {
      goToStep((currentStep - 1) as StepId);
    }
  };

  const getToken = (): string | null => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/login?reason=missing");
      return null;
    }
    return token;
  };

  // ─────────────────────────────────────────────
  // Save: Step 1 — business
  // ─────────────────────────────────────────────
  const saveBusiness = async (): Promise<boolean> => {
    const token = getToken();
    if (!token) return false;

    setIsSaving(true);
    setError(null);

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

      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to save business info");
      }
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save business info"
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────
  // Save: Step 2 — plan
  // ─────────────────────────────────────────────
  const savePlan = async (): Promise<boolean> => {
    if (!data.planId) {
      setError("Please select a plan.");
      return false;
    }

    const token = getToken();
    if (!token) return false;

    setIsSaving(true);
    setError(null);

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

      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to save plan");
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save plan");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────
  // Step transitions
  // ─────────────────────────────────────────────
  const handleCompanyNext = async () => {
    const ok = await saveBusiness();
    if (ok) goToStep(2);
  };

  const handlePlanNext = async () => {
    const ok = await savePlan();
    if (ok) goToStep(3);
  };

  // ─────────────────────────────────────────────
  // Step 3 — Either activate trial (free) or
  // initialize SumUp payment (paid plans)
  // ─────────────────────────────────────────────
  const handleSubmit = async () => {
    const token = getToken();
    if (!token) return;

    setIsSaving(true);
    setError(null);

    // Use Number() to handle both 0 and "0" / "0.00" coming from PlanSelection
    const isTrial = Number(data.planPrice) === 0;

    try {
      // ───────────── TRIAL PATH ─────────────
      if (isTrial) {
        const res = await fetch("/api/auth/onboarding/complete-trial", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json().catch(() => ({}));
        if (!res.ok || !result.success) {
          throw new Error(result.message || "Failed to activate trial");
        }

        // Trial activated — go to pending-approval (NOT dashboard).
        // The supplier is not approved yet, so they must wait here.
        router.replace("/pending-approval");
        return;
      }

      // ───────────── PAID PLAN PATH ─────────────
      // Resolve supplierId from storage (multiple fallbacks)
      let supplierId: string | null = null;

      try {
        const stored = localStorage.getItem("supplierData");
        if (stored) {
          const parsed = JSON.parse(stored);
          supplierId = parsed.id ?? parsed.supplierId ?? null;
        }
      } catch {
        // ignore
      }

      if (!supplierId) {
        supplierId = localStorage.getItem("userId");
      }

      if (!supplierId) {
        const meRes = await fetch("/api/auth/supplier/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const meData = await meRes.json().catch(() => ({}));
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
      }

      if (!supplierId) {
        throw new Error(
          "Could not determine your supplier ID. Please log in again."
        );
      }

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

      const paymentResult = await paymentRes.json().catch(() => ({}));
      if (!paymentRes.ok || !paymentResult.success) {
        throw new Error(
          paymentResult.message || "Failed to initialize payment"
        );
      }

      if (paymentResult.checkoutId) {
        localStorage.setItem("checkoutId", paymentResult.checkoutId);
      }

      if (!paymentResult.redirectUrl) {
        throw new Error("Payment redirect missing. Please contact support.");
      }

      window.location.href = paymentResult.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────
  // Render: loading
  // ─────────────────────────────────────────────
  if (bootstrap.kind === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-neutral-400" />
          <p className="mt-4 text-sm text-neutral-500">Loading your setup…</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Render: bootstrap error
  // ─────────────────────────────────────────────
  if (bootstrap.kind === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
            Couldn&apos;t load your account
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            {bootstrap.message}
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={bootstrapOnboarding}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("adminToken");
                router.replace("/login");
              }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Render: ready
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Dark header — matches landing page */}
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950 text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[72px] lg:px-8">
          <Link href="/" className="flex-shrink-0">
            <Logo variant="light" />
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-sm text-neutral-400 sm:flex">
              <span className="font-medium text-white">
                Step {currentStep} of {STEPS.length}
              </span>
              <span className="text-neutral-600">·</span>
              <span>{STEPS[currentStep - 1]?.shortName}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 ring-1 ring-amber-500/20">
              <Sparkles className="h-3 w-3" />
              Setup
            </div>
          </div>
        </div>

        {/* Slim progress bar */}
        <div className="h-1 w-full bg-neutral-800">
          <div
            className="h-full bg-amber-500 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
          {/* ────── Main panel ────── */}
          <div>
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
                Step {currentStep} of {STEPS.length}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                {STEPS[currentStep - 1]?.name}
              </h1>
              <p className="mt-2 text-sm text-neutral-600 sm:text-base">
                {STEPS[currentStep - 1]?.blurb}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              {currentStep === 1 && (
                <CompanyDetails
                  data={data}
                  updateData={updateData}
                  onNext={handleCompanyNext}
                  onBack={goBack}
                  isSubmitting={isSaving}
                />
              )}

              {currentStep === 2 && (
                <PlanSelection
                  data={data}
                  updateData={updateData}
                  onNext={handlePlanNext}
                  onBack={goBack}
                  isSubmitting={isSaving}
                />
              )}

              {currentStep === 3 && (
                <ReviewSubmit
                  data={data}
                  onSubmit={handleSubmit}
                  onBack={goBack}
                  isSubmitting={isSaving}
                />
              )}
            </div>

            <p className="mt-6 text-center text-sm text-neutral-500">
              Need help?{" "}
              <Link
                href="/contact"
                className="font-medium text-neutral-900 hover:underline"
              >
                Contact support
              </Link>
            </p>
          </div>

          {/* ────── Sidebar (desktop only) ────── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              {/* Progress timeline */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                  Your progress
                </p>

                <ol className="space-y-4">
                  {STEPS.map((step, idx) => {
                    const isComplete = step.id < currentStep;
                    const isCurrent = step.id === currentStep;

                    return (
                      <li key={step.id} className="flex items-start gap-3">
                        <div
                          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                            isComplete
                              ? "border-amber-500 bg-amber-500 text-white"
                              : isCurrent
                                ? "border-neutral-900 bg-white text-neutral-900"
                                : "border-neutral-200 bg-white text-neutral-400"
                          }`}
                        >
                          {isComplete ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p
                            className={`text-sm font-medium ${
                              isCurrent
                                ? "text-neutral-900"
                                : isComplete
                                  ? "text-neutral-700"
                                  : "text-neutral-400"
                            }`}
                          >
                            {step.shortName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {step.blurb}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Live summary */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                  Summary
                </p>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-neutral-500">Company</dt>
                    <dd className="mt-0.5 truncate font-medium text-neutral-900">
                      {data.companyName || (
                        <span className="text-neutral-400">Not set</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Plan</dt>
                    <dd className="mt-0.5 truncate font-medium text-neutral-900">
                      {data.planName || (
                        <span className="text-neutral-400">Not selected</span>
                      )}
                      {data.planName && (
                        <span className="ml-1.5 text-xs font-normal text-neutral-500">
                          ({data.billingCycle})
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Sign out */}
              <button
                onClick={() => {
                  localStorage.removeItem("adminToken");
                  router.replace("/login");
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}