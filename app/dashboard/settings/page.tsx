// app/dashboard/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  Bell,
  Clock,
  LogOut,
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  Monitor,
  Download,
  Trash2,
  Mail,
  Loader2,
} from "lucide-react";

interface StoredSupplier {
  fullName?: string;
  email?: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationPrefs {
  orderAlerts: boolean;
  payoutAlerts: boolean;
  productAlerts: boolean;
  subscriptionAlerts: boolean;
  marketingEmails: boolean;
}

const DEFAULT_NOTIFS: NotificationPrefs = {
  orderAlerts: true,
  payoutAlerts: true,
  productAlerts: true,
  subscriptionAlerts: true,
  marketingEmails: false,
};

const NOTIF_STORAGE_KEY = "supplier_notification_prefs";

function validatePassword(pw: string): string[] {
  const errors: string[] = [];
  if (pw.length < 8) errors.push("at least 8 characters");
  if (!/[A-Z]/.test(pw)) errors.push("one uppercase letter");
  if (!/[a-z]/.test(pw)) errors.push("one lowercase letter");
  if (!/[0-9]/.test(pw)) errors.push("one number");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw))
    errors.push("one special character");
  return errors;
}

function passwordStrength(pw: string): {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
} {
  if (!pw) return { level: 0, label: "", color: "" };
  const checks = [
    pw.length >= 8,
    /[A-Z]/.test(pw),
    /[a-z]/.test(pw),
    /[0-9]/.test(pw),
    /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  ];
  const score = checks.filter(Boolean).length;

  if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-500" };
  if (score === 2) return { level: 2, label: "Fair", color: "bg-orange-500" };
  if (score === 3) return { level: 3, label: "Good", color: "bg-yellow-500" };
  if (score === 4) return { level: 4, label: "Strong", color: "bg-green-500" };
  return { level: 4, label: "Very Strong", color: "bg-green-600" };
}

export default function SettingsPage() {
  const router = useRouter();

  const [supplier, setSupplier] = useState<StoredSupplier | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Password state
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Notification prefs
  const [notifs, setNotifs] = useState<NotificationPrefs>(DEFAULT_NOTIFS);

  // Danger zone
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deactivateConfirmText, setDeactivateConfirmText] = useState("");
  const [deactivating, setDeactivating] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // ─── Load stored data ───
  useEffect(() => {
    try {
      const s = localStorage.getItem("supplierData");
      if (s) setSupplier(JSON.parse(s));
    } catch {
      // ignore
    }
    try {
      const n = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (n) setNotifs({ ...DEFAULT_NOTIFS, ...JSON.parse(n) });
    } catch {
      // ignore
    }
  }, []);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4500);
  };

  // ─── Password change ───
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      showAlert("error", "Please enter your current password.");
      return;
    }

    const errors = validatePassword(passwordForm.newPassword);
    if (errors.length > 0) {
      showAlert("error", `Password must contain: ${errors.join(", ")}`);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert("error", "New passwords do not match.");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      showAlert("error", "Not authenticated.");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server error (${res.status})`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to change password");
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showAlert("success", "Password changed successfully.");
    } catch (err) {
      showAlert(
        "error",
        err instanceof Error ? err.message : "Failed to change password"
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  // ─── Notification toggle ───
  const toggleNotif = (key: keyof NotificationPrefs) => {
    setNotifs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // ─── Logout ───
  const handleLogout = () => {
    [
      "adminToken",
      "adminData",
      "userId",
      "userRole",
      "supplierData",
      "checkoutId",
    ].forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
    router.replace("/login?reason=signed-out");
  };

  // ─── Deactivate ───
  const handleDeactivate = async () => {
    if (deactivateConfirmText !== "DEACTIVATE") return;

    const token = localStorage.getItem("adminToken");
    if (!token) {
      showAlert("error", "Not authenticated.");
      return;
    }

    setDeactivating(true);
    try {
      const res = await fetch("/api/auth/deactivate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server error (${res.status})`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to deactivate account");
      }

      showAlert(
        "success",
        "Your account has been deactivated. You'll be signed out shortly."
      );
      setTimeout(handleLogout, 1500);
    } catch (err) {
      showAlert(
        "error",
        err instanceof Error ? err.message : "Failed to deactivate account"
      );
      setDeactivating(false);
    }
  };

  const pwStrength = passwordStrength(passwordForm.newPassword);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          Settings
        </h1>
        <p className="text-neutral-600 mt-1 text-sm">
          Manage your account security and notifications
        </p>
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
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="flex-1">{alert.message}</span>
          <button
            onClick={() => setAlert(null)}
            aria-label="Dismiss"
            className="opacity-60 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Account summary */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-neutral-900 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">
            {supplier?.fullName?.charAt(0)?.toUpperCase() || "S"}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-900 truncate">
            {supplier?.fullName || "Supplier"}
          </p>
          <p className="text-xs text-neutral-500 truncate">
            {supplier?.email || "—"}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[10px] font-medium text-green-700 flex-shrink-0">
          <CheckCircle className="h-3 w-3" />
          Verified
        </div>
      </div>

      {/* Password */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <KeyRound className="h-4 w-4 text-neutral-500" />
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Password
          </h2>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Field label="Current password">
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter current password"
                  className="w-full bg-white border border-neutral-200 rounded-xl pl-3 pr-11 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((s) => ({
                      ...s,
                      current: !s.current,
                    }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  tabIndex={-1}
                  aria-label={
                    showPasswords.current ? "Hide password" : "Show password"
                  }
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>

            <Field label="New password">
              <div className="relative">
                <input
                  type={showPasswords.next ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter new password"
                  className="w-full bg-white border border-neutral-200 rounded-xl pl-3 pr-11 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((s) => ({ ...s, next: !s.next }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  tabIndex={-1}
                  aria-label={
                    showPasswords.next ? "Hide password" : "Show password"
                  }
                >
                  {showPasswords.next ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordForm.newPassword && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${pwStrength.color}`}
                      style={{ width: `${(pwStrength.level / 4) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
                    {pwStrength.label}
                  </span>
                </div>
              )}
            </Field>

            <Field label="Confirm new password">
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Re-enter new password"
                  className="w-full bg-white border border-neutral-200 rounded-xl pl-3 pr-11 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((s) => ({
                      ...s,
                      confirm: !s.confirm,
                    }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  tabIndex={-1}
                  aria-label={
                    showPasswords.confirm ? "Hide password" : "Show password"
                  }
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSaving}
                className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Two-factor authentication */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-neutral-500" />
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Security
          </h2>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl divide-y divide-neutral-100">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900">
                Two-factor authentication
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Add an extra layer of security to your account
              </p>
            </div>
            <span className="flex-shrink-0 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[10px] font-medium text-neutral-600">
              Coming soon
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900">
                Active sessions
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Manage devices currently signed in to your account
              </p>
            </div>
            <button
              onClick={() => showAlert("success", "Session management coming soon.")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 flex-shrink-0"
            >
              <Monitor className="h-3.5 w-3.5" />
              View
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900">
                Login history
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                See recent logins with device and location
              </p>
            </div>
            <button
              onClick={() => showAlert("success", "Login history coming soon.")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 flex-shrink-0"
            >
              <Clock className="h-3.5 w-3.5" />
              View
            </button>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-4 w-4 text-neutral-500" />
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Notifications
          </h2>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl divide-y divide-neutral-100">
          <Toggle
            label="Order alerts"
            description="New orders, cancellations, and customer messages"
            checked={notifs.orderAlerts}
            onChange={() => toggleNotif("orderAlerts")}
          />
          <Toggle
            label="Payout alerts"
            description="When funds are released or paid out to your bank"
            checked={notifs.payoutAlerts}
            onChange={() => toggleNotif("payoutAlerts")}
          />
          <Toggle
            label="Product alerts"
            description="Low stock warnings and product approval updates"
            checked={notifs.productAlerts}
            onChange={() => toggleNotif("productAlerts")}
          />
          <Toggle
            label="Subscription reminders"
            description="Renewal reminders and payment confirmations"
            checked={notifs.subscriptionAlerts}
            onChange={() => toggleNotif("subscriptionAlerts")}
          />
          <Toggle
            label="Marketing emails"
            description="Product tips, platform updates, and offers"
            checked={notifs.marketingEmails}
            onChange={() => toggleNotif("marketingEmails")}
          />
        </div>
      </section>

      {/* Data & privacy */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Download className="h-4 w-4 text-neutral-500" />
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Data & Privacy
          </h2>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl divide-y divide-neutral-100">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900">
                Export your data
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Download a copy of your products, orders, and account details
              </p>
            </div>
            <button
              onClick={() =>
                showAlert(
                  "success",
                  "We'll email you a download link within 24 hours."
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex-shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              Request
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900">
                Privacy policy
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Read how we handle your data
              </p>
            </div>
            <a
              href="/privacy"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 flex-shrink-0"
            >
              <Mail className="h-3.5 w-3.5" />
              Open
            </a>
          </div>
        </div>
      </section>

      {/* Session */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <LogOut className="h-4 w-4 text-neutral-500" />
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Session
          </h2>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-900">
                Sign out
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                You&apos;ll be returned to the login page.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-neutral-100 transition-colors flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <h2 className="text-xs font-semibold text-red-600 uppercase tracking-wider">
            Danger Zone
          </h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl divide-y divide-red-100">
          {/* Deactivate */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-red-900">
                  Deactivate account
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Your products and orders will be hidden from the marketplace.
                  Contact support to reactivate later. Your data is kept
                  indefinitely while deactivated.
                </p>
              </div>
              <button
                onClick={() => setDeactivateModalOpen(true)}
                className="inline-flex items-center gap-2 bg-white border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors flex-shrink-0"
              >
                Deactivate
              </button>
            </div>
          </div>

          {/* Delete */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-red-900">
                  Delete account permanently
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Permanently delete your account and all associated data
                  (products, orders, profile). This cannot be undone. Existing
                  orders are retained for legal/tax requirements.
                </p>
              </div>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Deactivate modal */}
      {deactivateModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => {
              setDeactivateModalOpen(false);
              setDeactivateConfirmText("");
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-red-100 bg-red-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-red-900">
                      Deactivate account?
                    </h3>
                    <p className="text-xs text-red-700 mt-0.5">
                      This can be reversed by contacting support.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <p className="text-sm text-neutral-700 mb-3">
                  Type{" "}
                  <span className="font-mono font-semibold text-red-600">
                    DEACTIVATE
                  </span>{" "}
                  to confirm.
                </p>
                <input
                  type="text"
                  value={deactivateConfirmText}
                  onChange={(e) => setDeactivateConfirmText(e.target.value)}
                  placeholder="DEACTIVATE"
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  autoFocus
                />
              </div>

              <div className="p-5 border-t border-neutral-200 flex gap-3">
                <button
                  onClick={() => {
                    setDeactivateModalOpen(false);
                    setDeactivateConfirmText("");
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  disabled={
                    deactivateConfirmText !== "DEACTIVATE" || deactivating
                  }
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deactivating ? "Deactivating…" : "Deactivate"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete modal */}
      {deleteModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => {
              setDeleteModalOpen(false);
              setDeleteConfirmText("");
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-red-100 bg-red-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-red-900">
                      Delete account permanently?
                    </h3>
                    <p className="text-xs text-red-700 mt-0.5">
                      This cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <p className="text-sm text-neutral-700">
                  This will permanently delete:
                </p>
                <ul className="text-xs text-neutral-600 space-y-1 pl-4 list-disc">
                  <li>Your supplier profile and business details</li>
                  <li>All products and their images</li>
                  <li>Your subscription record</li>
                </ul>
                <p className="text-xs text-neutral-500">
                  Existing orders are retained for tax and legal record-keeping.
                </p>
                <p className="text-sm text-neutral-700 pt-2">
                  Type{" "}
                  <span className="font-mono font-semibold text-red-600">
                    DELETE
                  </span>{" "}
                  to confirm.
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  autoFocus
                />
              </div>

              <div className="p-5 border-t border-neutral-200 flex gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeleteConfirmText("");
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    showAlert(
                      "error",
                      "Account deletion requires confirmation from support. We've sent your request."
                    );
                    setDeleteModalOpen(false);
                    setDeleteConfirmText("");
                  }}
                  disabled={deleteConfirmText !== "DELETE"}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Reusable ───

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] text-neutral-500 uppercase tracking-wider font-medium mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-neutral-50 transition-colors">
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
          checked ? "bg-neutral-900" : "bg-neutral-200"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform my-0.5 ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}