// app/dashboard/subscription/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  CheckCircle,
  CalendarDays,
  Sparkles,
  AlertTriangle,
  Download,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  X,
  Loader2,
} from "lucide-react";

interface BusinessProfile {
  id: string;
  planName: string | null;
  billingCycle: string | null;
  status: string | null;
  paymentStatus: string | null;
  paymentReference: string | null;
  paymentCompletedAt: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
}

interface Plan {
  id: number;
  code: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  popular: boolean;
  active: boolean;
  trialDays: number | null;
  maxProducts: number | null;
  maxOrdersPerMonth: number | null;
  analytics: boolean;
  prioritySupport: boolean;
  advancedReporting: boolean;
}

interface Usage {
  productCount: number;
}

// ─── Helpers ───

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function money(v: number, currency = "GBP"): string {
  const sym = currency === "GBP" ? "£" : currency === "USD" ? "$" : "€";
  return `${sym}${v.toFixed(2)}`;
}

function daysRemaining(endDate: string | null): number | null {
  if (!endDate) return null;
  const end = new Date(endDate).getTime();
  if (Number.isNaN(end)) return null;
  return Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
}

function daysLabel(days: number | null): string {
  if (days === null) return "—";
  if (days <= 0) return "Expired";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function statusBadge(status: string | null): string {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED" || s === "ACTIVE")
    return "bg-green-100 text-green-700 border-green-200";
  if (s === "PAYMENT_CONFIRMED")
    return "bg-blue-100 text-blue-700 border-blue-200";
  if (s === "REJECTED" || s === "DECLINED")
    return "bg-red-100 text-red-700 border-red-200";
  return "bg-yellow-100 text-yellow-800 border-yellow-200";
}

function statusLabel(status: string | null): string {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED" || s === "ACTIVE") return "Active";
  if (s === "PAYMENT_CONFIRMED") return "Awaiting Approval";
  if (s === "PENDING_APPROVAL") return "Pending Approval";
  if (s === "IN_PROGRESS") return "Onboarding";
  if (s === "REJECTED" || s === "DECLINED") return "Rejected";
  if (s === "SUSPENDED") return "Suspended";
  return status || "Unknown";
}

function planFeatures(plan: Plan): string[] {
  const features: string[] = [];

  if (plan.maxProducts === null || plan.maxProducts === 0) {
    features.push("Unlimited products");
  } else {
    features.push(`Up to ${plan.maxProducts} products`);
  }

  if (plan.maxOrdersPerMonth === null || plan.maxOrdersPerMonth === 0) {
    features.push("Unlimited orders");
  } else {
    features.push(
      `${plan.maxOrdersPerMonth.toLocaleString("en-GB")} orders/month`
    );
  }

  if (plan.analytics) features.push("Sales analytics");
  if (plan.advancedReporting) features.push("Advanced reporting");
  if (plan.prioritySupport) features.push("Priority support");

  if (plan.trialDays && plan.trialDays > 0) {
    const months = Math.round(plan.trialDays / 30);
    features.push(
      months > 0
        ? `${months}-month free trial`
        : `${plan.trialDays}-day free trial`
    );
  }

  return features;
}

function planRank(plan: Plan | null): number {
  if (!plan) return 0;
  const monthly = Number(plan.monthlyPrice);
  if (monthly === 0) return 1;
  if (monthly < 30) return 2;
  if (monthly < 70) return 3;
  return 4;
}

// ─── Page ───

export default function SubscriptionPage() {
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [usage, setUsage] = useState<Usage>({ productCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const [switching, setSwitching] = useState<number | null>(null);
  const [confirmDowngrade, setConfirmDowngrade] = useState<Plan | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        const [subRes, plansRes, productsRes] = await Promise.all([
          fetch("/api/auth/onboarding/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/auth/supplier-plans"),
          fetch("/api/auth/products", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const subData = await subRes.json().catch(() => ({}));
        const plansRaw = await plansRes.json().catch(() => null);
        const productsData = await productsRes.json().catch(() => ({}));

        if (subData.success) {
          setBusiness(subData.data);
          const cycle = subData.data?.billingCycle;
          if (cycle === "yearly" || cycle === "monthly") setBillingCycle(cycle);
        }

        // The proxy returns a bare array (backend returns array directly).
        // Handle both shapes: raw array, or { success, data } wrapper.
        let planList: Plan[] = [];
        if (Array.isArray(plansRaw)) {
          planList = plansRaw;
        } else if (
          plansRaw &&
          Array.isArray((plansRaw as { data?: unknown }).data)
        ) {
          planList = (plansRaw as { data: Plan[] }).data;
        }
        setPlans(planList);

        if (productsData.success && Array.isArray(productsData.data)) {
          setUsage({ productCount: productsData.data.length });
        }
      } catch (err) {
        console.error("Failed to load subscription:", err);
        setError("Failed to load subscription");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const days = business?.subscriptionEndDate
    ? daysRemaining(business.subscriptionEndDate)
    : null;
  const isExpiringSoon = days !== null && days > 0 && days <= 7;
  const isExpired = days !== null && days <= 0;

  const currentPlan = useMemo(
    () => plans.find((p) => p.name === business?.planName) ?? null,
    [plans, business]
  );
  const currentRank = planRank(currentPlan);
  const hasPlan = !!business?.planName;

  const handleSelectPlan = async (plan: Plan) => {
    if (!business) return;
    if (plan.name === business.planName) return;

    const targetRank = planRank(plan);

    if (currentPlan && targetRank < currentRank) {
      setConfirmDowngrade(plan);
      return;
    }

    setSwitching(plan.id);
    setActionError(null);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setActionError("Not authenticated");
        return;
      }

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
      if (!supplierId) supplierId = localStorage.getItem("userId");

      if (!supplierId) {
        setActionError(
          "Could not determine your supplier ID. Please sign in again."
        );
        return;
      }

      if (Number(plan.monthlyPrice) === 0) {
        setActionError(
          "The Trial plan is only available at signup. Please choose a paid plan."
        );
        return;
      }

      const paymentRes = await fetch(
        "/api/auth/supplier-payment/initialize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            supplierId,
            planId: plan.id,
            billingCycle,
          }),
        }
      );

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
      setActionError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSwitching(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          Subscription
        </h1>
        <p className="text-neutral-600 mt-1 text-sm">
          {hasPlan
            ? "Your plan, billing, and renewal details"
            : "Choose a plan to start selling"}
        </p>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-current opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isExpiringSoon && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-orange-900">
              Your subscription expires in {days} day{days === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-orange-800 mt-1">
              Renew now to avoid losing access to your products and orders.
            </p>
          </div>
        </div>
      )}

      {isExpired && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">
              Your subscription has expired
            </p>
            <p className="text-xs text-red-800 mt-1">
              Renew to restore full access.
            </p>
          </div>
        </div>
      )}

      {/* Current plan hero */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <p className="text-[10px] uppercase tracking-wider font-medium text-white/70">
                {hasPlan ? "Current Plan" : "No active plan"}
              </p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {business.planName || "None"}
            </h2>
            <p className="text-sm text-white/70 mt-1 capitalize">
              {business.billingCycle
                ? `Billed ${business.billingCycle}`
                : "Select a plan below to get started"}
            </p>
          </div>
          {business.status && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusBadge(
                business.status
              )}`}
            >
              {statusLabel(business.status)}
            </span>
          )}
        </div>

        {hasPlan && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/50 font-medium">
                Started
              </p>
              <p className="text-sm font-medium mt-1">
                {formatDate(business.subscriptionStartDate)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/50 font-medium">
                {isExpired ? "Expired" : "Renews"}
              </p>
              <p className="text-sm font-medium mt-1">
                {formatDate(business.subscriptionEndDate)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/50 font-medium">
                Days Left
              </p>
              <p className="text-sm font-medium mt-1">{daysLabel(days)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Usage */}
      {currentPlan &&
        currentPlan.maxProducts !== null &&
        currentPlan.maxProducts > 0 && (
          <UsageCard
            label="Products"
            used={usage.productCount}
            limit={currentPlan.maxProducts}
          />
        )}

      {/* Billing details */}
      {hasPlan && (
        <section>
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Billing Details
          </h2>
          <div className="bg-white border border-neutral-200 rounded-2xl divide-y divide-neutral-100">
            <Row
              icon={<CreditCard className="h-4 w-4" />}
              label="Payment method"
              value="Card"
            />
            <Row
              icon={<CheckCircle className="h-4 w-4" />}
              label="Payment status"
              value={business.paymentStatus || "—"}
              accent={
                business.paymentStatus === "SUCCESS"
                  ? "text-green-600"
                  : business.paymentStatus === "PENDING"
                  ? "text-yellow-600"
                  : undefined
              }
            />
            <Row
              label="Reference"
              value={business.paymentReference || "—"}
              mono
            />
            <Row
              icon={<CalendarDays className="h-4 w-4" />}
              label="Last payment"
              value={formatDate(business.paymentCompletedAt)}
            />
          </div>
        </section>
      )}

      {/* Available plans */}
      {plans.length > 0 && (
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {hasPlan ? "Change Plan" : "Choose a Plan"}
            </h2>

            <div className="inline-flex bg-neutral-100 rounded-lg p-0.5 self-start sm:self-auto">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-600"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all inline-flex items-center gap-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-600"
                }`}
              >
                Yearly
                <span className="text-[9px] bg-green-100 text-green-700 px-1 py-0.5 rounded font-semibold">
                  SAVE 17%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.name === business.planName;
              const isFree = Number(plan.monthlyPrice) === 0;
              const price =
                billingCycle === "monthly"
                  ? Number(plan.monthlyPrice)
                  : Number(plan.yearlyPrice);
              const features = planFeatures(plan);

              const targetRank = planRank(plan);
              const isUpgrade = currentPlan && targetRank > currentRank;
              const isDowngrade = currentPlan && targetRank < currentRank;
              const isSwitching = switching === plan.id;

              let buttonLabel = "Switch to this plan";
              if (isCurrent) buttonLabel = "Current plan";
              else if (!hasPlan)
                buttonLabel = isFree ? "Start free trial" : "Select plan";
              else if (isUpgrade) buttonLabel = "Upgrade";
              else if (isDowngrade) buttonLabel = "Downgrade";

              const disableButton =
                isCurrent || isSwitching || (!hasPlan && isFree);

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-5 border-2 transition-all flex flex-col ${
                    isCurrent
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  {plan.popular && !isCurrent && (
                    <div className="absolute -top-2.5 left-5">
                      <span className="bg-neutral-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Popular
                      </span>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-2.5 left-5">
                      <span className="bg-green-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Current
                      </span>
                    </div>
                  )}

                  <h3 className="text-base font-bold text-neutral-900 mt-2">
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p className="text-xs text-neutral-600 mt-1">
                      {plan.description}
                    </p>
                  )}

                  <div className="mt-3 mb-4">
                    {isFree ? (
                      <>
                        <span className="text-2xl font-bold text-neutral-900">
                          Free
                        </span>
                        {plan.trialDays && plan.trialDays > 0 && (
                          <p className="text-[11px] text-neutral-500 mt-1">
                            for {plan.trialDays} days
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-neutral-900">
                          £{Number(price).toFixed(2)}
                        </span>
                        <span className="text-sm text-neutral-500">
                          /{billingCycle === "monthly" ? "month" : "year"}
                        </span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-1.5 mb-4 flex-1">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <CheckCircle className="h-3.5 w-3.5 text-neutral-900 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={disableButton}
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      isCurrent
                        ? "bg-neutral-100 text-neutral-500 cursor-not-allowed"
                        : !hasPlan && isFree
                        ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                        : isUpgrade
                        ? "bg-neutral-900 text-white hover:bg-neutral-800"
                        : isDowngrade
                        ? "bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                        : "bg-neutral-900 text-white hover:bg-neutral-800"
                    }`}
                  >
                    {isSwitching ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Redirecting…
                      </>
                    ) : (
                      <>
                        {isUpgrade && <TrendingUp className="h-4 w-4" />}
                        {isDowngrade && <TrendingDown className="h-4 w-4" />}
                        {buttonLabel}
                      </>
                    )}
                  </button>

                  {!hasPlan && isFree && (
                    <p className="text-[10px] text-neutral-400 text-center mt-2">
                      Free trial is only available at signup
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* No plans fallback */}
      {plans.length === 0 && !loading && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 text-center">
          <p className="text-sm text-neutral-600">
            No plans available right now. Please try again later or{" "}
            <a href="/contact" className="underline font-medium text-neutral-900">
              contact support
            </a>
            .
          </p>
        </div>
      )}

      {/* Downgrade confirmation modal */}
      {confirmDowngrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmDowngrade(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <TrendingDown className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">
              Downgrade to {confirmDowngrade.name}?
            </h3>
            <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
              Downgrading is a billing change we handle manually so you don&apos;t
              lose access before your current period ends.
            </p>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
              Contact support and we&apos;ll schedule the change for{" "}
              <span className="font-medium text-neutral-900">
                {formatDate(business.subscriptionEndDate)}
              </span>
              .
            </p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setConfirmDowngrade(null)}
                className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <a
                href={`/contact?subject=downgrade&plan=${encodeURIComponent(
                  confirmDowngrade.name
                )}`}
                className="flex-1 rounded-lg bg-neutral-900 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-neutral-800"
              >
                Contact support
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
        <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">
            Need to change your plan or payment method?
          </p>
          <p className="text-xs text-blue-800 mt-1">
            Contact support and we&apos;ll help you switch plans, update your
            card, or handle special billing requests.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Row ───
function Row({
  icon,
  label,
  value,
  mono,
  accent,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4">
      <div className="flex items-center gap-2 text-neutral-500">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span
        className={`text-sm text-right truncate max-w-[60%] ${
          mono ? "font-mono text-xs" : ""
        } ${accent || "text-neutral-900"}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Usage card ───
function UsageCard({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const isWarning = pct >= 80;
  const isFull = used >= limit;

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-medium text-neutral-500">
            {label} usage
          </p>
          <p className="mt-1 text-sm text-neutral-900">
            <span className="font-semibold">{used}</span>
            <span className="text-neutral-500"> / {limit}</span>
          </p>
        </div>
        {isFull && (
          <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
            Limit reached
          </span>
        )}
        {!isFull && isWarning && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
            {pct}% used
          </span>
        )}
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full transition-all ${
            isFull ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-green-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {isWarning && (
        <p className="mt-2 text-[11px] text-neutral-500">
          {isFull
            ? "You've hit your limit. Upgrade to add more products."
            : "You're approaching your limit. Upgrade to add more products."}
        </p>
      )}
    </div>
  );
}