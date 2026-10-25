// app/dashboard/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  PhotoIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ProductFormModal } from "./ProductFormModal";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  category: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  lowStockThreshold: number | null;
  estimatedDeliveryDays: number | null;
  imageUrl: string | null;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;

  baseCommissionRate: number | null;
  categoryCommissionType: string | null;
  categoryCommissionRate: number | null;
}

interface PlanUsage {
  name: string | null;
  maxProducts: number | null; // null or 0 = unlimited
  usedProducts: number;
  canAddMore: boolean;
}

function imageSrc(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("blob:")) return url;

  const suppliersIdx = url.indexOf("/images/suppliers/");
  if (suppliersIdx !== -1) {
    return `/api/uploads/${url.substring(suppliersIdx + "/images/suppliers/".length)}`;
  }

  const uploadsProductsIdx = url.indexOf("/uploads/products/");
  if (uploadsProductsIdx !== -1) {
    return `/api/uploads/${url.substring(uploadsProductsIdx + "/uploads/products/".length)}`;
  }

  if (url.startsWith("/") && !url.startsWith("//")) {
    return `/api/uploads${url}`;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  return url;
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "—";
  return `£${Number(value).toFixed(2)}`;
}

function stockBadge(product: Product): string {
  if (product.stockQuantity <= 0) return "bg-red-100 text-red-700 border-red-200";
  const threshold = product.lowStockThreshold ?? 5;
  if (product.stockQuantity <= threshold)
    return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-green-100 text-green-700 border-green-200";
}

function stockLabel(product: Product): string {
  if (product.stockQuantity <= 0) return "Out of stock";
  const threshold = product.lowStockThreshold ?? 5;
  if (product.stockQuantity <= threshold)
    return `Low · ${product.stockQuantity}`;
  return `${product.stockQuantity} in stock`;
}

function deliveryLabel(product: Product): string | null {
  const days = product.estimatedDeliveryDays;
  if (days == null) return null;
  if (days <= 0) return "Ships same day";
  if (days === 1) return "Ships next day";
  return `Ships in ${days} days`;
}

function computeProductNet(product: Product): {
  gross: number;
  baseCommission: number;
  categoryCommission: number;
  totalCommission: number;
  net: number;
  isWig: boolean;
} {
  const gross = Number(product.price) || 0;
  const baseRate = Number(product.baseCommissionRate ?? 0);
  const categoryRate = Number(product.categoryCommissionRate ?? 0);

  const baseCommission = +(gross * baseRate).toFixed(2);
  const categoryCommission = +(gross * categoryRate).toFixed(2);
  const totalCommission = +(baseCommission + categoryCommission).toFixed(2);
  const net = +(gross - totalCommission).toFixed(2);

  return {
    gross,
    baseCommission,
    categoryCommission,
    totalCommission,
    net,
    isWig: product.categoryCommissionType === "WIG_SALE",
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [planUsage, setPlanUsage] = useState<PlanUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const load = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned non-JSON (${res.status})`);
      }
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load products");
      }
      setProducts(data.data || []);
      setPlanUsage(data.plan ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/auth/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));

        if (planUsage) {
          const used = Math.max(0, planUsage.usedProducts - 1);
          setPlanUsage({
            ...planUsage,
            usedProducts: used,
            canAddMore:
              planUsage.maxProducts == null ||
              planUsage.maxProducts === 0 ||
              used < planUsage.maxProducts,
          });
        }

        showAlert("success", "Product deleted");
      } else {
        showAlert("error", data.message || "Failed to delete");
      }
    } catch {
      showAlert("error", "Failed to delete");
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  };

  const openCreate = () => {
    if (!canCreate) return;
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setConfirmingId(null);
    setModalOpen(true);
  };

  const handleSaved = (saved: Product, isNew: boolean) => {
    setProducts((prev) =>
      isNew ? [saved, ...prev] : prev.map((p) => (p.id === saved.id ? saved : p))
    );

    if (isNew && planUsage) {
      const used = planUsage.usedProducts + 1;
      setPlanUsage({
        ...planUsage,
        usedProducts: used,
        canAddMore:
          planUsage.maxProducts == null ||
          planUsage.maxProducts === 0 ||
          used < planUsage.maxProducts,
      });
    }

    setModalOpen(false);
    setEditing(null);
    showAlert("success", isNew ? "Product created" : "Product updated");
  };

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.sku || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
  });

  const canCreate = planUsage?.canAddMore ?? true;
  const showUsageBanner =
    planUsage != null &&
    planUsage.maxProducts != null &&
    planUsage.maxProducts > 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Products
          </h1>
          <p className="text-neutral-600 mt-1 text-sm">
            Manage your product catalogue
          </p>
        </div>
        <button
          onClick={openCreate}
          disabled={!canCreate}
          title={!canCreate ? "You've reached your plan's product limit" : undefined}
          className="inline-flex items-center justify-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <PlusIcon className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Alert */}
      {alert && (
        <div
          role="status"
          className={`p-3 rounded-xl flex items-center gap-3 text-sm border ${
            alert.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
          ) : (
            <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="flex-1">{alert.message}</span>
          <button
            onClick={() => setAlert(null)}
            aria-label="Dismiss"
            className="text-current opacity-60 hover:opacity-100 transition-opacity"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Plan usage banner */}
      {showUsageBanner && (
        <div
          className={`rounded-xl border p-3 flex items-start gap-3 text-sm ${
            planUsage!.canAddMore
              ? "bg-neutral-50 border-neutral-200 text-neutral-700"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">
              {planUsage!.usedProducts} / {planUsage!.maxProducts} products used
              {planUsage!.name && (
                <span className="text-xs font-normal opacity-70 ml-2">
                  ({planUsage!.name} plan)
                </span>
              )}
            </p>
            {!planUsage!.canAddMore && (
              <p className="text-xs mt-0.5">
                You&apos;ve reached your plan limit. Upgrade your plan to add more
                products.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
        />
      </div>

      {/* Empty */}
      {!error && filtered.length === 0 && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <PhotoIcon className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900">
            {products.length === 0 ? "No products yet" : "No results"}
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            {products.length === 0
              ? "Add your first product to get started."
              : "Try a different search term."}
          </p>
          {products.length === 0 && (
            <button
              onClick={openCreate}
              disabled={!canCreate}
              title={!canCreate ? "You've reached your plan's product limit" : undefined}
              className="mt-4 inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4" />
              Add Product
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => {
            const src = imageSrc(product.imageUrl);
            const delivery = deliveryLabel(product);
            const isConfirming = confirmingId === product.id;
            const isDeleting = deletingId === product.id;
            const net = computeProductNet(product);

            return (
              <div
                key={product.id}
                className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                  isConfirming
                    ? "border-red-300 ring-2 ring-red-100"
                    : "border-neutral-200 hover:border-neutral-300 hover:shadow-sm"
                }`}
              >
                {/* Image */}
                <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center overflow-hidden">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PhotoIcon className="h-10 w-10 text-neutral-300" />
                  )}
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {product.sku && (
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {product.sku}
                        </span>
                      )}
                      {product.category && (
                        <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                          {product.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price + stock */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-neutral-900">
                      {formatCurrency(product.price)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${stockBadge(
                        product
                      )}`}
                    >
                      {stockLabel(product)}
                    </span>
                  </div>

                  {/* Delivery estimate */}
                  {delivery && (
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                      <TruckIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{delivery}</span>
                    </div>
                  )}

                  {/* You receive */}
                  <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-2.5 py-1.5 text-[11px]">
                    <span className="text-neutral-500">You receive</span>
                    <span className="font-semibold text-emerald-700">
                      {formatCurrency(net.net)}
                    </span>
                  </div>

                  {/* Actions — normal */}
                  {!isConfirming && (
                    <div className="flex gap-2 pt-2 border-t border-neutral-100">
                      <button
                        onClick={() => openEdit(product)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 px-2 py-1.5 rounded-lg transition-colors"
                      >
                        <PencilSquareIcon className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmingId(product.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  )}

                  {/* Actions — confirm delete */}
                  {isConfirming && (
                    <div className="pt-3 border-t border-red-100">
                      <p className="text-[11px] font-medium text-red-700 mb-2">
                        Delete this product?
                      </p>
                      <p className="text-[10px] text-red-600 mb-3">
                        This can&apos;t be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmingId(null)}
                          disabled={isDeleting}
                          className="flex-1 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={isDeleting}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <>
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              Deleting…
                            </>
                          ) : (
                            <>
                              <TrashIcon className="h-3.5 w-3.5" />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <ProductFormModal
          product={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}