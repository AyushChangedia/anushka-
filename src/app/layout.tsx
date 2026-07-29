import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Recipe Maker AI — Cook with what you already have",
    template: "%s · Recipe Maker AI",
  },
  description:
    "Enter the ingredients in your kitchen and get recipes you can cook right now, ranked by how much of each one you already have.",
  keywords: [
    "recipe generator",
    "what can I cook",
    "ingredients to recipes",
    "AI recipes",
    "leftover ingredients",
    "pantry recipes",
  ],
  authors: [{ name: "Recipe Maker AI" }],
  openGraph: {
    type: "website",
    siteName: "Recipe Maker AI",
    title: "Recipe Maker AI — Cook with what you already have",
    description:
      "Enter the ingredients in your kitchen and get recipes you can cook right now.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Recipe Maker AI",
    description:
      "Enter the ingredients in your kitchen and get recipes you can cook right now.",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f0e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning is required by next-themes, which writes the
    // resolved theme class onto <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* First tab stop on every page, for keyboard and screen-reader users. */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>

          <SiteHeader />

          <main id="main" className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
            {children}
          </main>

          <footer
            className="border-t border-border py-8 text-center text-sm text-foreground-muted"
            data-print="hide"
          >
            <p>
              Recipe Maker AI · Nutrition figures are estimates.{" "}
              <Link href="/" className="underline underline-offset-4 hover:text-foreground">
                Start a new search
              </Link>
            </p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
