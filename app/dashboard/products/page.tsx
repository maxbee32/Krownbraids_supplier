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
  imageUrl: string | null;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
}

const SUPPLIER_SERVICE_PUBLIC_URL =
  process.env.NEXT_PUBLIC_SUPPLIER_SERVICE_URL ||
  "https://5836-82-36-98-104.ngrok-free.app/supservice";

function imageSrc(url: string | null): string | null {
  if (!url) return null;
  // Blob URLs (local previews) — leave alone
  if (url.startsWith("blob:")) return url;
  // Absolute URLs (external CDNs, etc.) — leave alone
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Local uploads: /uploads/... → proxy through Next.js
  if (url.startsWith("/uploads/")) return `/api${url}`;
  // Fallback — treat as a Next.js relative path
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
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
    if (!confirm("Delete this product? This cannot be undone.")) return;
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
        showAlert("success", "Product deleted");
      } else {
        showAlert("error", data.message || "Failed to delete");
      }
    } catch {
      showAlert("error", "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setModalOpen(true);
  };

  const handleSaved = (saved: Product, isNew: boolean) => {
    setProducts((prev) =>
      isNew ? [saved, ...prev] : prev.map((p) => (p.id === saved.id ? saved : p))
    );
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
          className="inline-flex items-center justify-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Alert */}
      {alert && (
        <div
          className={`p-3 rounded-xl flex items-center gap-3 text-sm border ${
            alert.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          <span className="flex-1">{alert.message}</span>
          <button onClick={() => setAlert(null)}>
            <XMarkIcon className="h-4 w-4" />
          </button>
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
              className="mt-4 inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
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
            return (
              <div
                key={product.id}
                className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-sm transition-all"
              >
                {/* Image */}
                <div className="aspect-video bg-neutral-100 flex items-center justify-center overflow-hidden">
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

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-neutral-100">
                    <button
                      onClick={() => openEdit(product)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      <PencilSquareIcon className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      {deletingId === product.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
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