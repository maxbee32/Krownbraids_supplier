"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "../../../../components/ui/Logo";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

function PaymentVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const urlCheckoutId =
      searchParams.get("checkoutId") ||
      searchParams.get("checkout_id");

    const storedCheckoutId =
      typeof window !== "undefined"
        ? localStorage.getItem("checkoutId")
        : null;

    const finalCheckoutId = urlCheckoutId || storedCheckoutId;

    console.log("🔍 Verify page loaded");
    console.log("   All URL params:", Object.fromEntries(searchParams.entries()));
    console.log("   URL checkoutId:", urlCheckoutId);
    console.log("   localStorage checkoutId:", storedCheckoutId);
    console.log("   Using:", finalCheckoutId);

    if (!finalCheckoutId) {
      setStatus("error");
      setMessage("Missing payment reference. Please contact support.");
      return;
    }

    const verify = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          router.push("/login");
          return;
        }

        console.log("🔍 Verifying with backend:", finalCheckoutId);

        const res = await fetch(
          `/api/auth/supplier-payment/verify/${finalCheckoutId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();
        console.log("📥 Verify response:", data);

        if (res.ok && data.success) {
          localStorage.removeItem("checkoutId");

          setStatus("success");
          setMessage("Payment confirmed! Redirecting...");
          setTimeout(() => {
            router.push("/dashboard/pending-approval");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.message || "Payment verification failed");
        }
      } catch (err) {
        console.error("❌ Verify error:", err);
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verify();
  }, [searchParams, router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ─── Header — matches pending-approval ─── */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 sm:p-12 text-center">

          {/* ─── Loading state ─── */}
          {status === "loading" && (
            <>
              <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-neutral-900 animate-spin" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3 tracking-tight">
                Verifying Payment
              </h1>
              <p className="text-neutral-600 max-w-md mx-auto">{message}</p>

              {/* Spinner strip */}
              <div className="bg-neutral-50 rounded-xl p-4 mt-8">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 flex-shrink-0" />
                  <p className="text-sm text-neutral-600 text-left">
                    Checking with payment provider, please wait...
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ─── Success state ─── */}
          {status === "success" && (
            <>
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3 tracking-tight">
                Payment Successful!
              </h1>
              <p className="text-neutral-600 max-w-md mx-auto mb-8">
                {message}
              </p>

              {/* Timeline — mirrors pending-approval */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 text-left mb-8">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wider">
                  What happens next
                </h3>

                <div className="space-y-4">
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

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 text-sm">
                        Redirecting you now
                      </p>
                      <p className="text-xs text-neutral-500">
                        Taking you to your account status page
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting...</span>
              </div>
            </>
          )}

          {/* ─── Error state ─── */}
          {status === "error" && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3 tracking-tight">
                Payment Failed
              </h1>
              <p className="text-neutral-600 max-w-md mx-auto mb-8">
                {message}
              </p>

              {/* Info note */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-red-900">
                  <span className="font-medium">Need help?</span>{" "}
                  If you believe this is an error, please{" "}
                  <Link href="/contact" className="underline font-medium">
                    contact support
                  </Link>{" "}
                  and reference your payment receipt.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/onboarding")}
                  className="w-full bg-neutral-900 text-white py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                >
                  Try Again
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push("/contact")}
                  className="w-full bg-white border border-neutral-300 text-neutral-900 py-3 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50">
          <header className="bg-white border-b border-neutral-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <Logo />
            </div>
          </header>
          <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 sm:p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-neutral-900 animate-spin" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3 tracking-tight">
                Loading...
              </h1>
            </div>
          </main>
        </div>
      }
    >
      <PaymentVerifyContent />
    </Suspense>
  );
}