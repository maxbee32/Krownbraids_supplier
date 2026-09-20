// app/page.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "./components/ui/Button";
import { Logo } from "./components/ui/Logo";
import { 
  Package, 
  Truck, 
  Shield, 
  Star, 
  Users,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
  Globe,
  Zap,
  BarChart3,
  Headphones,
  Award,
  Building2,
  Store,
  Boxes,
  Warehouse,
  ShoppingBag,
  CreditCard,
  Handshake
} from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link href="/" className="flex-shrink-0">
              <Logo />
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                Features
              </Link>
              <Link href="#who-its-for" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                Who It's For
              </Link>
              <Link href="#how-it-works" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                How It Works
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-sm px-5 text-neutral-700 hover:text-neutral-900">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="text-sm px-5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg">
                  Sign Up
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-neutral-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 animate-slide-in-right">
            <div className="flex justify-between items-center mb-8">
              <Logo />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5 text-neutral-700" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 mb-8">
              <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-neutral-600 hover:text-neutral-900 py-2">
                Features
              </Link>
              <Link href="#who-its-for" onClick={() => setMobileMenuOpen(false)} className="text-neutral-600 hover:text-neutral-900 py-2">
                Who It's For
              </Link>
              <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-neutral-600 hover:text-neutral-900 py-2">
                How It Works
              </Link>
            </div>
            
            <div className="flex flex-col gap-3 pt-4 border-t border-neutral-200">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center py-3">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center py-3 bg-neutral-900 hover:bg-neutral-800">
                  Sign Up
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 sm:pt-28 md:pt-32 pb-16 md:pb-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-white" />
          
          <div className="max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="animate-fade-in-up text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-700 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6 border border-neutral-200">
                  <Star className="w-3 h-3 md:w-4 md:h-4 fill-neutral-500 text-neutral-500" />
                  Trusted by Suppliers Worldwide
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight tracking-tight">
                  Sell More.
                  <span className="block text-neutral-500">
                    Manage Everything.
                  </span>
                </h1>
                
                <p className="mt-4 md:mt-6 text-base md:text-lg text-neutral-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  The all-in-one platform built for beauty product suppliers. 
                  Manage inventory, process orders, and grow your wholesale business.
                </p>
                
                <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto text-sm md:text-base px-6 md:px-8 py-3 md:py-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg">
                      Get Started
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                  </Link>
                  <Link href="#features" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto text-sm md:text-base px-6 md:px-8 py-3 md:py-4 rounded-lg border-neutral-300 text-neutral-700 hover:bg-neutral-50">
                      See Features
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 md:gap-8">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center text-neutral-600 font-semibold text-xs md:text-sm"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs md:text-sm font-semibold text-neutral-900">
                      Trusted by 500+ suppliers
                    </p>
                    <div className="flex items-center gap-1 justify-center sm:justify-start mt-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3 h-3 fill-neutral-400 text-neutral-400" />
                      ))}
                      <span className="text-[10px] md:text-xs text-neutral-500 ml-1">4.9/5</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative lg:flex justify-end animate-fade-in-up mt-8 lg:mt-0" style={{ animationDelay: "0.3s" }}>
                <div className="relative w-full max-w-sm md:max-w-md mx-auto lg:mx-0">
                  <div className="relative bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-neutral-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
                          <Warehouse className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-neutral-900">Your Warehouse</p>
                          <p className="text-[10px] text-neutral-500">Dashboard</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-neutral-300" />
                        <div className="w-2 h-2 rounded-full bg-neutral-300" />
                        <div className="w-2 h-2 rounded-full bg-neutral-300" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="col-span-2 bg-neutral-50 rounded-xl p-3 md:p-4 border border-neutral-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs md:text-sm text-neutral-500">Monthly Sales</p>
                            <p className="text-lg md:text-2xl font-bold text-neutral-900">$84,392</p>
                          </div>
                          <div className="bg-neutral-200 text-neutral-700 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-sm font-medium">
                            +18.2%
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-3 md:p-4 border border-neutral-200">
                        <Boxes className="w-5 h-5 md:w-6 md:h-6 text-neutral-600 mb-1 md:mb-2" />
                        <p className="text-[10px] md:text-sm text-neutral-500">Products</p>
                        <p className="text-base md:text-lg font-bold text-neutral-900">1,284</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 md:p-4 border border-neutral-200">
                        <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-neutral-600 mb-1 md:mb-2" />
                        <p className="text-[10px] md:text-sm text-neutral-500">Orders</p>
                        <p className="text-base md:text-lg font-bold text-neutral-900">342</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-neutral-500">Recent Orders</span>
                        <span className="text-xs text-neutral-900 font-medium cursor-pointer">View all</span>
                      </div>
                      <div className="space-y-2">
                        {[1, 2].map((i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-neutral-600" />
                            </div>
                            <div className="flex-1">
                              <div className="h-2 bg-neutral-200 rounded w-24" />
                            </div>
                            <div className="h-2 bg-neutral-200 rounded w-12" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-8 md:py-12 px-4 border-y border-neutral-200 bg-neutral-50">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-xs md:text-sm text-neutral-500 mb-6 tracking-wide uppercase">
              Powering suppliers across the beauty industry
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-40">
              {['Wholesalers', 'Distributors', 'Manufacturers', 'Importers', 'Brands', 'Retailers'].map((name, i) => (
                <span key={i} className="text-sm md:text-base font-semibold text-neutral-600">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Who It's For Section */}
        <section id="who-its-for" className="py-16 md:py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
                Who It's{" "}
                <span className="text-neutral-500">
                  For
                </span>
              </h2>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-neutral-600 max-w-2xl mx-auto px-4">
                Built for every type of beauty product supplier
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {whoItsFor.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="group flex flex-col items-center p-4 md:p-6 rounded-xl bg-neutral-50 hover:bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white flex items-center justify-center mb-3 md:mb-4 shadow-sm group-hover:shadow transition-shadow border border-neutral-200">
                      <Icon className="w-6 h-6 md:w-7 md:h-7 text-neutral-700" />
                    </div>
                    <p className="text-xs md:text-sm font-medium text-neutral-900 text-center">
                      {item.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-20 px-4 bg-neutral-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
                Everything You Need to{" "}
                <span className="text-neutral-500">
                  Grow Your Supply Business
                </span>
              </h2>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-neutral-600 max-w-2xl mx-auto px-4">
                Powerful tools designed specifically for beauty product suppliers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group bg-white p-5 md:p-6 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-neutral-100 flex items-center justify-center mb-3 md:mb-4 border border-neutral-200">
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-neutral-700" />
                    </div>
                    <h3 className="text-base md:text-xl font-semibold text-neutral-900 mb-1 md:mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm md:text-base text-neutral-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
                How It{" "}
                <span className="text-neutral-500">
                  Works
                </span>
              </h2>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-neutral-600 max-w-2xl mx-auto px-4">
                Get your supply business online in minutes
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {howItWorks.map((step, index) => (
                <div key={index} className="relative">
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-neutral-200" />
                  )}
                  
                  <div className="relative flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mb-4 md:mb-6 relative z-10">
                      <span className="text-2xl font-bold text-white">{index + 1}</span>
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-neutral-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-neutral-600 max-w-xs">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 md:py-20 px-4 bg-neutral-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight px-4">
                Why Suppliers Choose Us
              </h2>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-neutral-400 max-w-2xl mx-auto px-4">
                Built with the tools and support you need to succeed
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
              {whyChooseUs.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto mb-4 border border-neutral-700">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 px-4 bg-neutral-900 relative overflow-hidden border-t border-neutral-800">
          <div className="max-w-4xl mx-auto text-center relative">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white px-4 tracking-tight">
              Ready to Grow Your Supply Business?
            </h2>
            <p className="mt-3 md:mt-4 text-neutral-300 text-sm md:text-lg px-4">
              Join hundreds of suppliers already growing with our platform
            </p>
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-white text-neutral-900 hover:bg-neutral-100 text-sm md:text-base px-6 md:px-8 py-3 md:py-4 rounded-lg">
                  Sign Up
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto border-neutral-600 text-white hover:bg-neutral-800 text-sm md:text-base px-6 md:px-8 py-3 md:py-4 rounded-lg">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12 md:py-16 px-4 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Logo variant="light" />
              <p className="mt-4 text-neutral-400 text-sm max-w-xs">
                The complete platform for beauty product suppliers
              </p>
              {/* <div className="flex gap-3 mt-4">
                {['twitter', 'linkedin', 'facebook', 'instagram'].map((social) => (
                  <div 
                    key={social}
                    className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-neutral-400" />
                  </div>
                ))}
              </div> */}
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Product</h4>
              <ul className="space-y-2 text-neutral-400 text-xs md:text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">Features</li>
                <li className="hover:text-white transition-colors cursor-pointer">Integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">For Suppliers</h4>
              <ul className="space-y-2 text-neutral-400 text-xs md:text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">Wholesalers</li>
                <li className="hover:text-white transition-colors cursor-pointer">Distributors</li>
                <li className="hover:text-white transition-colors cursor-pointer">Manufacturers</li>
                <li className="hover:text-white transition-colors cursor-pointer">Brands</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Company</h4>
              <ul className="space-y-2 text-neutral-400 text-xs md:text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">About</li>
                <li className="hover:text-white transition-colors cursor-pointer">Blog</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Support</h4>
              <ul className="space-y-2 text-neutral-400 text-xs md:text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">Help Center</li>
                <li className="hover:text-white transition-colors cursor-pointer">Status</li>
                <li className="hover:text-white transition-colors cursor-pointer">Security</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-500 text-xs md:text-sm">
              © {new Date().getFullYear()} KrownBraids. All rights reserved.
            </p>
            <div className="flex gap-4 md:gap-6">
              <span className="text-neutral-500 text-xs md:text-sm hover:text-white transition-colors cursor-pointer">Privacy</span>
              <span className="text-neutral-500 text-xs md:text-sm hover:text-white transition-colors cursor-pointer">Terms</span>
              <span className="text-neutral-500 text-xs md:text-sm hover:text-white transition-colors cursor-pointer">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Package,
    title: "Product Catalog",
    description: "Showcase your entire product range with detailed listings, images, and specifications.",
  },
  {
    icon: Warehouse,
    title: "Inventory Management",
    description: "Track stock levels in real-time, get low-stock alerts, and manage multiple warehouses.",
  },
  {
    icon: ShoppingBag,
    title: "Order Management",
    description: "Process wholesale orders, track shipments, and manage bulk pricing tiers effortlessly.",
  },
  {
    icon: Users,
    title: "Customer Network",
    description: "Build relationships with salons, spas, and beauty businesses that buy your products.",
  },
  {
    icon: CreditCard,
    title: "Invoicing & Payments",
    description: "Generate invoices, accept payments, and manage credit terms for your buyers.",
  },
  {
    icon: BarChart3,
    title: "Sales Analytics",
    description: "Track best-sellers, understand buying patterns, and make data-driven decisions.",
  },
];

const whoItsFor = [
  { icon: Boxes, name: "Wholesalers" },
  { icon: Truck, name: "Distributors" },
  { icon: Building2, name: "Manufacturers" },
  { icon: Globe, name: "Importers" },
  { icon: Award, name: "Brands" },
  { icon: Store, name: "Retailers" },
];

const howItWorks = [
  {
    title: "Create Account",
    description: "Sign up and set up your supplier profile in minutes.",
  },
  {
    title: "Add Your Products",
    description: "Upload your catalog with pricing tiers and inventory.",
  },
  {
    title: "Connect with Buyers",
    description: "Get discovered by salons, spas, and beauty businesses.",
  },
  {
    title: "Grow Your Business",
    description: "Start receiving orders and grow your wholesale business.",
  },
];

const whyChooseUs = [
  {
    icon: Zap,
    title: "Built for Speed",
    description: "Fast, modern platform that works on any device. No clunky software, no steep learning curve.",
  },
  {
    icon: Handshake,
    title: "Beauty Industry Focused",
    description: "Designed specifically for beauty product suppliers. We understand your buyers and your products.",
  },
  {
    icon: Headphones,
    title: "Real Human Support",
    description: "Talk to actual people who understand the supply business. No chatbots, no ticket queues.",
  },
];