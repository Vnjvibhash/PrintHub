import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrintHub Services - Professional Printing & Custom Merchandise",
  description: "High-quality document printing (A4, A3), business stationery, cards, custom mugs, T-shirts, and document scanning near you with instant price updates.",
  keywords: ["printing services near me", "A4 printing", "A3 printing", "visiting card printing", "mug printing", "custom gifts", "t-shirt printing"],
  openGraph: {
    title: "PrintHub Services - Professional Printing & Custom Merchandise",
    description: "Upload designs or documents and get premium prints, spiral binding, and custom custom gifts delivered fast.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fafafc] dark:bg-[#07070a] text-[#0f0f15] dark:text-[#f3f4f6]">
        <AuthProvider>
          <div className="relative min-h-screen flex flex-col overflow-hidden">
            {/* Background glowing spots for beautiful aesthetic */}
            <div className="glow-spot top-[-100px] left-[-100px] opacity-40 dark:opacity-20" />
            <div className="glow-spot bottom-[-200px] right-[-100px] opacity-40 dark:opacity-20" />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
