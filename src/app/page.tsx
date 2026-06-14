"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroCarousel from "@/components/home/HeroCarousel";
import { motion } from "framer-motion";
import { 
  Upload, 
  ShoppingBag, 
  ArrowRight, 
  Printer, 
  CreditCard, 
  CheckCircle,
  TrendingUp, 
  Star,
  Layers,
  Sparkles,
  Zap
} from "lucide-react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }
  };

  const services = [
    { id: "a4-print", title: "A4 Document Printing", desc: "Color & B/W, single or double-sided. Perfect for reports, resumes, and study materials.", icon: Printer, price: "₹2/page", tag: "Most Popular", color: "indigo" },
    { id: "visiting-cards", title: "Visiting & Business Cards", desc: "Premium 350GSM cardstock business cards with custom finishes and designs.", icon: Layers, price: "₹1.50/card", tag: "Corporate", color: "emerald" },
    { id: "tshirt-print", title: "Custom T-Shirt Printing", desc: "High-quality DTF printing on soft, breathable combed cotton apparel.", icon: Sparkles, price: "₹350/unit", tag: "Trending", color: "purple" },
    { id: "mug-print", title: "Customized Coffee Mugs", desc: "Archival print ceramic mugs and heat-sensitive color-changing magic mugs.", icon: ShoppingBag, price: "₹150/unit", tag: "Hot Gift", color: "amber" }
  ];

  const workflowSteps = [
    { number: "01", title: "Choose Your Service", desc: "Select from standard prints, business stationery, or custom merch.", icon: Printer },
    { number: "02", title: "Upload Design or Files", desc: "Drag and drop your PDF, DOCX, PNG, or JPEG. Use our live customizer.", icon: Upload },
    { number: "03", title: "Instant Payment", desc: "Secure checkout using Stripe, Razorpay, or scans with UPI QR.", icon: CreditCard },
    { number: "04", title: "Track & Collect", desc: "Get real-time SMS/email status alerts as your order progresses.", icon: CheckCircle }
  ];

  const testimonials = [
    { name: "Rahul Verma", role: "PhD Scholar", review: "Printed my complete doctoral thesis here. The spiral binding is sturdy and A4 color page quality is stellar. Finished in less than 2 hours!", rating: 5 },
    { name: "Sneha Kapoor", role: "Brand Manager", review: "Ordered 500 visiting cards and customized hoodies for our startup crew. Colors match our branding exactly and prints are very durable.", rating: 5 },
    { name: "Amit Joshi", role: "Gift Shop Owner", review: "The Magic Mugs are a bestseller. The transition is smooth and prints look premium. The bulk billing tools make tracking payments a breeze.", rating: 5 }
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Popular Services Section */}
      <section className="py-20 bg-zinc-50/50 dark:bg-zinc-950/20 border-y border-zinc-100 dark:border-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Popular Services
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
              Select one of our premium services and customize specifications in seconds.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {services.map((svc) => {
              const IconComponent = svc.icon;
              return (
                <motion.div
                  key={svc.id}
                  variants={itemVariants}
                  className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        {svc.tag}
                      </span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{svc.price}</span>
                    </div>
                    <div className="mt-5 w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/5 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">{svc.title}</h3>
                    <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{svc.desc}</p>
                  </div>
                  
                  <div className="mt-6">
                    <Link
                      href={svc.id.includes("print") && !svc.id.includes("mug") ? "/services" : `/customizer?type=${svc.id.includes("mug") ? "mug" : "tshirt"}`}
                      className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      <span>Order Now</span>
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Simple 4-Step Process
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
            Getting your digital prints or customized merchandise is easier than ever.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {workflowSteps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <div key={idx} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                  <IconComponent className="h-7 w-7" />
                </div>
                <span className="absolute top-2 left-1/2 translate-x-4 text-xs font-bold text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">{step.number}</span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[240px]">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Pricing Summary Section */}
      <section className="py-20 bg-zinc-50/50 dark:bg-zinc-950/20 border-y border-zinc-100 dark:border-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                Dynamic Live Calculator
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Transparent Pricing Engine
              </h2>
              <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                We calculate pricing in real-time based on pages, paper sizes, color formats, and bindings. No hidden costs or bulk surprises.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                  <CheckCircle className="h-4.5 w-4.5 text-indigo-500" />
                  <span>A4 BW Page: ₹2.00 | A4 Color Page: ₹10.00</span>
                </div>
                <div className="flex items-center space-x-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                  <CheckCircle className="h-4.5 w-4.5 text-indigo-500" />
                  <span>A3 BW Page: ₹5.00 | A3 Color Page: ₹20.00</span>
                </div>
                <div className="flex items-center space-x-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                  <CheckCircle className="h-4.5 w-4.5 text-indigo-500" />
                  <span>Custom Mugs from ₹150.00 | Cotton T-Shirts from ₹350.00</span>
                </div>
              </div>
              <div className="pt-4">
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                >
                  View Full Price Chart
                </Link>
              </div>
            </div>
            
            <div className="lg:col-span-7">
              <div className="glass-panel border-white/10 dark:bg-zinc-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-xl rounded-full" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-4">Quick Price Estimator</h3>
                <div className="space-y-4 mt-6 text-sm text-zinc-600 dark:text-zinc-300">
                  <div>
                    <label className="block font-semibold mb-1 text-xs uppercase tracking-wider text-zinc-400">Paper Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="px-4 py-2.5 rounded-xl border border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-center font-medium cursor-pointer">A4 Document</div>
                      <div className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center font-medium hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer">A3 Large Form</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1 text-xs uppercase tracking-wider text-zinc-400">Color format</label>
                      <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl">
                        <div className="flex-1 py-1.5 text-center bg-white dark:bg-zinc-900 rounded-lg shadow-sm font-medium cursor-pointer text-xs">B / W</div>
                        <div className="flex-1 py-1.5 text-center font-medium cursor-pointer text-zinc-400 text-xs">Color</div>
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-xs uppercase tracking-wider text-zinc-400">Binding Option</label>
                      <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl">
                        <div className="flex-1 py-1.5 text-center bg-white dark:bg-zinc-900 rounded-lg shadow-sm font-medium cursor-pointer text-xs">None</div>
                        <div className="flex-1 py-1.5 text-center font-medium cursor-pointer text-zinc-400 text-xs">Spiral</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-950/50 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 mt-8">
                    <div>
                      <span className="text-xs text-zinc-400">Estimated Subtotal (100 Copies)</span>
                      <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">₹200.00</p>
                    </div>
                    <Link href="/services" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700">Calculate Custom Specs</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Customer Reviews
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
            See what students, business managers, and retail users say about our service.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <div key={idx} className="glass-panel border-white/5 rounded-2xl p-6 relative">
              <div className="flex items-center space-x-1 text-amber-500">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 italic leading-relaxed">
                "{test.review}"
              </p>
              <div className="mt-6 border-t border-zinc-100 dark:border-zinc-900/50 pt-4 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/10 flex items-center justify-center font-bold text-indigo-600 text-sm">
                  {test.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{test.name}</h4>
                  <p className="text-xs text-zinc-400">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
