// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuraEdit | Aesthetic Portfolio Engine",
  description: "Curate your digital aesthetic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en" className="dark" suppressHydrationWarning>
      
      <body 
        className={`${inter.className} bg-zinc-950 text-zinc-50 antialiased min-h-screen pt-16`}
        suppressHydrationWarning
      >
        <Navbar />
        <main className="max-w-7xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}