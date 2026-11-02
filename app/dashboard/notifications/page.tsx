// app/dashboard/notifications/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BellIcon,
  CheckIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface NotificationRow {
  id: number;
  eventId: string | null;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
  recipientType: string;
}

type Filter = "all" | "unread";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB");
}

function toneFromSubject(subject: string | null): "info" | "warning" | "success" {
  const s = (subject || "").toLowerCase();
  if (s.includes("expired") || s.includes("rejected")) return "warning";
  if (
    s.includes("confirmed") ||
    s.includes("approved") ||
    s.includes("payment") ||
    s.includes("received")
  ) {
    return "success";
  }
  return "info";
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unread, setUnread] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Not authenticated");

      const url =
        filter === "unread"
          ? "/api/auth/notifications?unread=true"
          : "/api/auth/notifications";

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to load notifications");
      }

      // Backend may return { notifications: [...], unread: n } directly
      const list: NotificationRow[] = data.notifications ?? [];
      setItems(list);
      setUnread(data.unread ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id: number) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    // Optimistic
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((n) => Math.max(0, n - 1));

    try {
      await fetch(`/api/auth/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      load(); // revert on error
    }
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    setMarkingAll(true);
    try {
      await fetch("/api/auth/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      await load();
    } catch {
      setError("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            {unread > 0
              ? `${unread} unread notification${unread === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 border border-neutral-200 rounded-lg px-3 py-2 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
            >
              <CheckCircleIcon className="h-4 w-4" />
              {markingAll ? "Marking…" : "Mark all read"}
            </button>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 border border-neutral-200 rounded-lg px-3 py-2 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
            aria-label="Refresh"
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="inline-flex bg-neutral-100 rounded-lg p-0.5 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            filter === "all"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-600"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            filter === "unread"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-600"
          }`}
        >
          Unread {unread > 0 && `(${unread})`}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && items.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-neutral-200 bg-white p-4"
            >
              <div className="h-4 w-40 rounded bg-neutral-200 mb-2" />
              <div className="h-3 w-full rounded bg-neutral-100" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
            <BellIcon className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900">
            {filter === "unread"
              ? "No unread notifications"
              : "No notifications yet"}
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            {filter === "unread"
              ? "You've read everything."
              : "You'll see payment confirmations, plan updates, and important alerts here."}
          </p>
        </div>
      )}

      {/* List */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
          {items.map((n, idx) => {
            const tone = toneFromSubject(n.subject);
            const toneStyles = {
              info: "bg-blue-50 text-blue-600",
              warning: "bg-amber-50 text-amber-600",
              success: "bg-emerald-50 text-emerald-600",
            }[tone];
            const Icon =
              tone === "warning"
                ? ExclamationTriangleIcon
                : tone === "success"
                ? CheckCircleIcon
                : InformationCircleIcon;

            return (
              <div
                key={n.id}
                className={`flex gap-3 px-4 py-4 ${
                  idx !== items.length - 1 ? "border-b border-neutral-100" : ""
                } ${!n.read ? "bg-neutral-50/60" : ""}`}
              >
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${toneStyles}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm ${
                        n.read
                          ? "font-medium text-neutral-700"
                          : "font-semibold text-neutral-900"
                      }`}
                    >
                      {n.subject || "Notification"}
                    </p>
                    <span className="flex-shrink-0 text-[10px] text-neutral-500">
                      {relativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
                    {n.message}
                  </p>
                  {!n.read && (
                    <div className="mt-2">
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:underline"
                      >
                        <CheckIcon className="h-3 w-3" />
                        Mark read
                      </button>
                    </div>
                  )}
                </div>
                {!n.read && (
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}