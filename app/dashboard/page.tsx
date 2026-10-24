// app/(protected)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCardIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ClockIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAuthToken } from "../../lib/hooks/useAuthToken";
import { useRevenue } from "../../lib/hooks/useRevenue";

interface BusinessProfile {
  id: string;
  companyName: string | null;
  companyType: string | null;
  planName: string | null;
  billingCycle: string | null;
  status: string;
  onboardingStep: string | null;
  onboardingCompleted: boolean;
  paymentStatus: string | null;
  paymentMethod: string | null;
  paymentCompletedAt: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
}

interface StoredSupplier {
  id?: string;
  fullName?: string;
  email?: string;
  role?: string;
}

// ─── Helpers ───

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function isTrialBusiness(b: BusinessProfile | null): boolean {
  if (!b) return false;
  return b.paymentMethod === "TRIAL" || b.paymentStatus === "TRIAL";
}

function isPaidBusiness(b: BusinessProfile | null): boolean {
  if (!b) return false;
  return b.paymentStatus === "SUCCESS" && b.paymentMethod !== "TRIAL";
}

// ─── Page ───

export default function SupplierDashboardPage() {
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [supplier, setSupplier] = useState<StoredSupplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = useAuthToken();
  const { summary: revenue, loading: revenueLoading } = useRevenue(token);

  useEffect(() => {
    const load = async () => {
      const stored = localStorage.getItem("adminToken");
      if (!stored) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        const storedSupplier = localStorage.getItem("supplierData");
        if (storedSupplier) setSupplier(JSON.parse(storedSupplier));
      } catch {
        // ignore
      }

      try {
        const res = await fetch("/api/auth/supplier/me", {
          headers: { Authorization: `Bearer ${stored}` },
        });

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            `Server returned non-JSON (status ${res.status}). Check DevTools → Network.`
          );
        }

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load business profile");
        }

        setBusiness(data.data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ─── Loading ───
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
      </div>
    );
  }

  // ─── Error ───
  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }

  // ─── Derived state ───
  const status = business?.status || "IN_PROGRESS";
  const firstName = supplier?.fullName?.split(" ")[0] || "there";
  const isTrial = isTrialBusiness(business);
  const isPaid = isPaidBusiness(business);

  const trialDaysLeft =
    isTrial && business?.subscriptionEndDate
      ? daysBetween(new Date(), new Date(business.subscriptionEndDate))
      : null;

  const totalRevenue = Number(revenue?.totalRevenue ?? 0);
  const monthRevenue = Number(revenue?.thisMonthRevenue ?? 0);
  const hasRevenue = totalRevenue > 0;

  const showGettingStarted = isTrial && !hasRevenue;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      {/* ──────────────────────── Header ──────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-neutral-600 mt-1.5">
            {business?.companyName || "Your business"}
            {business?.companyType && (
              <span className="text-neutral-400"> · {business.companyType}</span>
            )}
          </p>
        </div>
        <StatusPill status={status} />
      </div>

      {/* ──────────────────────── Trial banner ──────────────────────── */}
      {isTrial && trialDaysLeft !== null && trialDaysLeft > 0 && (
        <div
          className={`flex items-center gap-4 rounded-2xl border p-5 ${
            trialDaysLeft <= 7
              ? "border-amber-300 bg-amber-50"
              : "border-neutral-200 bg-white"
          }`}
        >
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
              trialDaysLeft <= 7
                ? "bg-amber-100 text-amber-700"
                : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {trialDaysLeft <= 7 ? (
              <ExclamationTriangleIcon className="h-5 w-5" />
            ) : (
              <ClockIcon className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-semibold ${
                trialDaysLeft <= 7 ? "text-amber-900" : "text-neutral-900"
              }`}
            >
              {trialDaysLeft <= 7
                ? `Trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"}`
                : `${trialDaysLeft} days left on your free trial`}
            </p>
            <p
              className={`text-sm mt-1 ${
                trialDaysLeft <= 7 ? "text-amber-700" : "text-neutral-600"
              }`}
            >
              {trialDaysLeft <= 7
                ? "Choose a plan to keep selling after your trial ends."
                : `Your trial ends on ${formatDate(business?.subscriptionEndDate ?? null)}.`}
            </p>
          </div>
          <Link
            href="/dashboard/subscription"
            className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
              trialDaysLeft <= 7
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50"
            }`}
          >
            {trialDaysLeft <= 7 ? "Choose a plan" : "Upgrade"}
          </Link>
        </div>
      )}

      {/* ──────────────────────── Overview cards ──────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-4">
          Overview
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Revenue */}
          <div className="flex min-h-[168px] flex-col rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <BanknotesIcon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Revenue
              </p>
            </div>

            <div className="mt-5 flex-1">
              {revenueLoading ? (
                <div className="space-y-2">
                  <div className="h-8 w-32 bg-neutral-100 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-neutral-50 rounded animate-pulse" />
                </div>
              ) : hasRevenue ? (
                <>
                  <p className="text-3xl font-semibold tracking-tight text-neutral-900">
                    £{totalRevenue.toLocaleString("en-GB", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="mt-1.5 text-sm text-neutral-500">
                    £{monthRevenue.toFixed(2)} this month
                  </p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-semibold tracking-tight text-neutral-300">
                    £0.00
                  </p>
                  <p className="mt-1.5 text-sm text-neutral-500">
                    No revenue yet
                  </p>
                </>
              )}
            </div>

            <div className="mt-4 border-t border-neutral-100 pt-3">
              <p className="text-xs text-neutral-500">
                {hasRevenue
                  ? "Updated from your recent orders"
                  : "Revenue appears after your first order"}
              </p>
            </div>
          </div>

          {/* Plan */}
          <div className="flex min-h-[168px] flex-col rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <CreditCardIcon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Plan
              </p>
            </div>

            <div className="mt-5 flex-1">
              <p className="text-3xl font-semibold tracking-tight text-neutral-900">
                {business?.planName || "—"}
              </p>
              <p className="mt-1.5 text-sm text-neutral-500">
                {isTrial
                  ? "Free trial · no billing"
                  : isPaid
                    ? `Billed ${business?.billingCycle ?? "monthly"}`
                    : "Not yet activated"}
              </p>
            </div>

            <div className="mt-4 border-t border-neutral-100 pt-3">
              <Link
                href="/dashboard/subscription"
                className="text-xs font-medium text-neutral-700 hover:text-neutral-900"
              >
                {isTrial ? "Choose a paid plan →" : "Manage subscription →"}
              </Link>
            </div>
          </div>

          {/* Subscription */}
          <div className="flex min-h-[168px] flex-col rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <ShieldCheckIcon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {isTrial ? "Trial ends" : "Renews"}
              </p>
            </div>

            <div className="mt-5 flex-1">
              <p className="text-3xl font-semibold tracking-tight text-neutral-900">
                {isTrial
                  ? trialDaysLeft !== null
                    ? `${trialDaysLeft}d`
                    : "—"
                  : formatDate(business?.subscriptionEndDate ?? null)}
              </p>
              <p className="mt-1.5 text-sm text-neutral-500">
                {isTrial
                  ? `Ends ${formatDate(business?.subscriptionEndDate ?? null)}`
                  : business?.subscriptionStartDate
                    ? `Started ${formatDate(business.subscriptionStartDate)}`
                    : "No active subscription"}
              </p>
            </div>

            <div className="mt-4 border-t border-neutral-100 pt-3">
              <p className="text-xs text-neutral-500">
                {isTrial && trialDaysLeft !== null
                  ? trialDaysLeft <= 7
                    ? "Trial ending soon"
                    : "Trial active"
                  : "Subscription active"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────── Getting started ──────────────────────── */}
      {showGettingStarted && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
                Get started
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Three steps to start selling on KrownBraids.
              </p>
            </div>
          </div>

          <ol className="space-y-3">
            <GettingStartedStep
              number={1}
              title="Add your first product"
              description="Upload a product with pricing and stock to make it visible to buyers."
              href="/dashboard/products"
              actionLabel="Add product"
            />
            <GettingStartedStep
              number={2}
              title="Complete your business profile"
              description="Add your logo, description, and contact details so buyers recognize you."
              href="/dashboard/profile"
              actionLabel="Edit profile"
            />
            <GettingStartedStep
              number={3}
              title="Review your subscription"
              description="See what's included in your trial and when it ends."
              href="/dashboard/subscription"
              actionLabel="View plan"
            />
          </ol>
        </section>
      )}

      {/* ──────────────────────── Manage ──────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-4">
          Manage
        </h2>
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white divide-y divide-neutral-100">
          <ManageRow
            href="/dashboard/products"
            icon={<TruckIcon className="h-5 w-5" />}
            iconBg="bg-emerald-50 text-emerald-600"
            title="Products"
            desc="Add and manage your inventory"
            meta="Inventory"
          />
          <ManageRow
            href="/dashboard/orders"
            icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
            iconBg="bg-blue-50 text-blue-600"
            title="Orders"
            desc="Track incoming orders and shipments"
            meta="Sales"
          />
          <ManageRow
            href="/dashboard/profile"
            icon={<ShieldCheckIcon className="h-5 w-5" />}
            iconBg="bg-violet-50 text-violet-600"
            title="Business profile"
            desc="View and update your company details"
            meta="Account"
          />
          <ManageRow
            href="/dashboard/subscription"
            icon={<CreditCardIcon className="h-5 w-5" />}
            iconBg="bg-amber-50 text-amber-600"
            title="Subscription"
            desc="Manage your plan and billing"
            meta="Billing"
          />
        </div>
      </section>
    </div>
  );
}

// ─── Status pill ───

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    APPROVED: {
      label: "Active",
      className: "bg-emerald-50 text-emerald-800 ring-emerald-500/20",
    },
    ACTIVE: {
      label: "Active",
      className: "bg-emerald-50 text-emerald-800 ring-emerald-500/20",
    },
    PAYMENT_CONFIRMED: {
      label: "Awaiting approval",
      className: "bg-blue-50 text-blue-800 ring-blue-500/20",
    },
    PENDING_APPROVAL: {
      label: "Pending approval",
      className: "bg-blue-50 text-blue-800 ring-blue-500/20",
    },
    REVIEW: {
      label: "In review",
      className: "bg-blue-50 text-blue-800 ring-blue-500/20",
    },
    IN_PROGRESS: {
      label: "Onboarding",
      className: "bg-yellow-50 text-yellow-800 ring-yellow-500/20",
    },
    REJECTED: {
      label: "Rejected",
      className: "bg-red-50 text-red-800 ring-red-500/20",
    },
    DECLINED: {
      label: "Rejected",
      className: "bg-red-50 text-red-800 ring-red-500/20",
    },
    SUSPENDED: {
      label: "Suspended",
      className: "bg-orange-50 text-orange-800 ring-orange-500/20",
    },
  };

  const config = map[status] ?? {
    label: status || "Unknown",
    className: "bg-neutral-100 text-neutral-700 ring-neutral-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

// ─── Getting started step ───

function GettingStartedStep({
  number,
  title,
  description,
  href,
  actionLabel,
}: {
  number: number;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <li className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
        {number}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-neutral-600">
          {description}
        </p>
      </div>
      <Link
        href={href}
        className="flex-shrink-0 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
      >
        {actionLabel}
      </Link>
    </li>
  );
}

// ─── Manage row ───

function ManageRow({
  href,
  icon,
  iconBg,
  title,
  desc,
  meta,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
  meta?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 px-6 py-4 transition hover:bg-neutral-50"
    >
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="mt-0.5 truncate text-sm text-neutral-500">{desc}</p>
      </div>
      {meta && (
        <span className="hidden flex-shrink-0 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500 sm:inline">
          {meta}
        </span>
      )}
      <ArrowRightIcon className="h-4 w-4 flex-shrink-0 text-neutral-300 transition-colors group-hover:text-neutral-500" />
    </Link>
  );
}