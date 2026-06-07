"use client";

import React from "react";
import Link from "next/link";
import { Printer, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const servicesLinks = [
    { name: "Document Printing", href: "/services" },
    { name: "Custom T-Shirts", href: "/customizer?type=tshirt" },
    { name: "Custom Mugs", href: "/customizer?type=mug" },
    { name: "Business Cards", href: "/services" },
  ];

  const supportLinks = [
    { name: "Track Order", href: "/track" },
    { name: "Pricing Guide", href: "/pricing" },
    { name: "FAQs", href: "/faq" },
    { name: "Contact Us", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
  ];

  return (
    <footer className="bg-zinc-50 dark:bg-[#040406] border-t border-zinc-200 dark:border-zinc-800/80 transition-colors mt-auto z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
              <Printer className="h-6 w-6" />
              <span>Print<span className="text-zinc-900 dark:text-white">Hub</span></span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Your one-stop web platform for digital printing, bulk business cards, thesis layout bindings, and customized photo gifts.
            </p>
            <div className="text-xs text-zinc-400">
              <span className="font-semibold">GSTIN:</span> 27AAAAA1111A1Z1
            </div>
          </div>

          {/* Column 2: Popular Services */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-2.5">
              {servicesLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Support */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <div className="flex items-start space-x-2.5 text-sm text-zinc-500 dark:text-zinc-400">
              <MapPin className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
              <span>102, Digital Towers, Sector 62, Noida, UP - 201301</span>
            </div>
            <div className="flex items-center space-x-2.5 text-sm text-zinc-500 dark:text-zinc-400">
              <Mail className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0" />
              <a href="mailto:support@printhub.com" className="hover:underline">support@printhub.com</a>
            </div>
            <div className="flex items-center space-x-2.5 text-sm text-zinc-500 dark:text-zinc-400">
              <Phone className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0" />
              <a href="tel:+919876543210" className="hover:underline">+91 98765 43210</a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-200 dark:border-zinc-800/80 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-400 space-y-4 md:space-y-0">
          <div>
            &copy; {currentYear} PrintHub Services. All rights reserved.
          </div>
          <div className="flex space-x-6">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="hover:text-indigo-500 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
