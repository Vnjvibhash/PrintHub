"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FileText, ShieldAlert } from "lucide-react";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 page-fade-in text-zinc-600 dark:text-zinc-300 leading-relaxed">
        <div className="text-center mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Terms & Conditions</h1>
          <p className="mt-2 text-zinc-400 text-xs uppercase tracking-wider">Last updated: June 2026</p>
        </div>

        <div className="space-y-8 text-sm sm:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
              <span className="text-indigo-500 mr-2">1.</span> Acceptance of Terms
            </h2>
            <p>
              By accessing and using the PrintHub Services platform, you agree to comply with and be bound by these Terms and Conditions. If you do not agree to these terms, please do not upload files, utilize our customizer, or make checkouts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
              <span className="text-indigo-500 mr-2">2.</span> File Content & Intellectual Property
            </h2>
            <p>
              You maintain ownership of all text, data, photographs, and vector graphics uploaded to PrintHub. However, you represent and warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-500">
              <li>You own or have the explicit license to use the files submitted for binding, merchandise, or photocopying.</li>
              <li>The content does not violate copyright, trademark, privacy, or other intellectual property laws.</li>
              <li>The content does not contain hate speech, illegal depictions, or malicious scripts.</li>
            </ul>
            <p className="bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 p-4 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-start mt-2">
              <ShieldAlert className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>
                <strong>Warning:</strong> We reserve the right to cancel and refund any printing orders containing content that we deem illegal, copyrighted without permission, or violating our community guidelines.
              </span>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
              <span className="text-indigo-500 mr-2">3.</span> Print Proofs & Color Discrepancies
            </h2>
            <p>
              Please note that colors viewed on standard LED monitors (RGB format) may vary slightly from physical ink jets or thermal dye transfers (CMYK format) on cardstock, fabrics, and ceramic surfaces. We print file designs exactly as they are submitted; we are not responsible for spelling mistakes, resolution blurriness of low-DPI source images, or page margin mistakes set in your PDF document.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
              <span className="text-indigo-500 mr-2">4.</span> Payments, Fees & Taxes
            </h2>
            <p>
              All pricing calculated by our dynamic pricing calculator is subject to standard GST (18%) and processing fees. Payments must be completed and successfully captured (captured status in Stripe/Razorpay or validated transaction hash on UPI scans) before we begin the printing, designing, or custom merchandise binding steps.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
              <span className="text-indigo-500 mr-2">5.</span> Refund & Cancellation Policy
            </h2>
            <p>
              Because printing and custom merchandise are bespoke, customized products, orders cannot be cancelled or refunded once the status has transitioned to <strong>"Processing"</strong>, <strong>"Designing"</strong>, or <strong>"Printing"</strong>. If your order remains in <strong>"Pending"</strong> state, you can request a cancellation via support.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
