// app/dashboard/orders/OrderDetailDrawer.tsx
"use client";

import {
  X,
  Package,
  Mail,
  Phone,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
} from "lucide-react";
import type { Order } from "./mockOrders";

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
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
  const cls = "h-3.5 w-3.5";
  switch (status) {
    case "DELIVERED":
      return <CheckCircle className={cls} />;
    case "SHIPPED":
      return <Truck className={cls} />;
    case "PROCESSING":
      return <Clock className={cls} />;
    case "PENDING":
      return <Clock className={cls} />;
    case "CANCELLED":
      return <XCircle className={cls} />;
  }
}

export function OrderDetailDrawer({ order, isOpen, onClose }: Props) {
  if (!isOpen || !order) return null;

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
                {order.customer.name}
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
                  {order.customer.name}
                </p>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Mail className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                  <span className="truncate">{order.customer.email}</span>
                </div>
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
                    className="flex items-start justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
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
            <section>
              <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Totals
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

            {/* Timestamps */}
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