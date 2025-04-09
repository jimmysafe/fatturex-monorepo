import type { Metadata } from "next";

import { Toaster } from "@repo/ui/components/ui/sonner";
import { Geist, Geist_Mono } from "next/font/google";

import { AppProviders } from "./providers";

import "@/lib/i18n";

import "@repo/ui/index.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fatturex",
  description: "Basta brutte sorprese",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen px-4 antialiased`}
      >
        <AppProviders>
          {children}
        </AppProviders>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
