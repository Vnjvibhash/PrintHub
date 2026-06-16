"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { DEFAULT_PRICING_CONFIG, getAdminRates, getActiveOffers, getBestOfferForService } from "@/lib/pricing";
import { OfferRecord } from "@/types";
import { DollarSign, Tag, Info, Check, ArrowRight, Sparkles, Percent } from "lucide-react";
import Link from "next/link";

// Map service keys used in pricing to their rate keys
const SECTION_ITEMS: { title: string; items: { name: string; key: string; unit: string }[] }[] = [
  {
    title: "Document & Thesis Printing",
    items: [
      { name: "A4 Black & White Page", key: "a4-bw", unit: "page" },
      { name: "A4 Full Color Page", key: "a4-color", unit: "page" },
      { name: "A3 Large Black & White Page", key: "a3-bw", unit: "page" },
      { name: "A3 Large Full Color Page", key: "a3-color", unit: "page" },
      { name: "Standard Photo Printing", key: "photo-print", unit: "page" },
      { name: "Passport Photo Print Set", key: "passport-photo", unit: "8 photos" },
      { name: "Flex & Banner Printing", key: "banner-print", unit: "sq ft" },
    ],
  },
  {
    title: "Bindings & Finishing options",
    items: [
      { name: "Spiral Coil Binding", key: "binding-spiral", unit: "book" },
      { name: "Thermal Protective Lamination", key: "binding-lamination", unit: "sheet" },
    ],
  },
  {
    title: "Corporate Business Services",
    items: [
      { name: "Visiting Cards (350GSM Matte)", key: "visiting-cards", unit: "card (base)" },
      { name: "Company Letterheads (100GSM)", key: "letterheads", unit: "sheet" },
      { name: "A4 Flyers & Folded Brochures", key: "brochures", unit: "sheet" },
      { name: "Restaurant Menu Card Printing", key: "menu-print", unit: "copy" },
      { name: "Premium Invitation Cards", key: "invitation-print", unit: "card" },
      { name: "Corporate Gift Combo Sets", key: "corporate-gift", unit: "set" },
    ],
  },
  {
    title: "Customized Photo Gifts",
    items: [
      { name: "Ceramic Coffee Mug Printing", key: "mug-print", unit: "mug" },
      { name: "Color Changing Magic Mug", key: "magic-mug", unit: "mug" },
      { name: "Cotton Custom Graphic T-Shirt", key: "tshirt-print", unit: "shirt" },
      { name: "Heavyweight Fleece Hoodie", key: "hoodie-print", unit: "hoodie" },
      { name: "Cozy Cushion & Pillow Printing", key: "pillow-print", unit: "pillow" },
      { name: "Custom Mobile Cover Printing", key: "mobilecover-print", unit: "cover" },
      { name: "Personalized Acrylic Keychain", key: "keychain-print", unit: "keychain" },
      { name: "Custom Canvas Cap & Hat", key: "cap-print", unit: "cap" },
      { name: "Archival Canvas Frame Printing", key: "photoframe-print", unit: "canvas" },
      { name: "Custom Rubber Mousepad Printing", key: "mousepad-print", unit: "mousepad" },
    ],
  },
  {
    title: "Office & Typing Services",
    items: [
      { name: "High-Speed Document Scanning", key: "scanning", unit: "page" },
      { name: "Bulk Document Photocopy / Xerox", key: "xerox", unit: "page" },
      { name: "Custom Photo Wall Calendars", key: "calendar-print", unit: "calendar" },
      { name: "ATS Professional Resume Creation", key: "resume-creation", unit: "flat rate" },
    ],
  },
];

export default function PricingPage() {
  const [rates, setRates] = useState(DEFAULT_PRICING_CONFIG);
  const [activeOffers, setActiveOffers] = useState<OfferRecord[]>([]);

  useEffect(() => {
    setRates(getAdminRates());
    setActiveOffers(getActiveOffers());
  }, []);

  const getRate = (key: string) => rates[key as keyof typeof rates] ?? 0;

  const getDiscountedRate = (key: string): { original: number; discounted: number | null; offer: OfferRecord | null } => {
    const original = getRate(key);
    const offer = getBestOfferForService(key);
    if (!offer) return { original, discounted: null, offer: null };
    let discounted: number;
    if (offer.discountType === "percentage") {
      discounted = original * (1 - offer.discountValue / 100);
    } else {
      discounted = Math.max(0, original - offer.discountValue);
    }
    return { original, discounted: Math.round(discounted * 100) / 100, offer };
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 page-fade-in w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4">
            <Tag className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Transparent Pricing Guide</h1>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400">
            Real-time catalog pricing. Standard 18% GST applies to all services. High volume discounts are applied automatically at checkout.
          </p>
        </div>

        {/* Active Offers Banner */}
        {activeOffers.length > 0 && (
          <div className="mb-10 space-y-3">
            {activeOffers.map((offer) => (
              <div
                key={offer.id}
                className="glass-panel border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  {offer.discountType === "percentage" ? (
                    <Percent className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">{offer.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {offer.discountType === "percentage" ? `${offer.discountValue}% off` : `₹${offer.discountValue} off`}
                    {offer.applicableServiceIds.length === 0 ? " on all services" : ` on ${offer.applicableServiceIds.length} selected services`}
                    {" • "}
                    Valid till {new Date(offer.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                  <Sparkles className="h-3 w-3" /> LIVE OFFER
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-16">
          {SECTION_ITEMS.map((section, idx) => (
            <div key={idx} className="glass-panel border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white border-b border-zinc-150/40 dark:border-zinc-850/60 pb-3 flex items-center">
                <Check className="w-5 h-5 mr-2 text-indigo-500" />
                {section.title}
              </h2>

              <div className="space-y-4">
                {section.items.map((item, itemIdx) => {
                  const { original, discounted, offer } = getDiscountedRate(item.key);
                  const hasDiscount = discounted !== null;

                  return (
                    <div key={itemIdx} className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-900/60 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-zinc-600 dark:text-zinc-350 font-medium">{item.name}</span>
                        {hasDiscount && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                            {offer!.discountType === "percentage" ? `${offer!.discountValue}% OFF` : `₹${offer!.discountValue} OFF`}
                          </span>
                        )}
                      </div>
                      <div className="text-right flex items-center gap-2 flex-shrink-0">
                        {hasDiscount && (
                          <span className="text-xs text-zinc-400 line-through">₹{original.toFixed(2)}</span>
                        )}
                        <span className={`font-extrabold text-base ${hasDiscount ? "text-emerald-500" : "text-zinc-900 dark:text-white"}`}>
                          ₹{(hasDiscount ? discounted! : original).toFixed(2)}
                        </span>
                        <span className="text-xs text-zinc-400 font-normal">/{item.unit}</span>
                      </div>
                    </div>
                  );
                })}
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
