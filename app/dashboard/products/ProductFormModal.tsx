"use client";

import { useEffect, useRef, useState } from "react";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import type { Product } from "./page";

interface Props {
  product: Product | null;
  onClose: () => void;
  onSaved: (saved: Product, isNew: boolean) => void;
}

interface FormState {
  name: string;
  description: string;
  sku: string;
  category: string;
  price: string;
  compareAtPrice: string;
  stockQuantity: string;
  lowStockThreshold: string;
  status: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}

const EMPTY: FormState = {
  name: "",
  description: "",
  sku: "",
  category: "",
  price: "",
  compareAtPrice: "",
  stockQuantity: "0",
  lowStockThreshold: "5",
  status: "ACTIVE",
};

// Where the supplier service serves uploaded files from.
const SUPPLIER_SERVICE_PUBLIC_URL =
  process.env.NEXT_PUBLIC_SUPPLIER_SERVICE_URL ||
  "https://5836-82-36-98-104.ngrok-free.app/supservice";

function toAbsoluteImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
  )
    return url;
  return `${SUPPLIER_SERVICE_PUBLIC_URL}${url}`;
}

export function ProductFormModal({ product, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(() =>
    product
      ? {
          name: product.name || "",
          description: product.description || "",
          sku: product.sku || "",
          category: product.category || "",
          price: String(product.price ?? ""),
          compareAtPrice:
            product.compareAtPrice != null
              ? String(product.compareAtPrice)
              : "",
          stockQuantity: String(product.stockQuantity ?? 0),
          lowStockThreshold: String(product.lowStockThreshold ?? 5),
          status: product.status || "ACTIVE",
        }
      : EMPTY
  );

  // ─── Image upload state ───
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(() =>
    product?.imageUrl ? toAbsoluteImageUrl(product.imageUrl) : null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ─── Categories state ───
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNew = !product;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ─────────────────────────────────────────
  // LOAD CATEGORIES ON MOUNT
  // ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setCategoriesLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    load();
  }, []);

  // ─────────────────────────────────────────
  // IMAGE PICK / REMOVE
  // ─────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, WebP, or GIF).");
      return;
    }

    setError(null);
    setImageFile(file);
    setImageRemoved(false);

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageRemoved(true);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!form.price || Number(form.price) < 0) {
      setError("A valid price is required.");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      setError("Not authenticated.");
      return;
    }

    setSaving(true);
    try {
      // 1. Save product fields
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        sku: form.sku.trim() || null,
        category: form.category.trim() || null,
        price: Number(form.price),
        compareAtPrice:
          form.compareAtPrice && Number(form.compareAtPrice) > 0
            ? Number(form.compareAtPrice)
            : null,
        stockQuantity: Number(form.stockQuantity) || 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 5,
        status: form.status,
      };

      const url = isNew
        ? "/api/auth/products"
        : `/api/auth/products/${product.id}`;

      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server error (${res.status})`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save");
      }

      let saved: Product = data.data;

      // 2a. Remove image if user cleared it
      if (imageRemoved && product?.imageUrl) {
        const delRes = await fetch(`/api/auth/products/${saved.id}/image`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const delText = await delRes.text();
        let delData;
        try {
          delData = JSON.parse(delText);
        } catch {
          throw new Error(`Image removal failed (${delRes.status})`);
        }
        if (!delRes.ok || !delData.success) {
          throw new Error(delData.message || "Failed to remove image");
        }
        saved = delData.data;
      }

      // 2b. Upload new image
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);

        const imgRes = await fetch(`/api/auth/products/${saved.id}/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });

        const imgText = await imgRes.text();
        let imgData;
        try {
          imgData = JSON.parse(imgText);
        } catch {
          throw new Error(`Image upload failed (${imgRes.status})`);
        }

        if (!imgRes.ok || !imgData.success) {
          throw new Error(imgData.message || "Failed to upload image");
        }

        saved = imgData.data;
      }

      onSaved(saved, isNew);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <h2 className="text-lg font-bold text-neutral-900">
              {isNew ? "Add Product" : "Edit Product"}
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-900 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
          >
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Image */}
            <Field label="Product Image">
              <div className="flex items-start gap-3">
                <div className="w-24 h-24 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PhotoIcon className="h-8 w-8 text-neutral-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 bg-white border border-neutral-200 text-neutral-700 px-3 py-2 rounded-xl text-xs font-medium hover:bg-neutral-100 cursor-pointer transition-colors">
                      <PhotoIcon className="h-3.5 w-3.5" />
                      {imagePreview ? "Change image" : "Choose image"}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-neutral-500 leading-relaxed">
                    JPEG, PNG, WebP, or GIF · Max 5 MB
                    {imageFile && (
                      <>
                        {" · "}
                        <span className="text-neutral-700 font-medium">
                          {imageFile.name}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </Field>

            <Field label="Name *">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Premium Braiding Hair — 24 inch"
                className="input"
                required
              />
            </Field>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={3}
                placeholder="Product details, materials, colours…"
                className="input resize-none"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="SKU">
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setField("sku", e.target.value)}
                  placeholder="BRAID-24-BLK"
                  className="input"
                />
              </Field>
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                  className="input"
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading…"
                      : categories.length === 0
                      ? "No categories available"
                      : "Select a category"}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (£) *">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  placeholder="0.00"
                  className="input"
                  required
                />
              </Field>
              <Field label="Compare at (£)">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.compareAtPrice}
                  onChange={(e) => setField("compareAtPrice", e.target.value)}
                  placeholder="Optional"
                  className="input"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Stock">
                <input
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(e) => setField("stockQuantity", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Low Stock Alert">
                <input
                  type="number"
                  min="0"
                  value={form.lowStockThreshold}
                  onChange={(e) =>
                    setField("lowStockThreshold", e.target.value)
                  }
                  className="input"
                />
              </Field>
            </div>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                className="input"
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </Field>
          </form>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : isNew ? "Create" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e5e5e5;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          color: #171717;
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus {
          border-color: #171717;
          box-shadow: 0 0 0 3px rgba(23, 23, 23, 0.1);
        }
        .input::placeholder {
          color: #a3a3a3;
        }
        .input:disabled {
          background: #fafafa;
          color: #a3a3a3;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}