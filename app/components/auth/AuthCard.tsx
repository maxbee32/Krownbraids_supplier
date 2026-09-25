// components/auth/AuthCard.tsx
import { ReactNode } from "react";
import { Logo } from "./../ui/Logo";
import Link from "next/link";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  image?: "login" | "signup";
}

export function AuthCard({ children, title, subtitle, image = "login" }: AuthCardProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white lg:bg-neutral-50">
      {/* Fixed top bar — matches the landing page nav exactly */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link href="/" className="flex-shrink-0">
              <Logo />
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer to offset the fixed header */}
      <div className="h-16 md:h-20 flex-shrink-0" />

      {/* Main content */}
      <main className="flex-1 flex items-start lg:items-center justify-center px-0 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="w-full max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-0 sm:gap-8 lg:gap-12 items-stretch">
            {/* Form panel */}
            <div className="bg-white sm:rounded-2xl sm:border sm:border-neutral-200 sm:shadow-sm p-6 sm:p-8 lg:p-10">
              {/* Header */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                  {title}
                </h1>
                <p className="mt-2 text-base sm:text-base text-neutral-600">
                  {subtitle}
                </p>
              </div>

              {/* Form */}
              <div>{children}</div>
            </div>

            {/* Info panel — hidden on mobile/tablet */}
            <div className="hidden lg:flex flex-col justify-center bg-neutral-900 rounded-2xl p-8 lg:p-10 text-white">
              <h2 className="text-3xl font-bold mb-4 tracking-tight leading-tight">
                {image === "login" ? "Welcome back." : "Grow your supply business."}
              </h2>
              <p className="text-neutral-400 text-base leading-relaxed">
                {image === "login"
                  ? "Sign in to manage your products, process orders, and connect with beauty businesses."
                  : "Join hundreds of suppliers already using KrownBraids to reach beauty businesses across the UK."}
              </p>

              {/* Feature list */}
              <ul className="mt-8 space-y-3">
                {[
                  "Manage unlimited products",
                  "Track inventory in real-time",
                  "Process bulk orders",
                  "Connect with buyers",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-neutral-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Bottom tagline */}
              <div className="mt-10 pt-6 border-t border-neutral-800">
                <p className="text-xs text-neutral-500 uppercase tracking-wider">
                  KrownBraids Supplier Platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}