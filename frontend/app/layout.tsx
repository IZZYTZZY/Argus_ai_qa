import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/theme";

export const metadata: Metadata = {
  title: "Argus — AI QA Engineer",
  description:
    "The AI QA engineer that never sleeps. Argus understands your product, generates and maintains enterprise-grade test suites, and predicts risk before release.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}
        style={{ "--font-sans": GeistSans.style.fontFamily, "--font-mono": GeistMono.style.fontFamily } as React.CSSProperties}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
