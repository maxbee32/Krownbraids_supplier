// app/dashboard/orders/OrderDetailDrawer.tsx
"use client";

import { useState } from "react";
import {
  X,
  Package,
  Phone,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Loader2,
} from "lucide-react";
import type { Order } from "./page";

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onFulfil?: (orderNumber: string, trackingNumber: string) => Promise<void>;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
    case "PENDING": return "Pending";
    case "PROCESSING": return "Processing";
    case "SHIPPED": return "Shipped";
    case "DELIVERED": return "Delivered";
    case "CANCELLED": return "Cancelled";
  }
}

function statusBadge(status: Order["status"]): string {
  switch (status) {
    case "DELIVERED": return "bg-green-100 text-green-700 border-green-200";
    case "SHIPPED": return "bg-blue-100 text-blue-700 border-blue-200";
    case "PROCESSING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "PENDING": return "bg-orange-100 text-orange-700 border-orange-200";
    case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
  }
}

function StatusIcon({ status }: { status: Order["status"] }) {
  const cls = "h-3.5 w-3.5";
  switch (status) {
    case "DELIVERED": return <CheckCircle className={cls} />;
    case "SHIPPED": return <Truck className={cls} />;
    case "PROCESSING": return <Clock className={cls} />;
    case "PENDING": return <Clock className={cls} />;
    case "CANCELLED": return <XCircle className={cls} />;
  }
}

export function OrderDetailDrawer({
  order,
  isOpen,
  onClose,
  onFulfil,
}: Props) {
  const [tracking, setTracking] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const canFulfil = order.status === "PROCESSING" && typeof onFulfil === "function";

  const handleFulfil = async () => {
    if (!onFulfil) return;
    setSubmitting(true);
    try {
      await onFulfil(order.reference, tracking.trim());
      setTracking("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Centered modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 pointer-events-none">
        <div
          className="relative w-full max-w-2xl max-h-[90vh] bg-white border border-neutral-200 rounded-2xl shadow-2xl flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 border-b border-neutral-200 px-5 sm:px-6 py-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-neutral-500" />
                <span className="text-xs text-neutral-500 font-mono">
                  {order.reference}
                </span>
              </div>
              <h2 className="text-lg font-bold text-neutral-900 truncate">
                {order.customer.name || "—"}
              </h2>
              <span
                className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusBadge(
                  order.status
                )}`}
              >
                <StatusIcon status={order.status} />
                {statusLabel(order.status)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-900 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Customer */}
            <section>
              <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Customer
              </h3>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2.5 text-sm">
                <p className="font-medium text-neutral-900">
                  {order.customer.name || "—"}
                </p>
                {order.customer.phone && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Phone className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                    <span>{order.customer.phone}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Shipping address */}
            <section>
              <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Shipping Address
              </h3>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-neutral-700 leading-relaxed">
                    <p>{order.shippingAddress.line1}</p>
                    {order.shippingAddress.line2 && (
                      <p>{order.shippingAddress.line2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}
                      {order.shippingAddress.postalCode &&
                        `, ${order.shippingAddress.postalCode}`}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Items */}
            <section>
              <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Items ({order.items.length})
              </h3>
              <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 overflow-hidden">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-neutral-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900 truncate">
                        {item.productName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.sku && (
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {item.sku}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-500">
                          × {item.quantity}
                        </span>
                      </div>
                    </div>

                    <span className="text-sm font-medium text-neutral-900 flex-shrink-0">
                      {money(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Shipped — only once fulfilled */}
            {order.fulfilledAt && (
              <section>
                <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                  Shipped
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-blue-900">
                    <Truck className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">
                      Dispatched on {formatDate(order.fulfilledAt)}
                    </span>
                  </div>
                  {order.trackingNumber && (
                    <div className="text-blue-800 text-xs pl-5">
                      Tracking:{" "}
                      <span className="font-mono">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Notes */}
            {order.notes && (
              <section>
                <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                  Notes
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-2">
                  <FileText className="h-3.5 w-3.5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-900">{order.notes}</p>
                </div>
              </section>
            )}

            {/* Totals */}
            {/* Salon paid */}
<section>
  <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">
    Salon paid
  </h3>
  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2 text-sm">
    <Row label="Subtotal" value={money(order.subtotal)} />
    <Row label="Shipping" value={money(order.shippingFee)} />
    {order.taxAmount > 0 && (
      <Row label="Tax" value={money(order.taxAmount)} />
    )}
    <div className="border-t border-neutral-200 pt-2 mt-2">
      <Row label="Total" value={money(order.total)} bold />
    </div>
  </div>
</section>

{/* Your payout — only when commission exists */}
{(order.totalCommission ?? 0) > 0 && (
  <section>
    <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">
      Your payout
    </h3>
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-emerald-900">Order total</span>
        <span className="text-emerald-900 tabular-nums">
          {money(order.total)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-emerald-900/70 flex items-center gap-1.5">
          Platform commission
          <span className="text-[10px] text-emerald-700/70">
            ({(((order.totalCommission ?? 0) / order.total) * 100).toFixed(1)}
            %)
          </span>
        </span>
        <span className="text-emerald-900/70 tabular-nums">
          −{money(order.totalCommission ?? 0)}
        </span>
      </div>
      <div className="border-t border-emerald-200 pt-2 mt-2 flex items-center justify-between gap-3">
        <span className="font-semibold text-emerald-900">You receive</span>
        <span className="font-bold text-emerald-900 tabular-nums text-base">
          {money(order.totalSupplierPayout ?? 0)}
        </span>
      </div>
    </div>

    {/* Per-item breakdown, shown if at least one item has commission */}
    {order.items.some((it) => (it.commissionAmount ?? 0) > 0) && (
      <div className="mt-3 border border-neutral-200 rounded-xl divide-y divide-neutral-100 overflow-hidden">
        {order.items.map((item) => {
          const commissionRate =
            (item.baseCommissionRate ?? 0) +
            (item.categoryCommissionRate ?? 0);
          return (
            <div key={item.id} className="px-4 py-2.5 text-xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-neutral-900 truncate">
                  {item.productName}
                </span>
                <span className="text-neutral-900 font-medium tabular-nums flex-shrink-0">
                  {money(item.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-neutral-500">
                <span>
                  Commission{" "}
                  {commissionRate > 0 && (
                    <span className="text-[10px]">
                      ({(commissionRate * 100).toFixed(1)}%)
                    </span>
                  )}
                </span>
                <span className="tabular-nums">
                  −{money(item.commissionAmount ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-1 text-emerald-700 font-medium">
                <span>You receive</span>
                <span className="tabular-nums">
                  {money(item.supplierPayout ?? 0)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </section>
)}

            {/* Timeline */}
            <section>
              <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Timeline
              </h3>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2 text-sm">
                <Row label="Ordered" value={formatDate(order.createdAt)} />
                <Row label="Last updated" value={formatDate(order.updatedAt)} />
              </div>
            </section>
          </div>

          {/* Fulfil footer — only when the order is still PROCESSING */}
          {canFulfil && (
            <div className="flex-shrink-0 border-t border-neutral-200 px-5 sm:px-6 py-4 bg-neutral-50">
              <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">
                Tracking number (optional)
              </label>
              <input
                type="text"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="e.g. AB123456789GB"
                disabled={submitting}
                className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 mb-3 disabled:opacity-50"
              />
              <button
                onClick={handleFulfil}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Marking as shipped…
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4" />
                    Mark as shipped
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-neutral-500">{label}</span>
      <span className={bold ? "font-bold text-neutral-900" : "text-neutral-900"}>
        {value}
      </span>
    </div>
  );
}