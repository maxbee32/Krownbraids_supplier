// app/layout.tsx
import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/providers/Providers";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KrownBraids Supplier Portal",
  description: "Premium hair products supplier platform",
  keywords: "hair products, supplier, wholesale, braids, beauty",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} h-full antialiased`}>
      <body className="font-sans min-h-full flex flex-col bg-gradient-to-br from-amber-50 via-white to-amber-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}