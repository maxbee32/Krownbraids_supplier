// app/dashboard/profile/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  ShieldCheck,
  CreditCard,
  CheckCircle,
  Clock,
  Pencil,
  X,
  Save,
  AlertCircle,
  KeyRound,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

interface BusinessProfile {
  id: string;
  companyName: string | null;
  companyType: string | null;
  description: string | null;
  email: string | null;
  phoneNumber: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  registrationNumber: string | null;
  taxId: string | null;
  planName: string | null;
  billingCycle: string | null;
  status: string | null;
  onboardingCompleted: boolean;
  subscriptionStartDate?: string | null;
  subscriptionEndDate?: string | null;
}

interface StoredSupplier {
  fullName?: string;
  email?: string;
}

interface FormState {
  companyName: string;
  companyType: string;
  description: string;
  email: string;
  phoneNumber: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  registrationNumber: string;
  taxId: string;
}

function buildFormState(profile: BusinessProfile): FormState {
  return {
    companyName: profile.companyName ?? "",
    companyType: profile.companyType ?? "",
    description: profile.description ?? "",
    email: profile.email ?? "",
    phoneNumber: profile.phoneNumber ?? "",
    website: profile.website ?? "",
    address: profile.address ?? "",
    city: profile.city ?? "",
    state: profile.state ?? "",
    country: profile.country ?? "United Kingdom",
    postalCode: profile.postalCode ?? "",
    registrationNumber: profile.registrationNumber ?? "",
    taxId: profile.taxId ?? "",
  };
}

function daysRemaining(endDate: string | null | undefined): number | null {
  if (!endDate) return null;
  const end = new Date(endDate).getTime();
  if (Number.isNaN(end)) return null;
  return Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [supplier, setSupplier] = useState<StoredSupplier | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [initialForm, setInitialForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        const stored = localStorage.getItem("supplierData");
        if (stored) setSupplier(JSON.parse(stored));
      } catch {
        // ignore
      }

      try {
        const res = await fetch("/api/auth/onboarding/me", {
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
          throw new Error(data.message || "Failed to load profile");
        }
        setProfile(data.data);
        const fs = buildFormState(data.data);
        setForm(fs);
        setInitialForm(fs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const isDirty = useMemo(() => {
    if (!form || !initialForm) return false;
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    // Clear field error when user starts typing
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setFieldErrors({});
  };

  const handleCancel = () => {
    if (isDirty) {
      const ok = window.confirm(
        "You have unsaved changes. Discard them?"
      );
      if (!ok) return;
    }
    if (initialForm) setForm(initialForm);
    setEditing(false);
    setFieldErrors({});
  };

  const validate = (f: FormState): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!f.companyName.trim()) {
      errors.companyName = "Company name is required";
    }
    if (!f.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(f.email)) {
      errors.email = "Enter a valid email address";
    }
    if (f.website && !/^https?:\/\//i.test(f.website)) {
      errors.website = "Website must start with http:// or https://";
    }

    return errors;
  };

  const handleSave = async () => {
    if (!form) return;

    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showAlert("error", "Please fix the highlighted fields");
      return;
    }

    if (!isDirty) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        showAlert("error", "Not authenticated");
        return;
      }

      const res = await fetch("/api/auth/onboarding/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          companyType: form.companyType,
          description: form.description.trim(),
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim(),
          website: form.website.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          country: form.country,
          postalCode: form.postalCode.trim(),
          registrationNumber: form.registrationNumber.trim(),
          taxId: form.taxId.trim(),
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned non-JSON (${res.status})`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save profile");
      }

      setProfile(data.data);
      const fs = buildFormState(data.data);
      setForm(fs);
      setInitialForm(fs);
      setEditing(false);
      setFieldErrors({});
      showAlert("success", "Profile updated successfully");
    } catch (err) {
      showAlert("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!profile || !form) return null;

  const days = daysRemaining(profile.subscriptionEndDate);
  const isExpired = days !== null && days <= 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Business Profile
          </h1>
          <p className="text-neutral-600 mt-1 text-sm">
            {editing
              ? "Edit your business information"
              : "Your registered business information"}
          </p>
        </div>
        {!editing ? (
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors flex-shrink-0"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-white border border-neutral-200 text-neutral-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-100 transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
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
          {alert.type === "success" ? (
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="flex-1">{alert.message}</span>
          <button
            onClick={() => setAlert(null)}
            className="text-current opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Company */}
      <Section title="Company" icon={<Building2 className="h-4 w-4" />}>
        <Field label="Company name" required error={fieldErrors.companyName}>
          {editing ? (
            <Input
              value={form.companyName}
              onChange={(v) => setField("companyName", v)}
              placeholder="Your business name"
              hasError={!!fieldErrors.companyName}
            />
          ) : (
            <ReadOnly value={profile.companyName} />
          )}
        </Field>

        <Field label="Company type">
          {editing ? (
            <Select
              value={form.companyType}
              onChange={(v) => setField("companyType", v)}
              options={[
                { value: "", label: "Select a type" },
                { value: "Wholesaler", label: "Wholesaler" },
                { value: "Distributor", label: "Distributor" },
                { value: "Retailer", label: "Retailer" },
                { value: "Manufacturer", label: "Manufacturer" },
                { value: "Other", label: "Other" },
              ]}
            />
          ) : (
            <ReadOnly value={profile.companyType} />
          )}
        </Field>

        <Field label="Description">
          {editing ? (
            <Textarea
              value={form.description}
              onChange={(v) => setField("description", v)}
              placeholder="What does your business do?"
              rows={3}
            />
          ) : (
            <ReadOnly value={profile.description} multiline />
          )}
        </Field>
      </Section>

      {/* Contact */}
      <Section title="Contact" icon={<Mail className="h-4 w-4" />}>
        <Field label="Email" icon={<Mail className="h-3.5 w-3.5" />} required error={fieldErrors.email}>
          {editing ? (
            <Input
              type="email"
              value={form.email}
              onChange={(v) => setField("email", v)}
              placeholder="business@example.com"
              hasError={!!fieldErrors.email}
            />
          ) : (
            <ReadOnly value={profile.email} />
          )}
        </Field>

        <Field label="Phone" icon={<Phone className="h-3.5 w-3.5" />}>
          {editing ? (
            <Input
              type="tel"
              value={form.phoneNumber}
              onChange={(v) => setField("phoneNumber", v)}
              placeholder="+44 20 1234 5678"
            />
          ) : (
            <ReadOnly value={profile.phoneNumber} />
          )}
        </Field>

        <Field label="Website" icon={<Globe className="h-3.5 w-3.5" />} error={fieldErrors.website}>
          {editing ? (
            <Input
              type="url"
              value={form.website}
              onChange={(v) => setField("website", v)}
              placeholder="https://yourbusiness.com"
              hasError={!!fieldErrors.website}
            />
          ) : profile.website ? (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all inline-flex items-center gap-1"
            >
              {profile.website}
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          ) : (
            <ReadOnly value={null} />
          )}
        </Field>
      </Section>

      {/* Address */}
      <Section title="Address" icon={<MapPin className="h-4 w-4" />}>
        <Field label="Street address">
          {editing ? (
            <Input
              value={form.address}
              onChange={(v) => setField("address", v)}
              placeholder="123 High Street"
            />
          ) : (
            <ReadOnly value={profile.address} />
          )}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            {editing ? (
              <Input
                value={form.city}
                onChange={(v) => setField("city", v)}
                placeholder="London"
              />
            ) : (
              <ReadOnly value={profile.city} />
            )}
          </Field>
          <Field label="State / Region">
            {editing ? (
              <Input
                value={form.state}
                onChange={(v) => setField("state", v)}
                placeholder="Optional"
              />
            ) : (
              <ReadOnly value={profile.state} />
            )}
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Postal code">
            {editing ? (
              <Input
                value={form.postalCode}
                onChange={(v) => setField("postalCode", v)}
                placeholder="SW1A 1AA"
              />
            ) : (
              <ReadOnly value={profile.postalCode} />
            )}
          </Field>
          <Field label="Country">
            {editing ? (
              <Input
                value={form.country}
                onChange={(v) => setField("country", v)}
                placeholder="United Kingdom"
              />
            ) : (
              <ReadOnly value={profile.country} />
            )}
          </Field>
        </div>
      </Section>

      {/* Legal */}
      <Section title="Legal" icon={<FileText className="h-4 w-4" />}>
        <Field label="Registration number">
          {editing ? (
            <Input
              value={form.registrationNumber}
              onChange={(v) => setField("registrationNumber", v)}
              placeholder="Company registration number"
            />
          ) : (
            <ReadOnly value={profile.registrationNumber} mono />
          )}
        </Field>

        <Field label="Tax ID">
          {editing ? (
            <Input
              value={form.taxId}
              onChange={(v) => setField("taxId", v)}
              placeholder="VAT / Tax ID"
            />
          ) : (
            <ReadOnly value={profile.taxId} mono />
          )}
        </Field>
      </Section>

      {/* Account */}
      <Section title="Account" icon={<ShieldCheck className="h-4 w-4" />}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium mb-1">
              Contact name
            </p>
            <p className="text-neutral-900">{supplier?.fullName || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium mb-1">
              Login email
            </p>
            <p className="text-neutral-900 truncate">
              {supplier?.email || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-neutral-700">
            {profile.onboardingCompleted
              ? "Onboarding complete"
              : "Onboarding in progress"}
          </span>
        </div>

        <Link
          href="/dashboard/settings/password"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-900 font-medium hover:underline"
        >
          <KeyRound className="h-3.5 w-3.5" />
          Change password →
        </Link>
      </Section>

      {/* Subscription */}
      <Section title="Subscription" icon={<CreditCard className="h-4 w-4" />}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium mb-1">
              Plan
            </p>
            <p className="text-neutral-900 font-medium">
              {profile.planName || "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium mb-1">
              Billing
            </p>
            <p className="text-neutral-900 capitalize">
              {profile.billingCycle || "—"}
            </p>
          </div>
        </div>

        {isExpired && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Subscription expired</p>
              <p className="text-xs text-red-700 mt-0.5">
                Renew your plan to keep your products listed and continue receiving orders.
              </p>
            </div>
          </div>
        )}

        {!isExpired && days !== null && days <= 7 && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Ending in {days} day{days === 1 ? "" : "s"}</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Renew soon to avoid interruption to your sales.
              </p>
            </div>
          </div>
        )}

        <Link
          href="/dashboard/subscription"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-900 font-medium hover:underline"
        >
          <Clock className="h-3.5 w-3.5" />
          View subscription details →
        </Link>
      </Section>

      {/* Danger zone */}
      <Section title="Danger zone" icon={<AlertTriangle className="h-4 w-4 text-red-500" />}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-neutral-900">
              Deactivate your account
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Your products will be hidden from the marketplace. Your data is kept
              for 30 days in case you change your mind.
            </p>
          </div>
          <Link
            href="/contact?subject=deactivate-account"
            className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 flex-shrink-0"
          >
            Contact support
          </Link>
        </div>
      </Section>
    </div>
  );
}

// ─── Reusable components ───

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-neutral-500">{icon}</span>
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          {title}
        </h2>
      </div>
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  required,
  error,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon && <span className="text-neutral-400">{icon}</span>}
        <label className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      </div>
      {children}
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function ReadOnly({
  value,
  mono,
  multiline,
}: {
  value: string | null | undefined;
  mono?: boolean;
  multiline?: boolean;
}) {
  if (!value) {
    return <p className="text-sm text-neutral-400 italic">Not provided</p>;
  }
  return (
    <p
      className={`text-sm text-neutral-900 ${
        mono ? "font-mono text-xs break-all" : ""
      } ${multiline ? "whitespace-pre-wrap leading-relaxed" : ""}`}
    >
      {value}
    </p>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hasError?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-white border rounded-xl px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition-colors ${
        hasError
          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
          : "border-neutral-200 focus:ring-neutral-900 focus:border-neutral-900"
      }`}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 resize-none transition-colors"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}