"use client";

import { useEffect, useState } from "react";

export interface RevenueSummary {
  totalRevenue: number;
  thisMonthRevenue: number;
  pendingRevenue: number;
  currency: string;
  totalTransactions: number;
}

export function useRevenue(token: string | null) {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setSummary(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/auth/transactions/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Non-JSON (${res.status})`);
        }
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load revenue");
        }
        if (!cancelled) setSummary(data.data);
      } catch (err) {
        if (!cancelled) {
          console.error("Revenue load error:", err);
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return { summary, loading, error };
}