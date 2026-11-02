// app/dashboard/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ClockIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { Logo } from "../components/ui/Logo";
import { useAuthToken } from "../../lib/hooks/useAuthToken";
import { useSubscription } from "../../lib/hooks/useSubscription";

const navItems = [
  { name: "Dashboard", icon: HomeIcon, href: "/dashboard" },
  { name: "Products", icon: ShoppingBagIcon, href: "/dashboard/products" },
  { name: "Orders", icon: ClipboardDocumentListIcon, href: "/dashboard/orders" },
  { name: "Transactions", icon: BanknotesIcon, href: "/dashboard/transactions" },
  { name: "Notifications", icon: BellIcon, href: "/dashboard/notifications" },
  { name: "Profile", icon: UserIcon, href: "/dashboard/profile" },
  { name: "Subscription", icon: CreditCardIcon, href: "/dashboard/subscription" },
  { name: "Settings", icon: Cog6ToothIcon, href: "/dashboard/settings" },
];

const SESSION_KEYS = [
  "adminToken",
  "adminData",
  "userId",
  "userRole",
  "supplierData",
  "checkoutId",
] as const;

function clearSession() {
  SESSION_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
}

function daysRemaining(endDate: string | null): number | null {
  if (!endDate) return null;
  const end = new Date(endDate).getTime();
  if (Number.isNaN(end)) return null;
  return Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
}

function daysLabel(days: number | null): string {
  if (days === null) return "No end date";
  if (days <= 0) return "Expired";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

function daysBadge(days: number | null): string {
  if (days === null) return "bg-neutral-100 text-neutral-600 border-neutral-200";
  if (days <= 0) return "bg-red-100 text-red-700 border-red-200";
  if (days <= 7) return "bg-orange-100 text-orange-700 border-orange-200";
  if (days <= 30) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-green-100 text-green-700 border-green-200";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ─── Hydration flag ───
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const token = useAuthToken();
  const isAuthed = !!token;

  const { subscription, loading: subLoading } = useSubscription(token);

  // ─── Real unread count from notification-service ───
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isHydrated || !isAuthed) return;

    let cancelled = false;

    const load = async () => {
      const t = localStorage.getItem("adminToken");
      if (!t) return;
      try {
        const res = await fetch("/api/auth/notifications/unread-count", {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        if (!cancelled && typeof data.count === "number") {
          setUnreadCount(data.count);
        }
      } catch {
        // ignore — keep previous count
      }
    };

    load();
    const id = setInterval(load, 60_000); // refresh every 60s

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [isHydrated, isAuthed, pathname]); // refetch when route changes (e.g. after visiting notifications page)

  // ─── Auth guard — waits for hydration ───
  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthed) {
      router.replace("/login?reason=missing");
    }
  }, [isHydrated, isAuthed, router]);

  const handleLogout = () => {
    clearSession();
    router.replace("/login?reason=signed-out");
  };

  const days = subscription?.subscriptionEndDate
    ? daysRemaining(subscription.subscriptionEndDate)
    : null;

  const activeHref = navItems
    .filter((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  // ─── Render gates ───

  if (!isHydrated) {
    return (
      <div className="flex h-dvh items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
      </div>
    );
  }

  if (!isAuthed) return null;

  return (
    <div className="flex h-dvh flex-col bg-neutral-50 overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 border-b border-neutral-200 bg-white z-30">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
              aria-label="Toggle menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <Link href="/dashboard" aria-label="Dashboard home">
              <Logo />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications — links to the notifications page */}
            <Link
              href="/dashboard/notifications"
              className="relative rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              aria-label={`Notifications${
                unreadCount > 0 ? ` (${unreadCount} unread)` : ""
              }`}
            >
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-neutral-200 bg-white lg:flex xl:w-64">
          <div className="flex-1 space-y-1 overflow-y-auto p-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === activeHref;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    active
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="space-y-2 border-t border-neutral-200 p-3">
            <SubscriptionCard
              planName={subscription?.planName ?? null}
              billingCycle={subscription?.billingCycle ?? null}
              days={days}
              loading={subLoading}
            />

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 transition-all hover:bg-red-50 hover:text-red-700"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Sign out</span>
            </button>
          </div>
        </aside>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-neutral-200 bg-white lg:hidden">
              <div className="mb-4 flex items-center justify-between border-b border-neutral-200 p-4">
                <Logo />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-neutral-500 transition-colors hover:text-neutral-900"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 space-y-1 overflow-y-auto p-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === activeHref;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all ${
                        active
                          ? "bg-neutral-900 text-white"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-2 border-t border-neutral-200 p-3">
                <SubscriptionCard
                  planName={subscription?.planName ?? null}
                  billingCycle={subscription?.billingCycle ?? null}
                  days={days}
                  loading={subLoading}
                />

                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-red-600 transition-all hover:bg-red-50 hover:text-red-700"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">Sign out</span>
                </button>
              </div>
            </aside>
          </>
        )}

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function SubscriptionCard({
  planName,
  billingCycle,
  days,
  loading,
}: {
  planName: string | null;
  billingCycle: string | null;
  days: number | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div className="h-3 w-16 rounded bg-neutral-200" />
        <div className="h-4 w-24 rounded bg-neutral-200" />
        <div className="h-3 w-20 rounded bg-neutral-200" />
      </div>
    );
  }

  if (!planName) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
          Subscription
        </p>
        <p className="mt-1.5 text-sm text-neutral-600">No active plan</p>
        <Link
          href="/dashboard/subscription"
          className="mt-1.5 inline-block text-xs font-medium text-neutral-900 hover:underline"
        >
          View plans →
        </Link>
      </div>
    );
  }

  const isExpired = days !== null && days <= 0;

  return (
    <Link
      href="/dashboard/subscription"
      className={`block rounded-xl border p-3 transition-colors ${
        isExpired
          ? "border-red-200 bg-red-50 hover:border-red-300"
          : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
      }`}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        {isExpired ? (
          <ExclamationTriangleIcon className="h-3.5 w-3.5 text-red-500" />
        ) : (
          <CreditCardIcon className="h-3.5 w-3.5 text-neutral-500" />
        )}
        <p
          className={`text-[10px] font-medium uppercase tracking-wider ${
            isExpired ? "text-red-600" : "text-neutral-500"
          }`}
        >
          {isExpired ? "Expired" : "Your Plan"}
        </p>
      </div>

      <p
        className={`truncate text-sm font-semibold ${
          isExpired ? "text-red-900" : "text-neutral-900"
        }`}
      >
        {planName}
      </p>

      {billingCycle && (
        <p
          className={`mt-0.5 text-[10px] capitalize ${
            isExpired ? "text-red-600" : "text-neutral-500"
          }`}
        >
          Billed {billingCycle}
        </p>
      )}

      <div
        className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${daysBadge(
          days
        )}`}
      >
        <ClockIcon className="h-3 w-3" />
        {daysLabel(days)}
      </div>

      {isExpired && (
        <p className="mt-2 text-[10px] font-medium text-red-700">
          Renew to keep selling →
        </p>
      )}
    </Link>
  );
}