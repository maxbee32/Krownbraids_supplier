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
} from "@heroicons/react/24/outline";
import { Logo } from "../components/ui/Logo";
import { useAuthToken } from "../../lib/hooks/useAuthToken";
import { useSubscription } from "../../lib/hooks/useSubscription";

const navItems = [
  { name: "Dashboard", icon: HomeIcon, href: "/dashboard" },
  { name: "Products", icon: ShoppingBagIcon, href: "/dashboard/products" },
  { name: "Orders", icon: ClipboardDocumentListIcon, href: "/dashboard/orders" },
  { name: "Transactions", icon: BanknotesIcon, href: "/dashboard/transactions" },
  { name: "Profile", icon: UserIcon, href: "/dashboard/profile" },
  { name: "Subscription", icon: CreditCardIcon, href: "/dashboard/subscription" },
  { name: "Settings", icon: Cog6ToothIcon, href: "/dashboard/settings" },
];

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

  const token = useAuthToken();
  const isAuthed = !!token;

  const { subscription, loading: subLoading } = useSubscription(token);

  useEffect(() => {
    if (!isAuthed) {
      router.replace("/login");
    }
  }, [isAuthed, router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("supplierData");
    window.dispatchEvent(new StorageEvent("storage", { key: "adminToken" }));
    router.replace("/login");
  };

  if (!isAuthed) return null;

  const days = subscription?.subscriptionEndDate
    ? daysRemaining(subscription.subscriptionEndDate)
    : null;

  // Most specific active match wins
  const activeHref = navItems
    .filter((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div className="h-screen flex flex-col bg-neutral-50 overflow-hidden">
      {/* Top bar */}
      <header className="bg-white border-b border-neutral-200 flex-shrink-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-neutral-500 hover:text-neutral-900 p-1 transition-colors"
              aria-label="Toggle menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <Link href="/dashboard">
              <Logo />
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm text-neutral-500 hover:text-neutral-900 px-3 py-1.5 rounded-lg hover:bg-neutral-100 flex items-center gap-1.5 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-56 xl:w-64 border-r border-neutral-200 bg-white flex-shrink-0">
          {/* Scrollable nav */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === activeHref;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                    active
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Bottom: subscription card + sign out */}
          <div className="border-t border-neutral-200 p-3 space-y-2">
            <SubscriptionCard
              planName={subscription?.planName ?? null}
              billingCycle={subscription?.billingCycle ?? null}
              days={days}
              loading={subLoading}
            />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
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
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed left-0 top-0 h-full w-[280px] bg-white z-50 lg:hidden flex flex-col border-r border-neutral-200">
              <div className="flex items-center justify-between mb-6 p-4 border-b border-neutral-200">
                <Logo showSupplier={false} />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-neutral-500 hover:text-neutral-900 transition-colors"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Scrollable nav */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === activeHref;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                        active
                          ? "bg-neutral-900 text-white"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom: subscription card + sign out */}
              <div className="border-t border-neutral-200 p-3 space-y-2">
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
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">Sign out</span>
                </button>
              </div>
            </aside>
          </>
        )}

        {/* Main */}
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
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-2 animate-pulse">
        <div className="h-3 w-16 bg-neutral-200 rounded" />
        <div className="h-4 w-24 bg-neutral-200 rounded" />
        <div className="h-3 w-20 bg-neutral-200 rounded" />
      </div>
    );
  }

  if (!planName) {
    return (
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
        <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
          Subscription
        </p>
        <p className="text-sm text-neutral-600 mt-1.5">No active plan</p>
        <Link
          href="/dashboard/subscription"
          className="text-xs text-neutral-900 font-medium hover:underline mt-1.5 inline-block"
        >
          View plans →
        </Link>
      </div>
    );
  }

  return (
    <Link
      href="/dashboard/subscription"
      className="block bg-neutral-50 border border-neutral-200 rounded-xl p-3 hover:border-neutral-300 transition-colors"
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <CreditCardIcon className="h-3.5 w-3.5 text-neutral-500" />
        <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
          Your Plan
        </p>
      </div>

      <p className="text-sm font-semibold text-neutral-900 truncate">
        {planName}
      </p>

      {billingCycle && (
        <p className="text-[10px] text-neutral-500 mt-0.5 capitalize">
          Billed {billingCycle}
        </p>
      )}

      <div
        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border mt-2 ${daysBadge(
          days
        )}`}
      >
        <ClockIcon className="h-3 w-3" />
        {daysLabel(days)}
      </div>
    </Link>
  );
}