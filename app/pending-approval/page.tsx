// app/pending-approval/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "../components/ui/Logo";
import { Clock, CheckCircle, Mail, CreditCard } from "lucide-react";

interface BusinessStatus {
  status: string;
  paymentStatus?: string;
  planName?: string;
  companyName?: string;
  onboardingCompleted?: boolean;
}

export default function PendingApprovalPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch("/api/auth/onboarding/status", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load account status");
          return;
        }

        setBusiness(data.data);

        // If approved while user was waiting, redirect
        if (data.data?.status === "APPROVED" || data.data?.status === "ACTIVE") {
          router.push("/dashboard");
        }
      } catch (err) {
        setError("Failed to load account status");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();

    // Poll every 30 seconds to check if approved
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    router.push("/login");
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

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ─── Fixed top bar — matches landing page, auth, onboarding ─── */}
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
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3 tracking-tight">
            Account Under Review
          </h1>
          <p className="text-neutral-600 mb-8 max-w-md mx-auto">
            Thank you for completing your payment! Your account is now being
            reviewed by our admin team.
          </p>

          {/* Status card */}
          {business && (
            <div className="bg-neutral-50 rounded-xl p-4 mb-8 text-left">
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
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    Pending Approval
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 text-left mb-8">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wider">
              What happens next
            </h3>

            <div className="space-y-4">
              {/* Payment done */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">
                    Payment received
                  </p>
                  <p className="text-xs text-neutral-500">
                    Your subscription payment has been processed
                  </p>
                </div>
              </div>

              {/* Review in progress */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">
                    Admin review in progress
                  </p>
                  <p className="text-xs text-neutral-500">
                    Our team is verifying your details (24-48 hours)
                  </p>
                </div>
              </div>

              {/* Email pending */}
              <div className="flex items-start gap-3 opacity-50">
                <div className="w-6 h-6 rounded-full bg-neutral-300 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">
                    Approval notification
                  </p>
                  <p className="text-xs text-neutral-500">
                    You&apos;ll receive an email once approved
                  </p>
                </div>
              </div>

              {/* Dashboard pending */}
              <div className="flex items-start gap-3 opacity-50">
                <div className="w-6 h-6 rounded-full bg-neutral-300 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">
                    Full dashboard access
                  </p>
                  <p className="text-xs text-neutral-500">
                    Start managing your products and orders
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-blue-900">
              <span className="font-medium">Didn&apos;t receive anything?</span>{" "}
              Check your spam folder or{" "}
              <Link href="/contact" className="underline font-medium">
                contact support
              </Link>
              .
            </p>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Refresh status
          </button>
        </div>
      </main>
    </div>
  );
}