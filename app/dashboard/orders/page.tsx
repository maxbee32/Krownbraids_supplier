// app/dashboard/orders/page.tsx
"use client";

import { useMemo, useState } from "react";
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
} from "@heroicons/react/24/outline";
import { MOCK_ORDERS, type Order } from "./mockOrders";
import { OrderDetailDrawer } from "./OrderDetailDrawer";

type StatusFilter =
  | "ALL"
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

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

// ─────────────────────────────────────────
// Revenue trend helpers
// ─────────────────────────────────────────

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

    const bucket = buckets.find(
      (b) => b.date.getTime() === created.getTime()
    );
    if (bucket) {
      bucket.revenue += order.total;
      bucket.count += 1;
    }
  }

  return buckets;
}

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [selected, setSelected] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = (order: Order) => {
    setSelected(order);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelected(null), 200);
  };

  const filtered = MOCK_ORDERS.filter((o) => {
    const matchesStatus = filter === "ALL" || o.status === filter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.reference.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const stats = useMemo(() => {
    const active = MOCK_ORDERS.filter((o) => o.status !== "CANCELLED");
    const revenue = active.reduce((sum, o) => sum + o.total, 0);
    const avgOrder = active.length > 0 ? revenue / active.length : 0;

    return {
      total: MOCK_ORDERS.length,
      pending: MOCK_ORDERS.filter(
        (o) => o.status === "PENDING" || o.status === "PROCESSING"
      ).length,
      shipped: MOCK_ORDERS.filter((o) => o.status === "SHIPPED").length,
      delivered: MOCK_ORDERS.filter((o) => o.status === "DELIVERED").length,
      revenue,
      avgOrder,
    };
  }, []);

  // Build 14-day trend
  const series = useMemo(() => buildDailySeries(MOCK_ORDERS, 14), []);

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

      {/* ─────────── Trend + stats ─────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Trend card (2/3 on desktop) */}
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

          {/* Sparkline */}
          <div className="mt-4">
            <Sparkline data={series.map((b) => b.revenue)} />
          </div>

          {/* Day labels */}
          <div className="mt-2 flex justify-between text-[10px] text-neutral-400">
            <span>{formatDate(series[0]?.date.toISOString() ?? null)}</span>
            <span>Today</span>
          </div>
        </div>

        {/* Right column — two stacked stats */}
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
            placeholder="Search by order ID, customer, or email…"
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
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border ${
                filter === s
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {s === "ALL"
                ? "All"
                : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <FunnelIcon className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900">
            No orders match your filters
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Try a different search or status filter.
          </p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="text-left text-[10px] text-neutral-500 uppercase tracking-wider border-b border-neutral-200 bg-neutral-50">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">
                    Items
                  </th>
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
                      <span className="text-xs font-mono text-neutral-900">
                        {order.reference}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-neutral-900 truncate max-w-[180px]">
                        {order.customer.name}
                      </p>
                      <p className="text-xs text-neutral-500 truncate max-w-[180px]">
                        {order.customer.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500 hidden md:table-cell">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-neutral-900 text-right">
                      {money(order.total)}
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

      {/* Drawer */}
      <OrderDetailDrawer
        order={selected}
        isOpen={drawerOpen}
        onClose={closeDrawer}
      />
    </div>
  );
}

// ─────────────────────────────────────────
// Sparkline
// ─────────────────────────────────────────

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

  // Smooth curve through the points using quadratic midpoints
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    path += ` Q ${prev.x} ${prev.y} ${midX} ${midY(prev, curr)}`;
    path += ` T ${curr.x} ${curr.y}`;
  }

  // Simpler: use straight lines
  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const fillPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  // Find the last point for the dot
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      preserveAspectRatio="none"
      style={{ height: `${height}px` }}
    >
      {/* Gradient fill */}
      <defs>
        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Filled area under the line */}
      <path d={fillPath} fill="url(#revenueGradient)" />

      {/* The line itself */}
      <path
        d={linePath}
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* End dot */}
      <circle cx={last.x} cy={last.y} r="3" fill="#10b981" />
    </svg>
  );
}

function midY(
  prev: { x: number; y: number },
  curr: { x: number; y: number }
): number {
  return (prev.y + curr.y) / 2;
}

// ─────────────────────────────────────────
// Stat box
// ─────────────────────────────────────────

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