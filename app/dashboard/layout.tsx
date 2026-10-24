// app/dashboard/layout.tsx
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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
  CheckIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Logo } from "../components/ui/Logo";
import { useAuthToken } from "../../lib/hooks/useAuthToken";
import { useSubscription } from "../../lib/hooks/useSubscription";

// ─────────────────────────────────────────
// NAV ITEMS
// ─────────────────────────────────────────
const navItems = [
  { name: "Dashboard", icon: HomeIcon, href: "/dashboard" },
  { name: "Products", icon: ShoppingBagIcon, href: "/dashboard/products" },
  { name: "Orders", icon: ClipboardDocumentListIcon, href: "/dashboard/orders" },
  { name: "Transactions", icon: BanknotesIcon, href: "/dashboard/transactions" },
  { name: "Profile", icon: UserIcon, href: "/dashboard/profile" },
  { name: "Subscription", icon: CreditCardIcon, href: "/dashboard/subscription" },
  { name: "Settings", icon: Cog6ToothIcon, href: "/dashboard/settings" },
];

// ─────────────────────────────────────────
// SESSION / HELPERS
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────

type NotificationTone = "info" | "warning" | "danger" | "success";

interface AppNotification {
  id: string;
  title: string;
  body: string;
  tone: NotificationTone;
  href?: string;
  createdAt: string; // ISO string
}

const READ_NOTIFICATIONS_KEY = "supplierReadNotificationIds";

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_NOTIFICATIONS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(
      READ_NOTIFICATIONS_KEY,
      JSON.stringify(Array.from(ids))
    );
  } catch {
    // ignore
  }
}

/**
 * Generate notifications from the supplier's current subscription state.
 * These are derived (not stored server-side), so:
 *   - read state lives in localStorage
 *   - when the underlying state changes (e.g. trial ends), the notification
 *     appears automatically
 *   - no backend changes needed
 */
function deriveNotifications(
  planName: string | null,
  billingCycle: string | null,
  subscriptionEndDate: string | null
): AppNotification[] {
  const items: AppNotification[] = [];
  const now = new Date().toISOString();
  const days = daysRemaining(subscriptionEndDate);

  if (!planName) {
    items.push({
      id: "no-plan",
      title: "No active subscription",
      body: "Choose a plan to start selling on KrownBraids.",
      tone: "warning",
      href: "/dashboard/subscription",
      createdAt: now,
    });
    return items;
  }

  if (days !== null && days <= 0) {
    items.push({
      id: "subscription-expired",
      title: "Subscription expired",
      body: "Your plan has ended. Renew now to keep selling.",
      tone: "danger",
      href: "/dashboard/subscription",
      createdAt: now,
    });
  } else if (days !== null && days <= 7) {
    items.push({
      id: "subscription-ending-soon",
      title: `Subscription ends in ${days} day${days === 1 ? "" : "s"}`,
      body: "Renew now to avoid interruption to your orders.",
      tone: "warning",
      href: "/dashboard/subscription",
      createdAt: now,
    });
  } else if (days !== null && days <= 30) {
    items.push({
      id: "subscription-ending-month",
      title: `${days} days left on your plan`,
      body: "Plan ahead — you can renew anytime from the Subscription page.",
      tone: "info",
      href: "/dashboard/subscription",
      createdAt: now,
    });
  }

  // First-products prompt: only makes sense if they have no revenue yet
  // (we don't have that data in this component, so this is a demo prompt)
  items.push({
    id: "add-first-product",
    title: "Add your first product",
    body: "List a product with pricing and stock so buyers can find you.",
    tone: "info",
    href: "/dashboard/products",
    createdAt: now,
  });

  return items;
}

// ─────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────

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

  // ─── Notifications state ───
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const notifRef = useRef<HTMLDivElement | null>(null);

  // Load read state once on mount
  useEffect(() => {
    setReadIds(loadReadIds());
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [notifOpen]);

  // Close on route change
  useEffect(() => {
    setNotifOpen(false);
  }, [pathname]);

  // Auth guard
  useEffect(() => {
    if (!isAuthed) {
      router.replace("/login?reason=missing");
    }
  }, [isAuthed, router]);

  const handleLogout = () => {
    clearSession();
    router.replace("/login?reason=signed-out");
  };

  // Derived values
  const days = subscription?.subscriptionEndDate
    ? daysRemaining(subscription.subscriptionEndDate)
    : null;

  const activeHref = navItems
    .filter((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  // Compute notifications from current state
  const notifications = useMemo(
    () =>
      deriveNotifications(
        subscription?.planName ?? null,
        subscription?.billingCycle ?? null,
        subscription?.subscriptionEndDate ?? null
      ),
    [subscription]
  );

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  // ─── Notification actions ───
  const markRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  };

  const markAllRead = () => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      saveReadIds(next);
      return next;
    });
  };

  if (!isAuthed) return null;

  return (
    <div className="flex h-dvh flex-col bg-neutral-50 overflow-hidden">
      {/* ────────────── Top bar ────────────── */}
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
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                aria-label={`Notifications${
                  unreadCount > 0 ? ` (${unreadCount} unread)` : ""
                }`}
                aria-expanded={notifOpen}
              >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  {/* Mobile backdrop */}
                  <div
                    className="fixed inset-0 z-40 bg-black/20 sm:hidden"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div className="fixed inset-x-4 top-16 z-50 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl sm:absolute sm:inset-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          Notifications
                        </p>
                        <p className="text-xs text-neutral-500">
                          {unreadCount > 0
                            ? `${unreadCount} unread`
                            : "All caught up"}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Items */}
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <BellIcon className="mx-auto mb-2 h-8 w-8 text-neutral-300" />
                          <p className="text-sm text-neutral-500">
                            No notifications
                          </p>
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const isRead = readIds.has(n.id);
                          const toneStyles: Record<
                            NotificationTone,
                            { bg: string; icon: React.ReactNode }
                          > = {
                            info: {
                              bg: "bg-blue-50 text-blue-600",
                              icon: (
                                <InformationCircleIcon className="h-4 w-4" />
                              ),
                            },
                            warning: {
                              bg: "bg-amber-50 text-amber-600",
                              icon: (
                                <ExclamationTriangleIcon className="h-4 w-4" />
                              ),
                            },
                            danger: {
                              bg: "bg-red-50 text-red-600",
                              icon: (
                                <ExclamationTriangleIcon className="h-4 w-4" />
                              ),
                            },
                            success: {
                              bg: "bg-emerald-50 text-emerald-600",
                              icon: <CheckIcon className="h-4 w-4" />,
                            },
                          };
                          const styles = toneStyles[n.tone];

                          return (
                            <div
                              key={n.id}
                              className={`flex gap-3 border-b border-neutral-100 px-4 py-3 transition-colors last:border-0 ${
                                isRead ? "bg-white" : "bg-neutral-50/50"
                              }`}
                            >
                              <div
                                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${styles.bg}`}
                              >
                                {styles.icon}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-medium text-neutral-900">
                                    {n.title}
                                  </p>
                                  {!isRead && (
                                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">
                                  {n.body}
                                </p>
                                <div className="mt-2 flex items-center gap-3">
                                  {n.href && (
                                    <Link
                                      href={n.href}
                                      onClick={() => {
                                        markRead(n.id);
                                        setNotifOpen(false);
                                      }}
                                      className="text-xs font-medium text-neutral-900 hover:underline"
                                    >
                                      View →
                                    </Link>
                                  )}
                                  {!isRead && (
                                    <button
                                      onClick={() => markRead(n.id)}
                                      className="text-xs text-neutral-500 hover:text-neutral-700 hover:underline"
                                    >
                                      Mark read
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="border-t border-neutral-100 px-4 py-2 text-center">
                        <button
                          onClick={() => setNotifOpen(false)}
                          className="text-xs font-medium text-neutral-500 hover:text-neutral-700"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Sign out */}
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
        {/* ────────────── Desktop sidebar ────────────── */}
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

        {/* ────────────── Mobile sidebar ────────────── */}
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

        {/* ────────────── Main ────────────── */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

// ────────────── Subscription card ──────────────

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