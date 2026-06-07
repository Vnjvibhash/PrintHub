"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { HelpCircle, ChevronRight } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "What file formats do you accept for document printing?",
      a: "We support PDF, DOCX, PPTX, XLSX, PNG, JPG, and JPEG. For thesis papers and multi-page manuals, we strongly recommend exporting your files as PDF first to ensure your layouts, margins, and fonts are preserved exactly."
    },
    {
      q: "What is the maximum file size I can upload?",
      a: "Our file upload system supports files up to 500 MB. This easily accommodates large high-resolution vectors, blueprints, and multi-hundred-page research project volumes."
    },
    {
      q: "How does the dynamic pricing calculator work?",
      a: "The pricing engine calculates costs in real-time based on A4/A3 dimension parameters, single or double-sided configuration, color format (color prints require specialized ink channels and cost more), lamination choices, and binding types (such as spiral binders). The final price is multiplied by the number of copies."
    },
    {
      q: "How can I track my order status?",
      a: "Once you submit an order, you will receive a unique Order ID (e.g., PH-9821). You can input this ID on our Track Order page at any time to see its exact status: Pending, Payment Received, Processing, Designing, Printing, Ready for Pickup, Shipped, or Delivered."
    },
    {
      q: "What is the Magic Mug and how does it work?",
      a: "A Magic Mug is a ceramic mug coated with a heat-sensitive layer. When cold, it displays a solid black layout. When you pour in hot liquid (tea, coffee, hot water), the black coating becomes transparent, revealing your custom printed high-definition photo or text underneath!"
    },
    {
      q: "What payment gateways are supported?",
      a: "We support Stripe, Razorpay (for card payments, NetBanking, wallets), and UPI QR Scan codes. If you select UPI QR, the system generates a dynamic scan code for you to scan and make payments using apps like GooglePay, PhonePe, or Paytm."
    }
  ];

  return (
    <>
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 page-fade-in">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400">
            Find instant answers to common queries about print quality, customized gifts, checkout, and tracking.
          </p>
        </div>

        {/* Exclusive accordions scoped by name="faq" (Native HTML API from Web Guidance) */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              name="faq"
              className="group glass-panel rounded-2xl p-6 border-zinc-200/60 dark:border-zinc-800/80 open:border-indigo-500/30 transition-colors duration-300 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between font-bold text-base sm:text-lg cursor-pointer select-none list-none text-zinc-900 dark:text-zinc-100 focus:outline-none focus:text-indigo-600 dark:focus:text-indigo-400">
                <span>{faq.q}</span>
                <ChevronRight className="h-5 w-5 text-zinc-400 group-open:rotate-95 transition-transform duration-200 flex-shrink-0 ml-4" />
              </summary>
              <div className="mt-4 text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-4 animate-fade-in">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
