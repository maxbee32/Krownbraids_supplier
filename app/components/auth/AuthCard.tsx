// components/auth/AuthCard.tsx
import { ReactNode } from "react";
import { Logo } from "./../ui/Logo";
import Link from "next/link";

export interface AuthPanelContent {
  title: string;
  body: string;
  features: string[];
  eyebrow?: string;
}

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  panel?: AuthPanelContent;
}

export function AuthCard({ children, title, subtitle, panel }: AuthCardProps) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {/* Fixed top bar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:h-[72px] lg:px-8">
          <Link href="/" className="flex-shrink-0">
            <Logo />
          </Link>
        </div>
      </header>

      {/* Offset for fixed header */}
      <div className="h-16 flex-shrink-0 lg:h-[72px]" aria-hidden />

      <main className="flex flex-1 items-start justify-center px-4 py-8 sm:px-6 sm:py-12 lg:items-center lg:px-8">
        <div className={`w-full ${panel ? "max-w-5xl" : "max-w-md"}`}>
          <div
            className={`grid gap-6 ${
              panel ? "lg:grid-cols-2 lg:gap-12" : "grid-cols-1"
            }`}
          >
            {/* Form panel */}
            <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                  {title}
                </h1>
                <p className="mt-2 text-sm text-neutral-600 sm:text-base">
                  {subtitle}
                </p>
              </div>

              <div className="flex-1">{children}</div>
            </div>

            {/* Info panel — desktop only */}
            {panel && (
              <aside
                className="hidden flex-col justify-between rounded-2xl bg-neutral-950 p-8 text-white lg:flex lg:p-10"
                aria-label="Platform overview"
              >
                <div>
                  {panel.eyebrow && (
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-amber-500">
                      {panel.eyebrow}
                    </p>
                  )}
                  <h2 className="text-3xl font-semibold leading-tight tracking-tight">
                    {panel.title}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-neutral-400">
                    {panel.body}
                  </p>

                  <ul className="mt-8 space-y-3">
                    {panel.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                        <span className="text-sm leading-relaxed text-neutral-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-10 border-t border-neutral-800 pt-6">
                  <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                    KrownBraids Supplier Platform
                  </p>
                </div>
              </aside>
            )}
          </div>

          {/* Mobile brand strip — replaces the dark panel below lg */}
          {panel && (
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
                {panel.eyebrow ?? "Supplier Portal"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {panel.body}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}