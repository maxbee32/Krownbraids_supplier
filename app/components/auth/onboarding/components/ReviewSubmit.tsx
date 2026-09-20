// app/(auth)/onboarding/components/ReviewSubmit.tsx
"use client";

import { useState } from "react";
import { Button } from "../../../ui/Button";
import { OnboardingData } from "../page";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Building2,
  Package,
  MapPin,
  Mail,
  Phone,
  FileText,
  AlertCircle,
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
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const canSubmit = agreedToTerms && agreedToPrivacy && !isSubmitting;

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          Review your information
        </h2>
        <p className="mt-2 text-sm sm:text-base text-neutral-600">
          Please review your details before submitting for approval.
        </p>
      </div>

      {/* Review Sections */}
      <div className="space-y-6">
        {/* Plan Summary */}
        <div className="rounded-lg border border-neutral-200 bg-white">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-neutral-200 bg-neutral-50">
            <Package className="w-5 h-5 text-neutral-700" />
            <h3 className="font-semibold text-neutral-900">Subscription Plan</h3>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-600">Plan</span>
              <span className="font-medium text-neutral-900">{data.planName}</span>
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
                £{data.planPrice}
              </span>
            </div>
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
                  {data.companyName}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Company Type</p>
                <p className="text-sm font-medium text-neutral-900">
                  {data.companyType}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </p>
                <p className="text-sm font-medium text-neutral-900 break-all">
                  {data.companyEmail}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone
                </p>
                <p className="text-sm font-medium text-neutral-900">
                  {data.companyPhone}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100">
              <p className="text-xs text-neutral-500 mb-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Address
              </p>
              <p className="text-sm font-medium text-neutral-900">
                {data.address}, {data.city}
                {data.state && `, ${data.state}`}, {data.postalCode},{" "}
                {data.country}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="rounded-lg border border-neutral-200 bg-white">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-neutral-200 bg-neutral-50">
            <CreditCard className="w-5 h-5 text-neutral-700" />
            <h3 className="font-semibold text-neutral-900">Payment Method</h3>
          </div>
          <div className="p-5">
            {data.paymentMethod === "card" ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-neutral-200 rounded flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      •••• •••• •••• {data.cardNumber.replace(/\s/g, "").slice(-4)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {data.cardName} · Expires {data.cardExpiry}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <FileText className="w-4 h-4" />
                <span>Bank Transfer - Instructions will be sent via email</span>
              </div>
            )}
          </div>
        </div>
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
            <a href="/terms" className="font-medium text-neutral-900 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="font-medium text-neutral-900 hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            id="privacy"
            type="checkbox"
            checked={agreedToPrivacy}
            onChange={(e) => setAgreedToPrivacy(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
          />
          <label htmlFor="privacy" className="text-sm text-neutral-600">
            I confirm all the information provided is accurate and complete
          </label>
        </div>
      </div>

      {/* Info note */}
      <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">What happens next?</p>
          <p className="text-blue-700">
            Your account will be reviewed by our team within 24-48 hours. You'll
            receive an email once your account is approved.
          </p>
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
          className="w-full sm:w-auto sm:min-w-[200px] justify-center"
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              Submit for Approval
              <Check className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}