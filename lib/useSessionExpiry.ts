// lib/useSessionExpiry.ts
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getTokenExpiry } from "./jwt";

interface SessionState {
  expiresAt: number | null;
  msRemaining: number;
  showWarning: boolean;
}

const WARNING_THRESHOLD_MS = 2 * 60 * 1000;

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

// Routes where the session hook must NEVER run.
// These are public — a redirect loop here is impossible by definition.
const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
  "/verify-email",
  "/pending-approval",
];

export function useSessionExpiry() {
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix)
  );

  const [state, setState] = useState<SessionState>({
    expiresAt: null,
    msRemaining: 0,
    showWarning: false,
  });

  const redirectingRef = useRef(false);

  const kickOut = useCallback(
    (reason: "expired" | "missing") => {
      if (redirectingRef.current) return;
      if (isPublicRoute) return;
      redirectingRef.current = true;
      clearSession();
      router.replace(`/login?reason=${reason}`);
    },
    [router, isPublicRoute]
  );

  const refresh = useCallback(() => {
    if (isPublicRoute) return;

    const token = localStorage.getItem("adminToken");
    if (!token) {
      setState({ expiresAt: null, msRemaining: 0, showWarning: false });
      return;
    }

    const expiry = getTokenExpiry(token);
    if (!expiry) {
      setState({ expiresAt: null, msRemaining: 0, showWarning: false });
      return;
    }

    const msRemaining = expiry - Date.now();
    setState({
      expiresAt: expiry,
      msRemaining,
      showWarning: msRemaining <= WARNING_THRESHOLD_MS && msRemaining > 0,
    });
  }, [isPublicRoute]);

  useEffect(() => {
    if (isPublicRoute) return;
    refresh();
  }, [refresh, isPublicRoute]);

  useEffect(() => {
    if (isPublicRoute) return;
    if (redirectingRef.current) return;

    const tick = () => {
      if (redirectingRef.current) return;

      const token = localStorage.getItem("adminToken");

      if (!token) {
        kickOut("missing");
        return;
      }

      const expiry = getTokenExpiry(token);

      if (!expiry) {
        kickOut("expired");
        return;
      }

      const msRemaining = expiry - Date.now();

      if (msRemaining <= 0) {
        kickOut("expired");
        return;
      }

      setState({
        expiresAt: expiry,
        msRemaining,
        showWarning: msRemaining <= WARNING_THRESHOLD_MS,
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [kickOut, isPublicRoute]);

  // Multi-tab sign-out
  useEffect(() => {
    if (isPublicRoute) return;

    const onStorage = (e: StorageEvent) => {
      if (e.key === "adminToken" && !e.newValue) {
        kickOut("missing");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [kickOut, isPublicRoute]);

  // On public routes, return a neutral state — no side effects
  if (isPublicRoute) {
    return {
      expiresAt: null,
      msRemaining: 0,
      showWarning: false,
      refresh: () => {},
    };
  }

  return { ...state, refresh };
}