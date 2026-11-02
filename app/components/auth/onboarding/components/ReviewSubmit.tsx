// app/(auth)/onboarding/components/ReviewSubmit.tsx
"use client";

import { useState } from "react";
import { Button } from "../../../ui/Button";
import { OnboardingData } from "../../../../(auth)/onboarding/page";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Building2,
  Package,
  MapPin,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface ReviewSubmitProps {
  data: OnboardingData;
  onTrialActivate: () => void;
  onPaymentComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function ReviewSubmit({
  data,
  onTrialActivate,
  onPaymentComplete,
  onBack,
  isSubmitting,
}: ReviewSubmitProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToAccuracy, setAgreedToAccuracy] = useState(false);

  // Stripe embedded checkout state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const isTrial = Number(data.planPrice) === 0;
  const canSubmit =
    agreedToTerms && agreedToAccuracy && !isSubmitting && !preparing;

  const handleStartPayment = async () => {
    setPayError(null);
    setPreparing(true);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Not authenticated");

      if (!data.supplierId) {
        throw new Error("Supplier ID missing. Please log in again.");
      }
      if (!data.planId) {
        throw new Error("No plan selected.");
      }

      const res = await fetch(
        "/api/auth/supplier-payment/create-stripe-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            supplierId: data.supplierId,
            planId: data.planId,
            billingCycle: data.billingCycle,
            email: data.companyEmail,
          }),
        }
      );

      const payload = await res.json().catch(() => ({}));

      if (!res.ok || !payload.clientSecret) {
        throw new Error(payload.message || "Failed to initialize payment");
      }

      setClientSecret(payload.clientSecret);
      setCheckoutOpen(true);
    } catch (err) {
      setPayError(
        err instanceof Error ? err.message : "Failed to initialize payment"
      );
    } finally {
      setPreparing(false);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    if (isTrial) {
      onTrialActivate();
    } else {
      handleStartPayment();
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          {isTrial ? "Review & submit" : "Review & pay"}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-neutral-600">
          {isTrial
            ? "Confirm your details to submit your application. No payment required for the free trial."
            : "Confirm your details, then complete card payment to submit your application."}
        </p>
      </div>

      {/* Review Sections */}
      <div className="space-y-6">
        {/* Plan Summary */}
        <div className="rounded-lg border border-neutral-200 bg-white">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-neutral-200 bg-neutral-50">
            <Package className="w-5 h-5 text-neutral-700" />
            <h3 className="font-semibold text-neutral-900">
              Subscription Plan
            </h3>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-600">Plan</span>
              <span className="font-medium text-neutral-900">
                {data.planName || (
                  <span className="text-neutral-400">Not selected</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-600">Billing cycle</span>
              <span className="font-medium text-neutral-900 capitalize">
                {data.billingCycle}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
              <span className="text-sm text-neutral-600">Total</span>
              <span className="text-lg font-bold text-neutral-900">
                {isTrial ? "Free" : `£${Number(data.planPrice).toFixed(2)}`}
              </span>
            </div>
            {isTrial && (
              <p className="mt-2 text-xs text-emerald-700">
                No card required — your free trial starts on approval.
              </p>
            )}
          </div>
        </div>

        {/* Company Details */}
        <div className="rounded-lg border border-neutral-200 bg-white">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-neutral-200 bg-neutral-50">
            <Building2 className="w-5 h-5 text-neutral-700" />
            <h3 className="font-semibold text-neutral-900">Company Details</h3>
          </div>
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Company Name</p>
                <p className="text-sm font-medium text-neutral-900">
                  {data.companyName || (
                    <span className="text-neutral-400">Not set</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Company Type</p>
                <p className="text-sm font-medium text-neutral-900">
                  {data.companyType || (
                    <span className="text-neutral-400">Not set</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </p>
                <p className="text-sm font-medium text-neutral-900 break-all">
                  {data.companyEmail || (
                    <span className="text-neutral-400">Not set</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone
                </p>
                <p className="text-sm font-medium text-neutral-900">
                  {data.companyPhone || (
                    <span className="text-neutral-400">Not set</span>
                  )}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100">
              <p className="text-xs text-neutral-500 mb-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Address
              </p>
              <p className="text-sm font-medium text-neutral-900">
                {data.address || (
                  <span className="text-neutral-400">Not set</span>
                )}
                {data.city && `, ${data.city}`}
                {data.state && `, ${data.state}`}
                {data.postalCode && `, ${data.postalCode}`}
                {data.country && `, ${data.country}`}
              </p>
            </div>
          </div>
        </div>

        {/* Payment info — only for paid plans */}
        {isTrial ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="mb-1 font-medium text-emerald-900">
                  Free trial — no payment required
                </h4>
                <p className="text-sm text-emerald-700">
                  You won&apos;t be charged during the trial. Once your account
                  is approved, you can start listing products immediately.
                  We&apos;ll email you before the trial ends so you can pick a
                  paid plan.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="mb-1 font-medium text-blue-900">
                  Secure card payment via Stripe
                </h4>
                <p className="text-sm text-blue-700">
                  Click <strong>Pay with card</strong> to enter your details
                  directly on this page. No redirect — payment happens inline.
                  Your subscription activates immediately after successful
                  payment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pay error */}
        {payError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {payError}
          </div>
        )}

        {/* Security badges — only for paid plans */}
        {!isTrial && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Lock className="h-4 w-4 text-neutral-400" />
              <span>256-bit encryption</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <ShieldCheck className="h-4 w-4 text-neutral-400" />
              <span>PCI DSS compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <CreditCard className="h-4 w-4 text-neutral-400" />
              <span>Visa, Mastercard, Amex</span>
            </div>
          </div>
        )}
      </div>

      {/* Terms Agreement */}
      <div className="mt-8 space-y-3">
        <div className="flex items-start gap-3">
          <input
            id="terms"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
          />
          <label htmlFor="terms" className="text-sm text-neutral-600">
            I agree to the{" "}
            <a
              href="/terms"
              className="font-medium text-neutral-900 hover:underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="font-medium text-neutral-900 hover:underline"
            >
              Privacy Policy
            </a>
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            id="accuracy"
            type="checkbox"
            checked={agreedToAccuracy}
            onChange={(e) => setAgreedToAccuracy(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
          />
          <label htmlFor="accuracy" className="text-sm text-neutral-600">
            I confirm all the information provided is accurate and complete
          </label>
        </div>
      </div>

      {/* What happens next */}
      <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <p className="font-medium mb-1">What happens next?</p>
          {isTrial ? (
            <ol className="text-amber-800 list-decimal list-inside space-y-0.5">
              <li>Your trial is activated immediately on submission.</li>
              <li>
                Our team reviews your application within 24–48 hours — you&apos;ll
                be notified by email.
              </li>
              <li>Once approved, you can start listing products right away.</li>
            </ol>
          ) : (
            <ol className="text-amber-800 list-decimal list-inside space-y-0.5">
              <li>Click <strong>Pay with card</strong> to open the payment form.</li>
              <li>Enter your card details and confirm payment.</li>
              <li>
                Your application is submitted for approval — our team reviews
                it within 24–48 hours.
              </li>
            </ol>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting || preparing}
          className="w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          isLoading={isSubmitting || preparing}
          className="w-full sm:w-auto sm:min-w-[220px] justify-center"
        >
          {preparing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Preparing…
            </>
          ) : isTrial ? (
            <>
              Submit for approval
              <CheckCircle className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Pay with card
              <CreditCard className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Stripe embedded checkout modal */}
      {checkoutOpen && clientSecret && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => {
            setCheckoutOpen(false);
            setClientSecret(null);
          }}
        >
          <div
            className="relative w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-neutral-200 bg-white px-5 py-3">
              <h3 className="font-semibold text-neutral-900">
                Complete payment
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCheckoutOpen(false);
                  setClientSecret(null);
                }}
                className="rounded p-1 text-neutral-500 hover:text-neutral-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-2">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{
                  clientSecret,
                  onComplete: () => {
                    setCheckoutOpen(false);
                    setClientSecret(null);
                    onPaymentComplete();
                  },
                }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}