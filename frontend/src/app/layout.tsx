import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar, Footer } from "@/components/layout";
import { APP_NAME } from "@/lib/constants";
import { AuthProvider } from "@/context/AuthContext";

// ── Fonts ─────────────────────────────────────────────────────────────────────
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// ── Root metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hackathonfinder.bd"
  ),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Discover, track, and participate in hackathons across Bangladesh. Find events, set reminders, and submit your projects.",
  keywords: [
    "hackathon",
    "bangladesh",
    "tech events",
    "coding competition",
    "programming contest",
  ],
  authors: [{ name: "Hackathon Finder Bangladesh" }],
  openGraph: {
    type: "website",
    locale: "en_BD",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ── Root layout ───────────────────────────────────────────────────────────────
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
        <AuthProvider>
          {/* ── Site shell ─────────────────────────────────────────────────── */}
          <div className="flex min-h-screen flex-col">
            <Navbar />

            {/* ── Page content ─────────────────────────────────────────────── */}
            <main className="flex-1">
              {children}
            </main>

            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
