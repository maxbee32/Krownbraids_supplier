// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
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
  paymentCompletedAt: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
}

interface StoredSupplier {
  id?: string;
  fullName?: string;
  email?: string;
  token?: string;
  role?: string;
}

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

function statusLabel(status: string): string {
  switch (status) {
    case "APPROVED":
    case "ACTIVE":
      return "Active";
    case "PAYMENT_CONFIRMED":
      return "Awaiting Approval";
    case "PENDING_APPROVAL":
      return "Pending Approval";
    case "IN_PROGRESS":
      return "Onboarding";
    case "REVIEW":
      return "In Review";
    case "REJECTED":
    case "DECLINED":
      return "Rejected";
    case "SUSPENDED":
      return "Suspended";
    default:
      return status || "Unknown";
  }
}

function statusBadge(status: string): string {
  const label = statusLabel(status);
  if (label === "Active") return "bg-green-100 text-green-800 border-green-200";
  if (label === "Awaiting Approval")
    return "bg-blue-100 text-blue-800 border-blue-200";
  if (label === "Rejected") return "bg-red-100 text-red-800 border-red-200";
  if (label === "Suspended")
    return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-yellow-100 text-yellow-800 border-yellow-200";
}

function paymentAccent(status: string | null): string {
  if (status === "SUCCESS") return "text-green-600";
  if (status === "PENDING") return "text-yellow-600";
  if (status === "FAILED") return "text-red-600";
  return "text-neutral-900";
}

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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }

  const status = business?.status || "IN_PROGRESS";
  const firstName = supplier?.fullName?.split(" ")[0] || "there";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-neutral-600 mt-2">
          {business?.companyName || "Your business"}
        </p>
      </div>

      {/* Stats — revenue first, then the rest */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <RevenueCard
          total={Number(revenue?.totalRevenue ?? 0)}
          thisMonth={Number(revenue?.thisMonthRevenue ?? 0)}
          loading={revenueLoading}
        />
        <StatCard
          label="Plan"
          value={business?.planName || "—"}
          sub={business?.billingCycle || ""}
        />
        <StatCard
          label="Status"
          value={statusLabel(status)}
          sub={
            business?.onboardingCompleted ? "Onboarding complete" : "In progress"
          }
          badge={statusBadge(status)}
        />
        <StatCard
          label="Payment"
          value={business?.paymentStatus || "—"}
          sub={
            business?.paymentCompletedAt
              ? formatDate(business.paymentCompletedAt)
              : ""
          }
          accent={paymentAccent(business?.paymentStatus || null)}
        />
        <StatCard
          label="Renews"
          value={formatDate(business?.subscriptionEndDate || null)}
          sub={
            business?.subscriptionStartDate
              ? `Started ${formatDate(business.subscriptionStartDate)}`
              : ""
          }
        />
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-xs font-semibold text-neutral-500 mb-4 uppercase tracking-wider">
          Manage
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickLink
            href="/dashboard/profile"
            icon={<ShieldCheckIcon className="h-5 w-5" />}
            title="Business Profile"
            desc="View and update your company details"
          />
          <QuickLink
            href="/dashboard/subscription"
            icon={<CreditCardIcon className="h-5 w-5" />}
            title="Subscription"
            desc="Manage your plan and billing"
          />
          <QuickLink
            href="/dashboard/products"
            icon={<TruckIcon className="h-5 w-5" />}
            title="Products"
            desc="Add and manage your inventory"
          />
          <QuickLink
            href="/dashboard/orders"
            icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
            title="Orders"
            desc="Track incoming orders"
          />
        </div>
      </div>

      {/* Account info */}
      {supplier && (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircleIcon className="h-5 w-5 text-cyan-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-neutral-900">
              Signed in as{" "}
              <span className="font-medium">{supplier.fullName}</span>
            </p>
            <p className="text-xs text-neutral-500 truncate">
              {supplier.email}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Revenue headline card ───
function RevenueCard({
  total,
  thisMonth,
  loading,
}: {
  total: number;
  thisMonth: number;
  loading: boolean;
}) {
  return (
    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 sm:p-5 text-white">
      <div className="flex items-center gap-2 mb-3">
        <BanknotesIcon className="h-4 w-4 text-white/80" />
        <p className="text-[10px] uppercase tracking-wider font-medium text-white/80">
          Revenue
        </p>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-6 w-20 bg-white/20 rounded animate-pulse" />
          <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-xl sm:text-2xl font-bold leading-tight">
            £{total.toFixed(2)}
          </p>
          <p className="text-[11px] text-white/80 mt-1">
            £{thisMonth.toFixed(2)} this month
          </p>
        </>
      )}
    </div>
  );
}

// ─── Standard stat card ───
function StatCard({
  label,
  value,
  sub,
  badge,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  badge?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5">
      <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
        {label}
      </p>
      {badge ? (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-3 ${badge}`}
        >
          {value}
        </span>
      ) : (
        <p
          className={`text-lg sm:text-xl font-bold mt-2 truncate ${
            accent || "text-neutral-900"
          }`}
        >
          {value}
        </p>
      )}
      {sub && (
        <p className="text-xs text-neutral-500 mt-1.5 truncate">{sub}</p>
      )}
    </div>
  );
}

// ─── Quick link card ───
function QuickLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-300 hover:shadow-sm transition-all group flex items-center gap-4"
    >
      <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700 flex-shrink-0 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-500 truncate mt-0.5">{desc}</p>
      </div>
      <ArrowRightIcon className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition-colors flex-shrink-0" />
    </Link>
  );
}