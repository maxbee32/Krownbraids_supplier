"use client";

import {
  X,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  CreditCard,
  Building2,
  Hash,
  User,
} from "lucide-react";
import type { Transaction } from "./mockTransactions";

interface Props {
  transaction: Transaction | null;
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

function money(v: number, currency = "GBP"): string {
  const symbol = currency === "GBP" ? "£" : currency === "USD" ? "$" : "€";
  const sign = v < 0 ? "-" : "";
  return `${sign}${symbol}${Math.abs(v).toFixed(2)}`;
}

function statusBadge(status: Transaction["status"]): string {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-700 border-green-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "FAILED":
      return "bg-red-100 text-red-700 border-red-200";
    case "REFUNDED":
      return "bg-orange-100 text-orange-700 border-orange-200";
  }
}

function statusLabel(status: Transaction["status"]): string {
  switch (status) {
    case "COMPLETED":
      return "Completed";
    case "PENDING":
      return "Pending";
    case "FAILED":
      return "Failed";
    case "REFUNDED":
      return "Refunded";
  }
}

function StatusIcon({ status }: { status: Transaction["status"] }) {
  const cls = "h-3.5 w-3.5";
  switch (status) {
    case "COMPLETED":
      return <CheckCircle className={cls} />;
    case "PENDING":
      return <Clock className={cls} />;
    case "FAILED":
      return <XCircle className={cls} />;
    case "REFUNDED":
      return <RotateCcw className={cls} />;
  }
}

function typeLabel(type: Transaction["type"]): string {
  switch (type) {
    case "SALE":
      return "Sale";
    case "REFUND":
      return "Refund";
    case "PAYOUT":
      return "Payout";
    case "FEE":
      return "Fee";
  }
}

export function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
}: Props) {
  if (!isOpen || !transaction) return null;

  const isCredit = transaction.amount > 0;

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
          className="relative w-full max-w-lg max-h-[90vh] bg-white border border-neutral-200 rounded-2xl shadow-2xl flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 border-b border-neutral-200 px-5 sm:px-6 py-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isCredit
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {isCredit ? (
                  <ArrowDownLeft className="h-5 w-5" />
                ) : (
                  <ArrowUpRight className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-neutral-500 font-mono">
                  {transaction.reference}
                </p>
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 truncate">
                  {typeLabel(transaction.type)}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusBadge(
                    transaction.status
                  )}`}
                >
                  <StatusIcon status={transaction.status} />
                  {statusLabel(transaction.status)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-900 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Amount headline */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 text-center">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium mb-1">
                Net Amount
              </p>
              <p
                className={`text-3xl font-bold ${
                  transaction.netAmount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {money(transaction.netAmount, transaction.currency)}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Gross {money(transaction.amount, transaction.currency)} · Fee{" "}
                {money(transaction.fee, transaction.currency)}
              </p>
            </div>

            {/* Details */}
            <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
              <Row
                icon={<User className="h-3.5 w-3.5" />}
                label="Customer"
                value={transaction.customerName || "—"}
              />
              <Row
                icon={<Hash className="h-3.5 w-3.5" />}
                label="Order"
                value={transaction.orderId || "—"}
                mono
              />
              <Row
                icon={<CreditCard className="h-3.5 w-3.5" />}
                label="Payment method"
                value={transaction.paymentMethod}
              />
              <Row
                icon={<Receipt className="h-3.5 w-3.5" />}
                label="Reference"
                value={transaction.reference}
                mono
              />
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                Timeline
              </h3>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2 text-sm">
                <Row label="Created" value={formatDate(transaction.createdAt)} plain />
                <Row
                  label="Completed"
                  value={formatDate(transaction.completedAt)}
                  plain
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                Description
              </h3>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-sm text-neutral-700">
                {transaction.description}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({
  icon,
  label,
  value,
  mono,
  plain,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  plain?: boolean;
}) {
  return (
    <div
      className={
        plain
          ? "flex items-center justify-between gap-3"
          : "flex items-center justify-between gap-3 px-4 py-3"
      }
    >
      <div className="flex items-center gap-2 text-neutral-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span
        className={`text-sm text-neutral-900 text-right truncate max-w-[60%] ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}