// app/dashboard/orders/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { OrderDetailDrawer } from "./OrderDetailDrawer";

/* ─────────────────────────────────────────
   Types
   ───────────────────────────────────────── */

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface Order {
  id: string;
  reference: string;
  status: OrderStatus;
  customer: { name: string; email: string; phone: string | null };
  items: Array<{
    id: string;
    productName: string;
    sku: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    imageUrl?: string | null;
    baseCommissionRate?: number;
    categoryCommissionRate?: number;
    commissionAmount?: number;
    supplierPayout?: number;
  }>;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
  currency: string;
  shippingAddress: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string | null;
    postalCode: string;
    country: string;
  };
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  itemCount?: number;
  thumbnailUrl?: string | null;
  firstItemName?: string | null;
  fulfilledAt?: string | null;
  trackingNumber?: string | null;
  totalCommission?: number;
  totalSupplierPayout?: number;
}

type StatusFilter =
  | "ALL" | "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

/* ─────────────────────────────────────────
   Image proxy
   ───────────────────────────────────────── */

const proxyImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.startsWith("/api/uploads/")) return url;
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("data:")) return url;

  const suppliersIdx = url.indexOf("/images/suppliers/");
  if (suppliersIdx !== -1) {
    const rest = url.substring(suppliersIdx + "/images/suppliers/".length);
    const clean = rest.startsWith("products/")
      ? rest.slice("products/".length)
      : rest;
    return `/api/uploads/${clean}`;
  }

  const uploadsProductsIdx = url.indexOf("/uploads/products/");
  if (uploadsProductsIdx !== -1) {
    return `/api/uploads/${url.substring(
      uploadsProductsIdx + "/uploads/products/".length
    )}`;
  }

  if (url.startsWith("/uploads/")) return `/api${url}`;
  if (url.startsWith("uploads/")) return `/api/${url}`;

  const bareMatch = url.match(
    /^\/?([a-zA-Z0-9_-]+)\/([^/]+\.(?:jpe?g|png|webp|gif|avif|svg))$/i
  );
  if (bareMatch) {
    return `/api/uploads/${bareMatch[1]}/${bareMatch[2]}`;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  return url;
};

/* ─────────────────────────────────────────
   Status normalisation
   ───────────────────────────────────────── */

function normalizeStatus(raw: string | undefined | null): OrderStatus {
  switch ((raw || "").toUpperCase()) {
    case "PAID":
    case "PROCESSING":
      return "PROCESSING";
    case "FULFILLED":
    case "SHIPPED":
      return "SHIPPED";
    case "DELIVERED":
      return "DELIVERED";
    case "CANCELLED":
    case "REFUNDED":
      return "CANCELLED";
    case "PENDING_PAYMENT":
    case "PENDING":
    default:
      return "PENDING";
  }
}

function mapSummary(raw: any): Order {
  return {
    id: String(raw.id),
    reference: raw.orderNumber,
    status: normalizeStatus(raw.status),
    customer: {
      name: raw.shippingName ?? "",
      email: "",
      phone: raw.shippingPhone ?? null,
    },
    items: [],
    subtotal: 0,
    shippingFee: 0,
    taxAmount: 0,
    total: Number(raw.total) || 0,
    currency: raw.currency ?? "GBP",
    shippingAddress: {
      line1: "",
      line2: null,
      city: raw.shippingCity ?? "",
      state: null,
      postalCode: raw.shippingPostalCode ?? "",
      country: raw.shippingCountry ?? "",
    },
    notes: null,
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.fulfilledAt ?? raw.paidAt ?? raw.createdAt ?? "",
    itemCount: raw.itemCount ?? 0,
    thumbnailUrl: proxyImageUrl(raw.thumbnailUrl ?? null),
    firstItemName: raw.firstItemName ?? null,
    fulfilledAt: raw.fulfilledAt ?? null,
    trackingNumber: raw.trackingNumber ?? null,
    totalCommission: Number(raw.totalCommission) || 0,
    totalSupplierPayout: Number(raw.totalSupplierPayout) || 0,
  };
}

function mapDetail(raw: any): Order {
  const items = Array.isArray(raw.items)
    ? raw.items.map((it: any, i: number) => ({
        id: `${raw.orderNumber}-${i}`,
        productName: it.productName ?? "Item",
        sku: null,
        quantity: Number(it.quantity) || 0,
        unitPrice: Number(it.unitPrice) || 0,
        subtotal: Number(it.lineTotal) || 0,
        imageUrl: proxyImageUrl(it.imageUrl ?? null),
        baseCommissionRate: Number(it.baseCommissionRate) || 0,
        categoryCommissionRate: Number(it.categoryCommissionRate) || 0,
        commissionAmount: Number(it.commissionAmount) || 0,
        supplierPayout: Number(it.supplierPayout) || 0,
      }))
    : [];

  return {
    id: String(raw.id),
    reference: raw.orderNumber,
    status: normalizeStatus(raw.status),
    customer: {
      name: raw.shippingName ?? "",
      email: "",
      phone: raw.shippingPhone ?? null,
    },
    items,
    subtotal: Number(raw.subtotal) || 0,
    shippingFee: Number(raw.shipping) || 0,
    taxAmount: 0,
    total: Number(raw.total) || 0,
    currency: raw.currency ?? "GBP",
    shippingAddress: {
      line1: raw.shippingAddress ?? "",
      line2: null,
      city: raw.shippingCity ?? "",
      state: null,
      postalCode: raw.shippingPostalCode ?? "",
      country: raw.shippingCountry ?? "",
    },
    notes: raw.shippingNotes ?? null,
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.fulfilledAt ?? raw.paidAt ?? raw.createdAt ?? "",
    itemCount: items.length,
    thumbnailUrl: proxyImageUrl(raw.thumbnailUrl ?? null),
    firstItemName: raw.firstItemName ?? items[0]?.productName ?? null,
    fulfilledAt: raw.fulfilledAt ?? null,
    trackingNumber: raw.trackingNumber ?? null,
    totalCommission: Number(raw.totalCommission) || 0,
    totalSupplierPayout: Number(raw.totalSupplierPayout) || 0,
  };
}

const STATUS_TO_BACKEND: Record<StatusFilter, string | undefined> = {
  ALL: undefined,
  PENDING: "PENDING_PAYMENT",
  PROCESSING: "PAID",
  SHIPPED: "FULFILLED",
  DELIVERED: "FULFILLED",
  CANCELLED: "CANCELLED",
};

/* ─────────────────────────────────────────
   Display helpers
   ───────────────────────────────────────── */

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

function money(v: number): string {
  return `£${Number(v).toFixed(2)}`;
}

function statusLabel(status: Order["status"]): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "PROCESSING":
      return "Processing";
    case "SHIPPED":
      return "Shipped";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
  }
}

function statusBadge(status: Order["status"]): string {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-700 border-green-200";
    case "SHIPPED":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "PROCESSING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "PENDING":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 border-red-200";
  }
}

function StatusIcon({ status }: { status: Order["status"] }) {
  const cls = "h-3 w-3";
  switch (status) {
    case "DELIVERED":
      return <CheckCircleIcon className={cls} />;
    case "SHIPPED":
      return <TruckIcon className={cls} />;
    case "PROCESSING":
      return <ClockIcon className={cls} />;
    case "PENDING":
      return <ClockIcon className={cls} />;
    case "CANCELLED":
      return <XCircleIcon className={cls} />;
  }
}

/* ─────────────────────────────────────────
   Revenue trend helpers
   ───────────────────────────────────────── */

interface DayBucket {
  date: Date;
  revenue: number;
  count: number;
}

function buildDailySeries(orders: Order[], days: number): DayBucket[] {
  const buckets: DayBucket[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.push({ date: d, revenue: 0, count: 0 });
  }

  for (const order of orders) {
    if (order.status === "CANCELLED") continue;
    if (!order.createdAt) continue;

    const created = new Date(order.createdAt);
    created.setHours(0, 0, 0, 0);

    const bucket = buckets.find((b) => b.date.getTime() === created.getTime());
    if (bucket) {
      bucket.revenue += order.total;
      bucket.count += 1;
    }
  }

  return buckets;
}

/* ─────────────────────────────────────────
   Page
   ───────────────────────────────────────── */

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selected, setSelected] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ---------- Load list ---------- */
  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Not signed in");

      const qs = new URLSearchParams();
      const backendStatus = STATUS_TO_BACKEND[filter];
      if (backendStatus) qs.set("status", backendStatus);
      qs.set("page", String(page));
      qs.set("size", "20");

      const res = await fetch(
        `/api/auth/payments/marketplace/supplier/orders?${qs.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed to load orders (${res.status})`);
      }

      const json = await res.json();
      const content = (json.content ?? []).map(mapSummary);
      setOrders(content);
      setTotalPages(json.totalPages ?? 1);
    } catch (e: any) {
      setError(e.message ?? "Could not load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  /* ---------- Drawer ---------- */
  const openDrawer = async (order: Order) => {
    setSelected(order);
    setDrawerOpen(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `/api/auth/payments/marketplace/supplier/orders/${encodeURIComponent(
          order.reference
        )}`,
        {
          headers: { Authorization: `Bearer ${token ?? ""}` },
          cache: "no-store",
        }
      );
      if (res.ok) {
        const full = await res.json();
        setSelected(mapDetail(full));
      }
    } catch {
      // keep summary view if detail fetch fails
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelected(null), 200);
  };

  /* ---------- Fulfil ---------- */
  const handleFulfil = async (orderNumber: string, trackingNumber: string) => {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Not signed in");

    try {
      const res = await fetch(
        `/api/auth/payments/marketplace/supplier/orders/${encodeURIComponent(
          orderNumber
        )}/fulfil`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ trackingNumber: trackingNumber || null }),
        }
      );

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed to fulfil (${res.status})`);
      }

      closeDrawer();
      setFilter("SHIPPED");
      setPage(0);
      setSuccessBanner(`Order ${orderNumber} marked as shipped`);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (e: any) {
      setError(e.message ?? "Could not fulfil order");
      throw e;
    }
  };

  /* ---------- Search ---------- */
  const filtered = orders.filter((o) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      o.reference.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      (o.firstItemName ?? "").toLowerCase().includes(q)
    );
  });

  /* ---------- Stats ---------- */
  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status !== "CANCELLED");
    const revenue = active.reduce((sum, o) => sum + o.total, 0);
    const avgOrder = active.length > 0 ? revenue / active.length : 0;

    return {
      total: orders.length,
      pending: orders.filter(
        (o) => o.status === "PENDING" || o.status === "PROCESSING"
      ).length,
      shipped: orders.filter((o) => o.status === "SHIPPED").length,
      delivered: orders.filter((o) => o.status === "DELIVERED").length,
      revenue,
      avgOrder,
    };
  }, [orders]);

  const series = useMemo(() => buildDailySeries(orders, 14), [orders]);

  const last7 = series.slice(-7).reduce((s, b) => s + b.revenue, 0);
  const prev7 = series.slice(0, 7).reduce((s, b) => s + b.revenue, 0);

  const trendPct =
    prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : last7 > 0 ? 100 : 0;
  const isUp = trendPct >= 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Orders
          </h1>
          <p className="text-neutral-600 mt-1 text-sm">
            Track and manage customer orders
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-center gap-2">
          <span className="text-sm text-red-700 flex-1">{error}</span>
          <button
            onClick={loadOrders}
            className="text-xs font-medium text-red-700 hover:text-red-900 flex items-center gap-1"
          >
            <ArrowPathIcon className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Success banner */}
      {successBanner && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="text-sm text-emerald-700 flex-1">
            {successBanner}
          </span>
        </div>
      )}

      {/* Trend + stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                Revenue · last 14 days
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
                {money(last7 + prev7)}
              </p>
              <div
                className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${
                  isUp ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {isUp ? (
                  <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
                ) : (
                  <ArrowTrendingDownIcon className="h-3.5 w-3.5" />
                )}
                {isUp ? "+" : ""}
                {trendPct.toFixed(1)}% vs previous 7 days
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                Orders in period
              </p>
              <p className="mt-2 text-lg font-semibold text-neutral-900">
                {series.reduce((s, b) => s + b.count, 0)}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Sparkline data={series.map((b) => b.revenue)} />
          </div>

          <div className="mt-2 flex justify-between text-[10px] text-neutral-400">
            <span>{formatDate(series[0]?.date.toISOString() ?? null)}</span>
            <span>Today</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <StatBox
            label="Awaiting action"
            value={String(stats.pending)}
            accent="text-orange-600"
            subtitle="Pending + processing"
          />
          <StatBox
            label="Avg order"
            value={money(stats.avgOrder)}
            accent="text-neutral-900"
            subtitle={`${stats.total} total orders`}
          />
        </div>
      </div>

      {/* Second row of stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatBox label="Total" value={String(stats.total)} />
        <StatBox
          label="Shipped"
          value={String(stats.shipped)}
          accent="text-blue-600"
        />
        <StatBox
          label="Delivered"
          value={String(stats.delivered)}
          accent="text-green-600"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              "ALL",
              "PENDING",
              "PROCESSING",
              "SHIPPED",
              "DELIVERED",
              "CANCELLED",
            ] as const
          ).map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
                setPage(0);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border ${
                filter === s
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-2xl bg-neutral-100 border border-neutral-200 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <FunnelIcon className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900">
            No orders found
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            {search
              ? "Try a different search or status filter."
              : "Orders will appear here as they come in."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <thead>
                <tr className="text-left text-[10px] text-neutral-500 uppercase tracking-wider border-b border-neutral-200 bg-neutral-50">
                  <th className="px-4 py-3 font-medium w-16"></th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
                        {order.thumbnailUrl ? (
                          <img
                            src={order.thumbnailUrl}
                            alt={order.firstItemName ?? "Product"}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PhotoIcon className="h-4 w-4 text-neutral-300" />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-neutral-900">
                        {order.reference}
                      </span>
                      <p className="text-xs text-neutral-500 truncate max-w-[180px] mt-0.5">
                        {order.firstItemName ?? ""}
                        {(order.itemCount ?? 0) > 1 &&
                          ` +${(order.itemCount ?? 1) - 1} more`}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-sm text-neutral-900 truncate max-w-[180px]">
                        {order.customer.name || "—"}
                      </p>
                      <p className="text-xs text-neutral-500 truncate max-w-[180px]">
                        {order.customer.phone ?? ""}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-xs text-neutral-500 hidden md:table-cell">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-4 py-3 text-right">
  <p className="text-sm font-semibold text-neutral-900 tabular-nums">
    {money(order.total)}
  </p>
  {(order.totalSupplierPayout ?? 0) > 0 &&
    order.totalSupplierPayout !== order.total && (
      <p className="text-[10px] text-emerald-700 tabular-nums mt-0.5">
        You earn {money(order.totalSupplierPayout ?? 0)}
      </p>
    )}
</td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusBadge(
                          order.status
                        )}`}
                      >
                        <StatusIcon status={order.status} />
                        {statusLabel(order.status)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openDrawer(order)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg text-xs bg-white hover:bg-neutral-100 border border-neutral-200 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-neutral-500">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg text-xs bg-white hover:bg-neutral-100 border border-neutral-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <OrderDetailDrawer
        order={selected}
        isOpen={drawerOpen}
        onClose={closeDrawer}
        onFulfil={handleFulfil}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Sparkline
   ───────────────────────────────────────── */

function Sparkline({
  data,
  width = 400,
  height = 60,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  if (data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const stepX = width / (data.length - 1 || 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return { x, y, v };
  });

  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const fillPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      preserveAspectRatio="none"
      style={{ height: `${height}px` }}
    >
      <defs>
        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={fillPath} fill="url(#revenueGradient)" />

      <path
        d={linePath}
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      <circle cx={last.x} cy={last.y} r="3" fill="#10b981" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   Stat box
   ───────────────────────────────────────── */

function StatBox({
  label,
  value,
  accent,
  subtitle,
}: {
  label: string;
  value: string;
  accent?: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5">
      <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
        {label}
      </p>
      <p
        className={`text-lg sm:text-xl font-bold mt-2 truncate ${
          accent || "text-neutral-900"
        }`}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-[10px] text-neutral-400 mt-1 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}