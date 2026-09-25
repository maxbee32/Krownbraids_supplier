// app/dashboard/subscription/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle,
  CalendarDays,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Download,
  X,
} from "lucide-react";

interface BusinessProfile {
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
  name: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  popular: boolean;
  maxProducts: number | null;
  maxOrdersPerMonth: number | null;
  maxTeamMembers: number | null;
  maxWarehouses: number | null;
  bulkPricing: boolean;
  featuredListings: boolean;
  customBranding: boolean;
  analytics: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  advancedReporting: boolean;
  multiCurrency: boolean;
}

interface Invoice {
  id: string;
  reference: string;
  date: string;
  amount: number;
  currency: string;
  status: "PAID" | "PENDING" | "FAILED";
}

// ─── Mock invoices for now ───
const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv_001",
    reference: "INV-2026-0001",
    date: "2026-09-20T12:00:00Z",
    amount: 49.0,
    currency: "GBP",
    status: "PAID",
  },
  {
    id: "inv_002",
    reference: "INV-2026-0002",
    date: "2026-08-20T12:00:00Z",
    amount: 49.0,
    currency: "GBP",
    status: "PAID",
  },
  {
    id: "inv_003",
    reference: "INV-2026-0003",
    date: "2026-07-20T12:00:00Z",
    amount: 49.0,
    currency: "GBP",
    status: "PAID",
  },
];

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

function daysColor(days: number | null): string {
  if (days === null) return "text-neutral-500";
  if (days <= 0) return "text-red-600";
  if (days <= 7) return "text-orange-600";
  if (days <= 30) return "text-yellow-600";
  return "text-green-600";
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
  if (plan.maxProducts === null) features.push("Unlimited products");
  else features.push(`Up to ${plan.maxProducts} products`);

  if (plan.maxOrdersPerMonth === null) features.push("Unlimited orders");
  else features.push(`${plan.maxOrdersPerMonth} orders/month`);

  if (plan.maxTeamMembers !== null && plan.maxTeamMembers > 1)
    features.push(`${plan.maxTeamMembers} team members`);
  if (plan.maxWarehouses !== null && plan.maxWarehouses > 1)
    features.push(`${plan.maxWarehouses} warehouses`);

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
}

export default function SubscriptionPage() {
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        const [subRes, plansRes] = await Promise.all([
          fetch("/api/auth/onboarding/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/auth/supplier-plans", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const subData = await subRes.json();
        const plansData = await plansRes.json();

        if (subData.success) {
          setBusiness(subData.data);
          const cycle = subData.data?.billingCycle;
          if (cycle === "yearly" || cycle === "monthly") setBillingCycle(cycle);
        }

        if (plansData.success && Array.isArray(plansData.data)) {
          setPlans(plansData.data);
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

  const days = business.subscriptionEndDate
    ? daysRemaining(business.subscriptionEndDate)
    : null;
  const isExpiringSoon = days !== null && days > 0 && days <= 7;
  const isExpired = days !== null && days <= 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          Subscription
        </h1>
        <p className="text-neutral-600 mt-1 text-sm">
          Your plan, billing, and renewal details
        </p>
      </div>

      {/* Expiry warning */}
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
                Current Plan
              </p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {business.planName || "No plan"}
            </h2>
            <p className="text-sm text-white/70 mt-1 capitalize">
              Billed {business.billingCycle || "—"}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusBadge(
              business.status
            )}`}
          >
            {statusLabel(business.status)}
          </span>
        </div>

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
              Renews
            </p>
            <p className="text-sm font-medium mt-1">
              {formatDate(business.subscriptionEndDate)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/50 font-medium">
              Days Left
            </p>
            <p className="text-sm font-medium mt-1">
              {daysLabel(days)}
            </p>
          </div>
        </div>
      </div>

      {/* Billing details */}
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

      {/* Billing history */}
      <section>
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Billing History
        </h2>
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="text-left text-[10px] text-neutral-500 uppercase tracking-wider border-b border-neutral-200 bg-neutral-50">
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Download</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_INVOICES.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-3 text-xs font-mono text-neutral-900">
                      {inv.reference}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500">
                      {formatDate(inv.date)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900 text-right">
                      {money(inv.amount, inv.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-green-100 text-green-700 border-green-200">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          alert("Invoice download coming soon.")
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 px-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Available plans */}
      {plans.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Available Plans
            </h2>

            {/* Billing cycle toggle */}
            <div className="inline-flex bg-neutral-100 rounded-lg p-0.5">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.name === business.planName;
              const price =
                billingCycle === "monthly"
                  ? Number(plan.monthlyPrice)
                  : Number(plan.yearlyPrice);
              const features = planFeatures(plan);

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-5 border-2 transition-all ${
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
                    <span className="text-2xl font-bold text-neutral-900">
                      £{price}
                    </span>
                    <span className="text-sm text-neutral-500">
                      /{billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  </div>

                  <ul className="space-y-1.5 mb-4">
                    {features.slice(0, 6).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <CheckCircle className="h-3.5 w-3.5 text-neutral-900 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700">{f}</span>
                      </li>
                    ))}
                    {features.length > 6 && (
                      <li className="text-[10px] text-neutral-500 pl-5">
                        + {features.length - 6} more features
                      </li>
                    )}
                  </ul>

                  <button
                    disabled={isCurrent}
                    onClick={() =>
                      alert(
                        isCurrent
                          ? "You're already on this plan."
                          : `Upgrade flow for ${plan.name} coming soon.`
                      )
                    }
                    className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isCurrent
                        ? "bg-neutral-100 text-neutral-500 cursor-not-allowed"
                        : "bg-neutral-900 text-white hover:bg-neutral-800"
                    }`}
                  >
                    {isCurrent
                      ? "Current Plan"
                      : "Switch to this plan"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Contact */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
        <RefreshCw className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
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