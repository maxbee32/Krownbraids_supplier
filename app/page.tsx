// app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./components/ui/Button";
import { Logo } from "./components/ui/Logo";
import {
  ArrowRight,
  Check,
  Menu,
  X,
  Package,
  TrendingUp,
  Warehouse,
  Users,
  ShieldCheck,
  Gauge,
  Handshake,
  BarChart3,
  Boxes,
  Truck,
  Building2,
  Globe2,
  Store,
  ShoppingBag,
  Star,
} from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ---------- NAV ---------- */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[72px] lg:px-8">
          <Link href="/" className="flex-shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900">
              Features
            </Link>
            <Link href="#who-its-for" className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900">
              Who it&apos;s for
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900">
              How it works
            </Link>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login">
              <Button variant="ghost" className="px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800">
                Start trial
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 transition hover:bg-neutral-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-neutral-700" />
          </button>
        </div>
      </header>

      {/* ---------- MOBILE MENU ---------- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="animate-slide-in-right absolute right-0 top-0 h-full w-80 bg-white p-6 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 transition hover:bg-neutral-100"
              >
                <X className="h-5 w-5 text-neutral-700" />
              </button>
            </div>

            <div className="mb-8 flex flex-col gap-1">
              {[
                ["#features", "Features"],
                ["#who-its-for", "Who it's for"],
                ["#how-it-works", "How it works"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-2 border-t border-neutral-200 pt-6">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center py-2.5">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center bg-neutral-900 py-2.5 hover:bg-neutral-800">
                  Start trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* ---------- HERO ---------- */}
        <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
          <div className="bg-dot-grid absolute inset-0 opacity-60" aria-hidden />
          <div className="absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-amber-50/60 via-white to-transparent" aria-hidden />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
              <div className="animate-fade-in-up text-center lg:text-left">
                <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl lg:text-[3.5rem]">
                  The operating system
                  <span className="block text-neutral-500">
                    for wholesale beauty.
                  </span>
                </h1>

                <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg lg:mx-0">
                  Manage inventory, process wholesale orders, and grow your
                  supplier business — all from one place. Start with a 60-day
                  free trial.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Link href="/signup">
                    <Button className="group w-full rounded-lg bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 sm:w-auto">
                      Start your trial
                      <ArrowRight className="ml-1.5 h-4 w-4 transition group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button
                      variant="outline"
                      className="w-full rounded-lg border-neutral-300 bg-white px-6 py-3.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 sm:w-auto"
                    >
                      See how it works
                    </Button>
                  </Link>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-neutral-500 lg:justify-start">
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-amber-600" />
                    60-day free trial
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-amber-600" />
                    Cancel anytime
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-amber-600" />
                    No setup fees
                  </span>
                </div>
              </div>

              <div
                className="animate-fade-in-up relative mx-auto w-full max-w-md lg:mx-0"
                style={{ animationDelay: "0.15s" }}
              >
                <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-amber-200/40 via-neutral-200/30 to-transparent blur-2xl" aria-hidden />

                <div className="relative rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/10">
                  <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900">
                        <Warehouse className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-neutral-900">KrownBraids</span>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-neutral-200" />
                      <span className="h-2 w-2 rounded-full bg-neutral-200" />
                      <span className="h-2 w-2 rounded-full bg-neutral-200" />
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                            Revenue this month
                          </p>
                          <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
                            £84,392
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                          <TrendingUp className="h-3 w-3" />
                          18.2%
                        </span>
                      </div>
                      <svg viewBox="0 0 200 32" className="mt-3 h-8 w-full text-amber-500" preserveAspectRatio="none">
                        <path
                          d="M0 24 L20 20 L40 22 L60 14 L80 16 L100 10 L120 12 L140 6 L160 8 L180 4 L200 2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-neutral-200 bg-white p-3">
                        <Boxes className="mb-1.5 h-4 w-4 text-neutral-400" />
                        <p className="text-[11px] text-neutral-500">Products</p>
                        <p className="text-sm font-semibold text-neutral-900">1,284</p>
                      </div>
                      <div className="rounded-xl border border-neutral-200 bg-white p-3">
                        <ShoppingBag className="mb-1.5 h-4 w-4 text-neutral-400" />
                        <p className="text-[11px] text-neutral-500">Open orders</p>
                        <p className="text-sm font-semibold text-neutral-900">342</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50">
                            <Check className="h-3 w-3 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-neutral-900">Order #4021</p>
                            <p className="text-[10px] text-neutral-500">Just now · 240 units</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-neutral-900">£2,140</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- VALUE STRIP ---------- */}
        <section className="border-y border-neutral-200 bg-white py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {valueProps.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <p className="text-sm font-medium text-neutral-800">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- WHO IT'S FOR ---------- */}
        <section id="who-its-for" className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
                Who it&apos;s for
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
                Every kind of beauty supplier
              </h2>
              <p className="mt-4 text-base text-neutral-600">
                Whether you stock shelves or fill container ships, the platform adapts to how you sell.
              </p>
            </div>

            <div className="mb-12 flex flex-wrap justify-center gap-2">
              {whoItsFor.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm"
                  >
                    <Icon className="h-4 w-4 text-amber-600" />
                    {item.name}
                  </div>
                );
              })}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {whoItsFor.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="group flex items-start gap-4 rounded-xl border border-transparent p-4 transition hover:border-neutral-200 hover:bg-neutral-50"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white transition group-hover:bg-amber-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                      <p className="mt-0.5 text-sm text-neutral-600">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- FEATURES (bento) ---------- */}
        <section id="features" className="border-y border-neutral-200 bg-neutral-50/70 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
                Features
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
                Everything you need,{" "}
                <span className="text-neutral-500">nothing you don&apos;t</span>
              </h2>
              <p className="mt-4 text-base text-neutral-600">
                A focused set of tools built around how wholesale beauty actually works.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                const isFeatured = i < 2;
                return (
                  <div
                    key={feature.title}
                    className={`group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-300 hover:shadow-lg ${
                      isFeatured ? "lg:col-span-2" : ""
                    }`}
                  >
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-white transition group-hover:bg-amber-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight text-neutral-900">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                      {feature.description}
                    </p>

                    {isFeatured && (
                      <div className="mt-6 h-px w-full bg-gradient-to-r from-neutral-200 via-neutral-200 to-transparent" />
                    )}

                    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-100 opacity-0 blur-2xl transition group-hover:opacity-100" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- HOW IT WORKS ---------- */}
        <section id="how-it-works" className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
                How it works
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
                From signup to first order
              </h2>
              <p className="mt-4 text-base text-neutral-600">
                Four steps — most suppliers go live the same day.
              </p>
            </div>

            <div className="relative grid gap-8 md:grid-cols-4 md:gap-4">
              <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent md:block" />

              {howItWorks.map((step, i) => (
                <div key={step.title} className="relative text-center">
                  <div className="relative z-10 mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-900 bg-white text-sm font-semibold text-neutral-900">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mb-1.5 font-semibold text-neutral-900">{step.title}</h3>
                  <p className="mx-auto max-w-[220px] text-sm leading-relaxed text-neutral-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- WHY CHOOSE US ---------- */}
        <section className="bg-neutral-950 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Why suppliers choose KrownBraids
              </h2>
              <p className="mt-4 text-base text-neutral-400">
                Three things we do differently.
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-3 md:gap-8">
              {whyChooseUs.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="text-center">
                    <div className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mx-auto max-w-xs text-sm leading-relaxed text-neutral-400">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="relative overflow-hidden border-t border-neutral-800 bg-neutral-950 py-20 md:py-28">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Ready to grow your supply business?
            </h2>
            <p className="mt-4 text-base text-neutral-400 md:text-lg">
              Start with a 60-day free trial. Upgrade when you&apos;re ready.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/signup">
                <Button className="group w-full rounded-lg bg-white px-6 py-3.5 text-sm font-medium text-neutral-900 hover:bg-neutral-100 sm:w-auto">
                  Start your trial
                  <ArrowRight className="ml-1.5 h-4 w-4 transition group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="w-full rounded-lg border-neutral-700 bg-transparent px-6 py-3.5 text-sm font-medium text-white hover:bg-neutral-900 sm:w-auto"
                >
                  Talk to sales
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2 md:col-span-1">
              <Logo variant="light" />
              <p className="mt-4 max-w-xs text-sm text-neutral-400">
                The complete platform for beauty product suppliers.
              </p>
            </div>
            {footerLinks.map((col) => (
              <div key={col.heading}>
                <h4 className="mb-4 text-sm font-semibold text-white">{col.heading}</h4>
                <ul className="space-y-2.5 text-sm text-neutral-400">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="cursor-pointer transition hover:text-white">{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-800 pt-8 md:flex-row">
            <p className="text-xs text-neutral-500">
              © {new Date().getFullYear()} KrownBraids. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Privacy", "Terms", "Cookies"].map((label) => (
                <span
                  key={label}
                  className="cursor-pointer text-xs text-neutral-500 transition hover:text-white"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- DATA ---------- */

const valueProps = [
  { icon: ShieldCheck, label: "60-day free trial" },
  { icon: Gauge, label: "Go live in minutes" },
  { icon: Handshake, label: "Human support" },
  { icon: Globe2, label: "Built for UK suppliers" },
];

const features = [
  {
    icon: Package,
    title: "Product catalog",
    description:
      "Showcase your full range with detailed listings, tiered pricing, and real product imagery.",
  },
  {
    icon: Warehouse,
    title: "Inventory management",
    description:
      "Real-time stock across warehouses, low-stock alerts, and automatic reorder thresholds.",
  },
  {
    icon: ShoppingBag,
    title: "Order management",
    description: "Process wholesale orders, track shipments, and manage bulk pricing tiers.",
  },
  {
    icon: Users,
    title: "Customer network",
    description: "Build relationships with salons, spas, and beauty businesses that buy from you.",
  },
  {
    icon: ShieldCheck,
    title: "Invoicing & payments",
    description: "Generate invoices, accept payments, and set credit terms per buyer.",
  },
  {
    icon: BarChart3,
    title: "Sales analytics",
    description: "Track best-sellers and buying patterns, and act on the data.",
  },
];

const whoItsFor = [
  { icon: Boxes, name: "Wholesalers", description: "Bulk sellers moving pallets at a time." },
  { icon: Truck, name: "Distributors", description: "Multi-region fulfillment at scale." },
  { icon: Building2, name: "Manufacturers", description: "Direct-to-trade from your line." },
  { icon: Globe2, name: "Importers", description: "Cross-border sourcing and delivery." },
  { icon: Star, name: "Brands", description: "Own-label lines selling wholesale." },
  { icon: Store, name: "Retailers", description: "Brick-and-mortar shops restocking smart." },
];

const howItWorks = [
  { title: "Create account", description: "Sign up and set up your supplier profile in minutes." },
  { title: "Add products", description: "Upload your catalog with pricing tiers and stock." },
  { title: "Connect buyers", description: "Get discovered by salons, spas, and beauty shops." },
  { title: "Start selling", description: "Receive orders, ship, and grow your wholesale business." },
];

const whyChooseUs = [
  {
    icon: Gauge,
    title: "Built for speed",
    description:
      "Fast, modern platform that works on any device. No clunky software, no steep learning curve.",
  },
  {
    icon: ShieldCheck,
    title: "Beauty-native",
    description:
      "Designed specifically for beauty suppliers. We understand your buyers and your products.",
  },
  {
    icon: Handshake,
    title: "Real human support",
    description:
      "Talk to actual people who understand the supply business. No chatbots, no ticket queues.",
  },
];

const footerLinks = [
  { heading: "Product", links: ["Features", "Integrations"] },
  { heading: "For suppliers", links: ["Wholesalers", "Distributors", "Manufacturers", "Brands"] },
  { heading: "Company", links: ["About", "Blog", "Contact"] },
  { heading: "Support", links: ["Help center", "Status", "Security"] },
];