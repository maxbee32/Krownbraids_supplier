// app/dashboard/transactions/page.tsx
"use client";

import { useState } from "react";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import {
  MOCK_TRANSACTIONS,
  type Transaction,
} from "./mockTransactions";
import { TransactionDetailModal } from "./TransactionDetailModal";

type StatusFilter = "ALL" | "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED";
type TypeFilter = "ALL" | "SALE" | "REFUND" | "PAYOUT";

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
  const sign = v < 0 ? "-" : "";
  return `${sign}£${Math.abs(v).toFixed(2)}`;
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

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (txn: Transaction) => {
    setSelected(txn);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelected(null), 200);
  };

  const filtered = MOCK_TRANSACTIONS.filter((t) => {
    const matchesStatus =
      statusFilter === "ALL" || t.status === statusFilter;
    const matchesType = typeFilter === "ALL" || t.type === typeFilter;

    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.reference.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.orderId || "").toLowerCase().includes(q) ||
      (t.customerName || "").toLowerCase().includes(q);

    return matchesStatus && matchesType && matchesSearch;
  });

  // Revenue = completed sales only (no refunds, no pending)
  const completedSales = MOCK_TRANSACTIONS.filter(
    (t) => t.type === "SALE" && t.status === "COMPLETED"
  );
  const totalRevenue = completedSales.reduce((s, t) => s + t.netAmount, 0);

  const thisMonth = completedSales
    .filter((t) => {
      const d = new Date(t.createdAt);
      const now = new Date();
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, t) => s + t.netAmount, 0);

  const pending = MOCK_TRANSACTIONS.filter(
    (t) => t.status === "PENDING"
  ).reduce((s, t) => s + t.netAmount, 0);

  const refunded = MOCK_TRANSACTIONS.filter(
    (t) => t.type === "REFUND"
  ).reduce((s, t) => s + Math.abs(t.netAmount), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          Transactions
        </h1>
        <p className="text-neutral-600 mt-1 text-sm">
          Every payment, refund, and payout
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Revenue"
          value={money(totalRevenue)}
          accent="text-green-600"
        />
        <SummaryCard
          label="This Month"
          value={money(thisMonth)}
          accent="text-green-600"
        />
        <SummaryCard
          label="Pending"
          value={money(pending)}
          accent="text-yellow-600"
        />
        <SummaryCard
          label="Refunded"
          value={money(refunded)}
          accent="text-orange-600"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by reference, order, customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </div>

        {/* Status filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(
            ["ALL", "COMPLETED", "PENDING", "FAILED", "REFUNDED"] as const
          ).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border ${
                statusFilter === s
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {s === "ALL" ? "All statuses" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Type filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["ALL", "SALE", "REFUND", "PAYOUT"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border ${
                typeFilter === t
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {t === "ALL" ? "All types" : typeLabel(t)}
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
            No transactions match your filters
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Try a different search or clear the filters.
          </p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="text-left text-[10px] text-neutral-500 uppercase tracking-wider border-b border-neutral-200 bg-neutral-50">
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">
                    Reference
                  </th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-right">Net</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn) => {
                  const isCredit = txn.amount > 0;
                  return (
                    <tr
                      key={txn.id}
                      className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isCredit
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeftIcon className="h-4 w-4" />
                            ) : (
                              <ArrowUpRightIcon className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-neutral-900 truncate max-w-[240px]">
                              {txn.description}
                            </p>
                            <p className="text-[10px] text-neutral-500">
                              {typeLabel(txn.type)}
                              {txn.customerName && ` · ${txn.customerName}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-neutral-500 hidden sm:table-cell">
                        {txn.reference}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500 hidden md:table-cell">
                        {formatDate(txn.createdAt)}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-medium text-right ${
                          isCredit ? "text-neutral-900" : "text-red-600"
                        }`}
                      >
                        {money(txn.amount)}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-semibold text-right ${
                          txn.netAmount >= 0 ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {money(txn.netAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusBadge(
                            txn.status
                          )}`}
                        >
                          {statusLabel(txn.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openModal(txn)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <EyeIcon className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <TransactionDetailModal
        transaction={selected}
        isOpen={modalOpen}
        onClose={closeModal}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5">
      <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
        {label}
      </p>
      <p className={`text-lg sm:text-xl font-bold mt-2 truncate ${accent}`}>
        {value}
      </p>
    </div>
  );
}