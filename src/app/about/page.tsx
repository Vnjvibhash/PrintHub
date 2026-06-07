"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Printer, Users, Award, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  const cards = [
    { icon: Printer, title: "State-of-the-Art Press", desc: "Equipped with high-performance digital laser presses and thermal transfer merchandise printing hardware." },
    { icon: Users, title: "Customer Oriented", desc: "Designed for seamless self-service document uploading, instant tracking, and transparent dynamic pricing charts." },
    { icon: Award, title: "Premium Finishes", desc: "From heavy-gauge plastic coil bindings to protective matte laminations, we deliver corporate-grade materials." },
    { icon: ShieldCheck, title: "Encrypted Backends", desc: "Your PDF thesis or design files are uploaded via secure streams and deleted automatically in 15 days." }
  ];

  return (
    <>
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 page-fade-in w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">About PrintHub Services</h1>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm sm:text-base">
            Founded in 2026, PrintHub Services was established to modernize local photocopying and merchandise custom gifts. We eliminate queue delays and hidden charges with our self-service upload portal and transparent dynamic pricing engine.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="glass-panel border-white/5 rounded-2xl p-6 hover:translate-y-[-2px] transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/5 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{card.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Mission Statement */}
        <div className="glass-panel border-indigo-500/15 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full" />
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">Our Quality Guarantee</h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Every document is printed on executive 75-80GSM bond papers or premium 350GSM glossy boards. If your spiral bound manuals or customized magic mugs have printing errors caused by our hardware, we promise a rapid review and instant re-prints or full credits.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
