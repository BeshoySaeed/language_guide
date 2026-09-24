import type { Metadata } from "next";
import { Suspense } from "react";
import { NavigationLoader } from "@/components/app/navigation-loader";
import { OfflineRuntime } from "@/components/offline/offline-runtime";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Language Guide",
  description: "Structured language lessons, focused practice, and smart daily review.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <Suspense fallback={null}><NavigationLoader /></Suspense>
          <OfflineRuntime />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
