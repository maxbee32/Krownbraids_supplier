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
} from "lucide-react";

interface ReviewSubmitProps {
  data: OnboardingData;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function ReviewSubmit({
  data,
  onSubmit,
  onBack,
  isSubmitting,
}: ReviewSubmitProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToAccuracy, setAgreedToAccuracy] = useState(false);

  // Trial = free plan — no card payment needed
  const isTrial = Number(data.planPrice) === 0;
  const canSubmit = agreedToTerms && agreedToAccuracy && !isSubmitting;

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
                {isTrial ? "Free" : `£${data.planPrice}`}
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
                  Card payment via SumUp
                </h4>
                <p className="text-sm text-blue-700">
                  After clicking <strong>Proceed to payment</strong>, you&apos;ll
                  be redirected to SumUp&apos;s secure hosted checkout to enter
                  your card details. You&apos;ll return here once payment is
                  complete, and your application will be submitted for approval.
                </p>
              </div>
            </div>
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
              <li>You&apos;ll be taken to SumUp to pay by card.</li>
              <li>Once paid, your application is submitted for approval.</li>
              <li>
                Our team reviews it within 24–48 hours — you&apos;ll be notified
                by email.
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
          disabled={isSubmitting}
          className="w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          isLoading={isSubmitting}
          className="w-full sm:w-auto sm:min-w-[220px] justify-center"
        >
          {isSubmitting
            ? isTrial
              ? "Submitting…"
              : "Redirecting…"
            : isTrial
              ? "Submit for approval"
              : "Proceed to card payment"}
          {!isSubmitting &&
            (isTrial ? (
              <CheckCircle className="w-4 h-4 ml-2" />
            ) : (
              <ArrowRight className="w-4 h-4 ml-2" />
            ))}
        </Button>
      </div>
    </div>
  );
}