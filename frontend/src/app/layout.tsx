import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Hackathon Finder Bangladesh",
    template: "%s | Hackathon Finder Bangladesh",
  },
  description:
    "Discover, track, and participate in hackathons across Bangladesh. Find events, set reminders, and submit your projects.",
  keywords: ["hackathon", "bangladesh", "tech events", "coding competition"],
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://hackathonfinder.bd",
    siteName: "Hackathon Finder Bangladesh",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/*
         * Phase 1: Add <ThemeProvider>, <AuthProvider>, <Toaster> here.
         * For now: naked layout shell.
         */}
        {children}
      </body>
    </html>
  );
}
