import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "lipeexplica — Explicando o mundo em 60 segundos",
  description:
    "Canal de YouTube Shorts que explica temas complexos de forma simples, usando ilustrações minimalistas e histórias envolventes.",
  keywords: ["youtube shorts", "educação", "curiosidades", "lipeexplica", "ciência"],
  openGraph: {
    title: "lipeexplica",
    description: "Explicando o mundo em 60 segundos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#fafafa] antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
