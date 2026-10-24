// app/rejected/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "../components/ui/Logo";
import {
  XCircle,
  AlertCircle,
  Mail,
  ArrowLeft,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

interface BusinessStatus {
  status: string;
  companyName?: string;
  planName?: string;
  rejectionReason?: string;
  updatedAt?: string;
}

export default function RejectedPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          router.replace("/login?reason=missing");
          return;
        }

        const res = await fetch("/api/auth/onboarding/status", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load account status");
          setIsLoading(false);
          return;
        }

        // No business row → not actually rejected, go to onboarding
        if (data?.data == null) {
          router.replace("/onboarding");
          return;
        }

        const status = data.data?.status as string | undefined;
        const businessData = data.data as BusinessStatus;

        // If status changed while user was here, send to the correct page
        if (status === "APPROVED" || status === "ACTIVE") {
          router.replace("/dashboard");
          return;
        }
        if (
          status === "PAYMENT_CONFIRMED" ||
          status === "REVIEW" ||
          status === "PENDING_APPROVAL"
        ) {
          router.replace("/pending-approval");
          return;
        }
        if (status === "SUSPENDED") {
          router.replace("/dashboard/suspended");
          return;
        }

        // If they're not rejected anymore → back to onboarding
        if (status !== "REJECTED" && status !== "DECLINED") {
          router.replace("/onboarding");
          return;
        }

        setBusiness(businessData);
        setIsLoading(false);
      } catch {
        setError("Failed to load account status");
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [router]);

  const handleLogout = () => {
    [
      "adminToken",
      "adminData",
      "userId",
      "userRole",
      "supplierData",
      "checkoutId",
    ].forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });
    router.replace("/login?reason=signed-out");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900 mx-auto" />
          <p className="text-neutral-500 mt-4 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm text-center">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ─── Fixed top bar ─── */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex-shrink-0">
              <Logo />
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Spacer for the fixed header */}
      <div className="h-16 md:h-20" />

      {/* ─── Content ─── */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 sm:p-12 text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3 tracking-tight">
            Application Not Approved
          </h1>
          <p className="text-neutral-600 mb-8 max-w-md mx-auto">
            We&apos;ve reviewed your application and unfortunately we&apos;re
            unable to approve your supplier account at this time.
          </p>

          {/* Business details */}
          {business && (business.companyName || business.planName) && (
            <div className="bg-neutral-50 rounded-xl p-4 mb-6 text-left">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {business.companyName && (
                  <>
                    <span className="text-neutral-500">Company</span>
                    <span className="text-neutral-900 font-medium text-right">
                      {business.companyName}
                    </span>
                  </>
                )}
                {business.planName && (
                  <>
                    <span className="text-neutral-500">Plan</span>
                    <span className="text-neutral-900 font-medium text-right">
                      {business.planName}
                    </span>
                  </>
                )}
                <span className="text-neutral-500">Status</span>
                <span className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                    <XCircle className="w-3 h-3" />
                    Rejected
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Rejection reason */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-8 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 text-sm mb-1">
                  Reason for rejection
                </p>
                <p className="text-sm text-red-800">
                  {business?.rejectionReason ||
                    "No specific reason was provided. Please contact our support team for details."}
                </p>
              </div>
            </div>
          </div>

          {/* What you can do */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 text-left mb-8">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wider">
              What you can do
            </h3>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">
                    Review the rejection reason
                  </p>
                  <p className="text-xs text-neutral-500">
                    Check the reason above to understand what needs to be
                    updated
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">
                    Contact support if unclear
                  </p>
                  <p className="text-xs text-neutral-500">
                    Our team can clarify the exact requirements and guide you
                    through the fix
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">
                    Reapply when ready
                  </p>
                  <p className="text-xs text-neutral-500">
                    Once you&apos;ve addressed the issues, reach out and we can
                    re-enable your application
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                <span className="font-medium">Need help?</span> Our support team
                can walk you through what&apos;s needed to reapply.{" "}
                <Link href="/contact" className="underline font-medium">
                  Contact support
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/contact" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800">
                <MessageSquare className="w-4 h-4" />
                Contact support
              </button>
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              <RefreshCw className="w-4 h-4" />
              Check status again
            </button>
          </div>

          {/* Back to home */}
          <div className="mt-8 pt-6 border-t border-neutral-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}