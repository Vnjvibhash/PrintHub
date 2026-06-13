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
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const t = localStorage.getItem('theme') || 'system';
                  const d = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  document.documentElement.classList.toggle('dark', d);
                  document.documentElement.classList.toggle('light', !d);
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#fafafc] dark:bg-[#07070a] text-[#0f0f15] dark:text-[#f3f4f6]">
        <AuthProvider>
          <div className="relative min-h-screen flex flex-col overflow-hidden">
            {/* Background glowing spots for beautiful aesthetic */}
            <div className="glow-spot top-[-100px] left-[-100px] opacity-40 dark:opacity-20" />
            <div className="glow-spot bottom-[-200px] right-[-100px] opacity-40 dark:opacity-20" />
            {children}

            <a
              href="https://wa.me/917762974716?text=Hello%20PrintHub%20Team%2C%20I%20need%20help%20with%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-emerald-500/30 transition hover:scale-105 hover:bg-emerald-600"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-lg">💬</span>
              <span>WhatsApp</span>
            </a>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
