// app/(auth)/onboarding/components/PaymentDetails.tsx
"use client";

import { Button } from "../../../ui/Button";
// import { OnboardingData } from "../page";
import { ArrowLeft, ArrowRight, CreditCard, ShieldCheck, Lock } from "lucide-react";

interface PaymentDetailsProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PaymentDetails({ data, updateData, onNext, onBack }: PaymentDetailsProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          Payment
        </h2>
        <p className="mt-2 text-sm sm:text-base text-neutral-600">
          You'll be redirected to our secure payment provider to complete your subscription.
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

      {/* Info box */}
      <div className="p-5 rounded-lg bg-blue-50 border border-blue-200 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Secure payment via SumUp
            </h4>
            <p className="text-sm text-blue-700">
              After clicking continue, you'll be redirected to SumUp's
              secure hosted checkout to enter your payment details.
              You'll return here once payment is complete.
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
          className="w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto sm:min-w-[180px] justify-center"
        >
          Continue to Review
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}