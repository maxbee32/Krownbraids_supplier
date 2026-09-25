// lib/hooks/useSubscription.ts
"use client";

import { useEffect, useState } from "react";

export interface SubscriptionInfo {
  planName: string | null;
  billingCycle: string | null;
  status: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
}

interface UseSubscriptionResult {
  subscription: SubscriptionInfo | null;
  loading: boolean;
  error: string | null;
}

export function useSubscription(
  token: string | null
): UseSubscriptionResult {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/auth/onboarding/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            `Server returned non-JSON (status ${res.status})`
          );
        }

        if (!res.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load subscription"
          );
        }

        if (cancelled) return;

        setSubscription({
          planName: data.data?.planName ?? null,
          billingCycle: data.data?.billingCycle ?? null,
          status: data.data?.status ?? null,
          subscriptionStartDate:
            data.data?.subscriptionStartDate ?? null,
          subscriptionEndDate: data.data?.subscriptionEndDate ?? null,
        });
      } catch (err) {
        if (cancelled) return;
        console.error("Subscription load error:", err);
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { subscription, loading, error };
}