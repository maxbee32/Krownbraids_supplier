// app/(auth)/onboarding/components/PlanSelection.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../ui/Button";
import { OnboardingData } from "../page";
import { Check, Star, ArrowRight, AlertCircle } from "lucide-react";

interface Plan {
  id: number;
  name: string;
  code: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular: boolean;
  maxProducts: number | null;
  maxOrdersPerMonth: number | null;
  maxTeamMembers: number | null;
  maxWarehouses: number | null;
  bulkPricing: boolean;
  apiAccess: boolean;
  featuredListings: boolean;
  customBranding: boolean;
  whiteLabel: boolean;
  analytics: boolean;
  prioritySupport: boolean;
  advancedReporting: boolean;
  multiCurrency: boolean;
}

interface PlanSelectionProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function PlanSelection({ data, updateData, onNext }: PlanSelectionProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    data.billingCycle || "monthly"
  );
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // ═══════════════════════════════════════════
  // FETCH PLANS FROM API
  // ═══════════════════════════════════════════
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        console.log("Fetching supplier plans...");
        const res = await fetch("/api/auth/supplier-plans");
        const json = await res.json();

        console.log("Plans response:", json);

        if (!res.ok) {
          setError(json.message || "Failed to load plans");
          return;
        }

        // Backend returns an array directly
        const planList = Array.isArray(json) ? json : json.data || [];
        setPlans(planList);
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError("Failed to load plans. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // ═══════════════════════════════════════════
  // SELECT PLAN
  // ═══════════════════════════════════════════
  const handleSelectPlan = (plan: Plan) => {
    const price =
      billingCycle === "monthly"
        ? Number(plan.monthlyPrice)
        : Number(plan.yearlyPrice);

    updateData({
      planId: plan.id,
      planName: plan.name,
      planPrice: price,
      billingCycle,
    });
  };

  const handleContinue = () => {
    if (!data.planId) return;
    updateData({ billingCycle });
    onNext();
  };

  // ═══════════════════════════════════════════
  // BUILD FEATURE LIST FROM PLAN FLAGS
  // ═══════════════════════════════════════════
  const buildFeatures = (plan: Plan): string[] => {
    const features: string[] = [];

    // Limits
    if (plan.maxProducts === null) features.push("Unlimited products");
    else features.push(`Up to ${plan.maxProducts} products`);

    if (plan.maxOrdersPerMonth === null) features.push("Unlimited orders");
    else features.push(`${plan.maxOrdersPerMonth} orders/month`);

    if (plan.maxTeamMembers !== null && plan.maxTeamMembers > 1) {
      features.push(`${plan.maxTeamMembers} team members`);
    }

    if (plan.maxWarehouses !== null && plan.maxWarehouses > 1) {
      features.push(`${plan.maxWarehouses} warehouses`);
    }

    // Features
    if (plan.bulkPricing) features.push("Bulk pricing");
    if (plan.featuredListings) features.push("Featured listings");
    if (plan.customBranding) features.push("Custom branding");
    if (plan.analytics) features.push("Analytics dashboard");
    if (plan.advancedReporting) features.push("Advanced reporting");
    if (plan.prioritySupport) features.push("Priority support");
    if (plan.apiAccess) features.push("API access");
    if (plan.whiteLabel) features.push("White-label solution");
    if (plan.multiCurrency) features.push("Multi-currency");

    return features;
  };

  // ═══════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════
  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Choose your plan
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
          <p className="mt-4 text-sm text-neutral-500">Loading plans...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // ERROR STATE
  // ═══════════════════════════════════════════
  if (error) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Choose your plan
          </h2>
        </div>
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Couldn&apos;t load plans
          </h3>
          <p className="text-sm text-neutral-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // EMPTY STATE (no plans in DB)
  // ═══════════════════════════════════════════
  if (plans.length === 0) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Choose your plan
          </h2>
        </div>
        <div className="max-w-md mx-auto text-center py-16">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No plans available
          </h3>
          <p className="text-sm text-neutral-600">
            Please contact support. Subscription plans have not been configured yet.
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════
  return (
    <div className="p-6 sm:p-8 lg:p-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          Choose your plan
        </h2>
        
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-neutral-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === "monthly"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all inline-flex items-center gap-2 ${
              billingCycle === "yearly"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Yearly
            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
              SAVE 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {plans.map((plan) => {
          const isSelected = data.planId === plan.id;
          const price =
            billingCycle === "monthly"
              ? Number(plan.monthlyPrice)
              : Number(plan.yearlyPrice);
          const features = buildFeatures(plan);

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => handleSelectPlan(plan)}
              className={`relative text-left rounded-2xl p-5 sm:p-6 border-2 transition-all duration-200 ${
                isSelected
                  ? "border-neutral-900 bg-neutral-50 shadow-md"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-neutral-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    Popular
                  </span>
                </div>
              )}

              {/* Plan name + description */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-neutral-900">{plan.name}</h3>
                {plan.description && (
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                    {plan.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-neutral-900">£{price}</span>
                <span className="text-sm text-neutral-500">
                  /{billingCycle === "monthly" ? "month" : "year"}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-2">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-neutral-900 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!data.planId}
          className="w-full sm:w-auto sm:min-w-[180px] justify-center"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Trial note */}
      <p className="mt-6 text-center text-xs text-neutral-500">
        {/* You won&apos;t be charged until your 14-day trial ends */}
      </p>
    </div>
  );
}