import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "LipeExplica — Produtos digitais para professores de Jiu-Jitsu",
    template: "%s · LipeExplica",
  },
  description:
    "50 Dinâmicas para Jiu-Jitsu Infantil e outros produtos digitais premium do LipeExplica.",
  openGraph: {
    siteName: "LipeExplica",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://www.lipeexplica.com/social-final/c01-hook.webp",
        width: 1080,
        height: 1080,
        alt: "LipeExplica — Produtos digitais para professores de Jiu-Jitsu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://www.lipeexplica.com/social-final/c01-hook.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${fraunces.variable} antialiased`}>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
