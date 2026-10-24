// components/auth/SessionExpiryWarning.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface SessionExpiryWarningProps {
  msRemaining: number;
  expiresAt: number | null;
}

const SESSION_KEYS = [
  "adminToken",
  "adminData",
  "userId",
  "userRole",
  "supplierData",
  "checkoutId",
] as const;

function clearSession() {
  SESSION_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
}

export function SessionExpiryWarning({
  msRemaining,
  expiresAt,
}: SessionExpiryWarningProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seconds = Math.max(0, Math.floor(msRemaining / 1000));

  const handleSignOut = () => {
    clearSession();
    router.replace("/login?reason=signed-out");
  };

  const handleStay = async () => {
    setError(null);
    setIsRefreshing(true);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        // No token to refresh — kick out
        clearSession();
        router.replace("/login?reason=expired");
        return;
      }

      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        // Refresh failed — token is no longer renewable
        // (e.g., refresh window closed, backend revoked, etc.)
        if (res.status === 401) {
          clearSession();
          router.replace("/login?reason=expired");
          return;
        }
        throw new Error(data.message || "Could not refresh your session.");
      }

      // Backend returns the new token — accept several field names
      // so it works regardless of your response shape
      const newToken =
        data.token ?? data.accessToken ?? data.data?.token ?? data.data?.accessToken;

      if (!newToken) {
        throw new Error("Refresh succeeded but no token returned.");
      }

      // Write the new token to storage.
      // The useSessionExpiry hook will pick it up on the next tick (within 1s)
      // and update the warning banner accordingly.
      localStorage.setItem("adminToken", newToken);

      // If the backend returns additional user info on refresh, update it too
      const newUserId = data.userId ?? data.data?.userId;
      if (newUserId) {
        localStorage.setItem("userId", String(newUserId));
      }

      // Optional: force a re-render of the expiry hook by triggering
      // a page reload. Without this, the banner may show a stale
      // countdown for up to 1 second until the next interval tick.
      // A reload is safer because it also picks up any new data the
      // backend returns. But it's a flash — skip if you want seamless.
      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not refresh your session."
      );
      setIsRefreshing(false);
    }
  };

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border border-amber-300 bg-amber-50 p-4 shadow-lg"
    >
      <p className="text-sm font-medium text-amber-900">
        Your session expires in {seconds}s
      </p>
      <p className="mt-0.5 text-xs text-amber-700">
        Sign out now to save your work, or stay signed in for a new session.
      </p>

      {error && (
        <p className="mt-2 text-xs text-red-700">{error}</p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleSignOut}
          disabled={isRefreshing}
          className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50"
        >
          Sign out
        </button>
        {expiresAt && (
          <button
            onClick={handleStay}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Refreshing…
              </>
            ) : (
              "Stay signed in"
            )}
          </button>
        )}
      </div>
    </div>
  );
}