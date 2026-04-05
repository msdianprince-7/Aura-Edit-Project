// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AuraEdit | The Aesthetic Portfolio Engine",
  description:
    "The high-performance portfolio engine for creators. Upload your raw photos, apply stunning edits, and share your aura with the world.",
  keywords: ["portfolio", "aesthetic", "creator", "photography", "gallery"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased min-h-screen pt-16`}
        style={{
          background: "var(--bg-deep)",
          color: "var(--text-primary)",
        }}
        suppressHydrationWarning
      >
        <Navbar />
        <main className="max-w-7xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}