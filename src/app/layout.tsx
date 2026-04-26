// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('aura-theme');
                  if (theme === 'light') {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} antialiased min-h-screen pt-16`}
        style={{
          background: "var(--bg-deep)",
          color: "var(--text-primary)",
        }}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto p-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}