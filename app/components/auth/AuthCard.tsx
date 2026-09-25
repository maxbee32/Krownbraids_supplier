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
<div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-2 bg-white lg:bg-neutral-900">      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 lg:py-12 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <Link href="/" className="inline-block mb-8 sm:mb-10">
            <Logo />
          </Link>

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-neutral-600">
              {subtitle}
            </p>
          </div>

          {/* Form */}
          <div>{children}</div>
        </div>
      </div>

      {/* Right side - Visual (hidden on mobile/tablet, shows on desktop) */}
      <div className="hidden lg:flex bg-neutral-900 relative overflow-hidden items-center justify-center p-8 lg:p-12">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-20 right-20 w-72 lg:w-96 h-72 lg:h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 lg:w-96 h-72 lg:h-96 bg-white rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative max-w-md text-white w-full">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight leading-tight">
            {image === "login" ? "Welcome back." : "Grow your supply business."}
          </h2>
          <p className="text-neutral-400 text-base lg:text-lg leading-relaxed">
            {image === "login"
              ? "Sign in to manage your products, process orders, and connect with beauty businesses."
              : "Join hundreds of suppliers already using KrownBraids to reach beauty businesses across the UK."}
          </p>

          {/* Feature list */}
          <ul className="mt-8 lg:mt-10 space-y-3 lg:space-y-4">
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
                <span className="text-neutral-300 text-sm lg:text-base">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Bottom tagline */}
          <div className="mt-12 lg:mt-16 pt-6 lg:pt-8 border-t border-neutral-800">
            <p className="text-xs text-neutral-500 uppercase tracking-wider">
              KrownBraids Supplier Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}