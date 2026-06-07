"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { DEFAULT_PRICING_CONFIG } from "@/lib/pricing";
import { DollarSign, Tag, Info, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const sections = [
    {
      title: "Document & Thesis Printing",
      items: [
        { name: "A4 Black & White Page", rate: DEFAULT_PRICING_CONFIG["a4-bw"], unit: "page" },
        { name: "A4 Full Color Page", rate: DEFAULT_PRICING_CONFIG["a4-color"], unit: "page" },
        { name: "A3 Large Black & White Page", rate: DEFAULT_PRICING_CONFIG["a3-bw"], unit: "page" },
        { name: "A3 Large Full Color Page", rate: DEFAULT_PRICING_CONFIG["a3-color"], unit: "page" },
        { name: "Standard Photo Printing", rate: DEFAULT_PRICING_CONFIG["photo-print"], unit: "page" },
        { name: "Passport Photo Print Set", rate: DEFAULT_PRICING_CONFIG["passport-photo"], unit: "8 photos" },
      ]
    },
    {
      title: "Bindings & Finishing options",
      items: [
        { name: "Spiral Coil Binding", rate: DEFAULT_PRICING_CONFIG["binding-spiral"], unit: "book" },
        { name: "Thermal Protective Lamination", rate: DEFAULT_PRICING_CONFIG["binding-lamination"], unit: "sheet" },
      ]
    },
    {
      title: "Corporate Business Services",
      items: [
        { name: "Visiting Cards (350GSM Matte)", rate: DEFAULT_PRICING_CONFIG["visiting-cards"], unit: "card (base)" },
        { name: "Company Letterheads (100GSM)", rate: DEFAULT_PRICING_CONFIG["letterheads"], unit: "sheet" },
        { name: "A4 Flyers & Folded Brochures", rate: DEFAULT_PRICING_CONFIG["brochures"], unit: "sheet" },
      ]
    },
    {
      title: "Customized Photo Gifts",
      items: [
        { name: "Ceramic Coffee Mug Printing", rate: DEFAULT_PRICING_CONFIG["mug-print"], unit: "mug" },
        { name: "Color Changing Magic Mug", rate: DEFAULT_PRICING_CONFIG["magic-mug"], unit: "mug" },
        { name: "Cotton Custom Graphic T-Shirt", rate: DEFAULT_PRICING_CONFIG["tshirt-print"], unit: "shirt" },
        { name: "Heavyweight Fleece Hoodie", rate: DEFAULT_PRICING_CONFIG["hoodie-print"], unit: "hoodie" },
        { name: "Cozy Cushion & Pillow Printing", rate: DEFAULT_PRICING_CONFIG["pillow-print"], unit: "pillow" },
      ]
    },
    {
      title: "Office & Typing Services",
      items: [
        { name: "High-Speed Document Scanning", rate: DEFAULT_PRICING_CONFIG["scanning"], unit: "page" },
        { name: "Bulk Document Photocopy / Xerox", rate: DEFAULT_PRICING_CONFIG["xerox"], unit: "page" },
        { name: "ATS Professional Resume Creation", rate: DEFAULT_PRICING_CONFIG["resume-creation"], unit: "flat rate" },
      ]
    }
  ];

  return (
    <>
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 page-fade-in w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4">
            <Tag className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Transparent Pricing Guide</h1>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400">
            Real-time catalog pricing. Standard 18% GST applies to all services. High volume discounts are applied automatically at checkout.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-16">
          {sections.map((section, idx) => (
            <div key={idx} className="glass-panel border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white border-b border-zinc-150/40 dark:border-zinc-850/60 pb-3 flex items-center">
                <Check className="w-5 h-5 mr-2 text-indigo-500" />
                {section.title}
              </h2>
              
              <div className="space-y-4">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-900/60 pb-3 last:border-b-0 last:pb-0">
                    <span className="text-zinc-600 dark:text-zinc-350 font-medium">{item.name}</span>
                    <div className="text-right">
                      <span className="font-extrabold text-zinc-900 dark:text-white text-base">₹{item.rate.toFixed(2)}</span>
                      <span className="text-xs text-zinc-400 font-normal ml-0.5">/{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic call to action */}
        <div className="glass-panel border-indigo-500/20 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/5 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-base sm:text-lg">Have a custom or bulk print job?</h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">Get customized quotes on corporate visiting cards or custom merch.</p>
            </div>
          </div>
          <Link
            href="/services"
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md"
          >
            <span>Proceed to Calculator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
