// app/(auth)/onboarding/components/PaymentDetails.tsx
"use client";

import { useState } from "react";
import { Button } from "../../../ui/Button";
import { OnboardingData } from "../../../../(auth)/onboarding/page";
import { ArrowLeft, ArrowRight, CreditCard, ShieldCheck, Lock, X, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentDetailsProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PaymentDetails({ data, updateData, onNext, onBack }: PaymentDetailsProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Called when the user clicks "Continue to payment".
   * Creates the Stripe session and opens the embedded form.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Not authenticated");

      // supplierId comes from the onboarding data (populated at login/registration)
      const supplierId = data.supplierId;
      if (!supplierId) throw new Error("Supplier ID missing. Please log in again.");

      const res = await fetch("/api/auth/supplier-payment/create-stripe-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supplierId,
          planId: data.planId,
          billingCycle: data.billingCycle,
          email: data.email,
        }),
      });

      const payload = await res.json();

      if (!res.ok || !payload.clientSecret) {
        throw new Error(payload.message || "Failed to initialize payment");
      }

      setClientSecret(payload.clientSecret);
      setCheckoutOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Stripe embedded checkout fires this when payment succeeds and the
   * return_url is reached. We then advance the wizard.
   */
  const handleCheckoutComplete = () => {
    setCheckoutOpen(false);
    setClientSecret(null);
    onNext();     // move to review
  };

  const handleCloseCheckout = () => {
    setCheckoutOpen(false);
    setClientSecret(null);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          Payment
        </h2>
        <p className="mt-2 text-sm sm:text-base text-neutral-600">
          Complete your subscription payment securely without leaving this page.
        </p>
      </div>

      {/* Order Summary */}
      <div className="mb-6 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-900">{data.planName} Plan</p>
            <p className="text-sm text-neutral-600 capitalize">
              Billed {data.billingCycle}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-neutral-900">
              £{data.planPrice}
            </p>
            <p className="text-xs text-neutral-500">
              /{data.billingCycle === "monthly" ? "month" : "year"}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Info box */}
      <div className="p-5 rounded-lg bg-blue-50 border border-blue-200 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Secure payment via Stripe
            </h4>
            <p className="text-sm text-blue-700">
              Click &quot;Continue to payment&quot; to enter your card details directly on this page.
              Your subscription activates immediately after payment.
            </p>
          </div>
        </div>
      </div>

      {/* Security features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Lock className="w-4 h-4 text-neutral-400" />
          <span>256-bit encryption</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <ShieldCheck className="w-4 h-4 text-neutral-400" />
          <span>PCI DSS compliant</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <CreditCard className="w-4 h-4 text-neutral-400" />
          <span>All major cards</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto sm:min-w-[180px] justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Preparing…
            </>
          ) : (
            <>
              Continue to payment
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Embedded Stripe Checkout Modal */}
      {checkoutOpen && clientSecret && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleCloseCheckout}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-5 py-3 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-semibold text-neutral-900">Complete payment</h3>
              <button
                type="button"
                onClick={handleCloseCheckout}
                className="text-neutral-500 hover:text-neutral-900 p-1 rounded"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stripe Embedded Checkout */}
            <div className="p-2">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>

            {/* Manual "I've paid" fallback */}
            <div className="px-5 py-3 border-t border-neutral-200 flex justify-between items-center text-xs text-neutral-500">
              <span>Already paid?</span>
              <button
                type="button"
                onClick={handleCheckoutComplete}
                className="text-blue-600 hover:underline font-medium"
              >
                Continue to review
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}