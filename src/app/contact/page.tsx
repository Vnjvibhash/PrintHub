"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  return (
    <>
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 page-fade-in w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Have a bulk corporate order? Need assistance with binding specs? Get in touch with our printing experts today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="glass-panel border-white/5 rounded-2xl p-8 space-y-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Our Printing Hub</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Visit our physical store for paper proofing, standard laminations, scanning services, or picking up urgent orders.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3.5 text-zinc-600 dark:text-zinc-300">
                  <MapPin className="h-6 w-6 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Store Address</p>
                    <p className="text-xs text-zinc-400 mt-1">102, Digital Towers, Sector 62, Noida, UP - 201301</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 text-zinc-600 dark:text-zinc-300">
                  <Mail className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Support Email</p>
                    <a href="mailto:support@printhub.com" className="text-xs text-zinc-400 hover:text-indigo-500 mt-1 block">
                      support@printhub.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 text-zinc-600 dark:text-zinc-300">
                  <Phone className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Customer Helpline</p>
                    <a href="tel:+919876543210" className="text-xs text-zinc-400 hover:text-indigo-500 mt-1 block">
                      +91 98765 43210
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Mock map embed representing our location */}
            <div className="glass-panel border-white/5 rounded-2xl p-1 h-56 overflow-hidden relative group">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500')" }} />
              <div className="absolute inset-0 bg-zinc-950/60 flex items-center justify-center text-center p-4">
                <div className="space-y-1">
                  <MapPin className="h-8 w-8 text-indigo-400 mx-auto animate-bounce" />
                  <p className="text-xs text-white font-bold">PrintHub Noida Center</p>
                  <p className="text-[10px] text-zinc-400">Sector 62, Metro Station Exit 2</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="glass-panel border-white/5 rounded-2xl p-8 relative">
              {isSubmitted ? (
                <div className="text-center py-16 space-y-4">
                  <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto animate-bounce" />
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Message Sent Successfully</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                    Thank you for contacting us! Our team will review your inquiry and respond to your email address shortly.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Send an Inquiry</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5" htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5" htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5" htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="Bulk printing inquiry / customized gift orders"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5" htmlFor="message">Detailed Message</label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                      placeholder="Detail your file formats, copy quantities, double-side options, or design requirements..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
