"use client";

import React, { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCustomizer from "@/components/customizer/ProductCustomizer";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";

function CustomizerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Accept default merchandise type via URL parameters (e.g., /customizer?type=mug)
  const defaultTypeParam = searchParams.get("type") || "tshirt";
  const allowedTypes = ["tshirt", "hoodie", "mug", "pillow", "cap", "mousepad", "keychain", "mobilecover", "photoframe"];
  const type = allowedTypes.includes(defaultTypeParam)
    ? (defaultTypeParam as any)
    : "tshirt";

  const handleAddToCart = (data: any) => {
    // Route customer directly to checkout page with design specs in URL queries
    const query = new URLSearchParams({
      serviceId: data.serviceId,
      qty: data.quantity.toString(),
      specs: JSON.stringify(data.specifications),
    });
    router.push(`/checkout?${query.toString()}`);
  };

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full page-fade-in">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          PrintHub Designer Studio
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Custom Merchandise Canvas</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Upload custom logos, add text overlay, change fabric color, and see your live 3D preview mockup.
        </p>
      </div>

      <ProductCustomizer 
        initialType={type}
        onAddToCart={handleAddToCart}
      />
    </main>
  );
}

export default function CustomizerPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center py-20">
          <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <CustomizerContent />
      </Suspense>
      <Footer />
    </>
  );
}
