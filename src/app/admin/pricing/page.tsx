"use client";

import React, { useState, useEffect } from "react";
import { DEFAULT_PRICING_CONFIG, getAdminRates } from "@/lib/pricing";
import {
  Save,
  RotateCcw,
  DollarSign,
  Check,
  AlertTriangle,
} from "lucide-react";

const RATE_GROUPS = [
  {
    title: "Document & Thesis Printing",
    items: [
      { key: "a4-bw", label: "A4 Black & White Page", unit: "page" },
      { key: "a4-color", label: "A4 Full Color Page", unit: "page" },
      { key: "a3-bw", label: "A3 B&W Page", unit: "page" },
      { key: "a3-color", label: "A3 Color Page", unit: "page" },
      { key: "photo-print", label: "Photo Print", unit: "page" },
      { key: "passport-photo", label: "Passport Photo Set", unit: "set" },
      { key: "banner-print", label: "Flex/Banner Print", unit: "sq ft" },
    ],
  },
  {
    title: "Bindings & Finishing",
    items: [
      { key: "binding-spiral", label: "Spiral Binding", unit: "book" },
      { key: "binding-lamination", label: "Thermal Lamination", unit: "sheet" },
    ],
  },
  {
    title: "Document Services",
    items: [
      { key: "scanning", label: "Document Scanning", unit: "page" },
      { key: "xerox", label: "Xerox/Photocopy", unit: "page" },
      { key: "resume-creation", label: "Resume Writing", unit: "flat" },
    ],
  },
  {
    title: "Custom Merchandise",
    items: [
      { key: "mug-print", label: "Ceramic Mug", unit: "mug" },
      { key: "magic-mug", label: "Magic Mug", unit: "mug" },
      { key: "tshirt-print", label: "T-Shirt", unit: "shirt" },
      { key: "hoodie-print", label: "Hoodie", unit: "hoodie" },
      { key: "pillow-print", label: "Cushion/Pillow", unit: "pillow" },
      { key: "mobilecover-print", label: "Mobile Cover", unit: "cover" },
      { key: "keychain-print", label: "Keychain", unit: "keychain" },
      { key: "cap-print", label: "Cap/Hat", unit: "cap" },
      { key: "photoframe-print", label: "Canvas Frame", unit: "canvas" },
      { key: "mousepad-print", label: "Mousepad", unit: "mousepad" },
    ],
  },
  {
    title: "Corporate Business",
    items: [
      { key: "visiting-cards", label: "Visiting Cards", unit: "card" },
      { key: "letterheads", label: "Letterheads", unit: "sheet" },
      { key: "brochures", label: "Flyers/Brochures", unit: "sheet" },
      { key: "menu-print", label: "Menu Card", unit: "copy" },
      { key: "invitation-print", label: "Invitation Card", unit: "card" },
      { key: "calendar-print", label: "Calendar", unit: "calendar" },
      { key: "corporate-gift", label: "Gift Combo Set", unit: "set" },
    ],
  },
];

export default function AdminPricingPage() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const currentRates = getAdminRates();
    setRates(currentRates);
  }, []);

  const updateRate = (key: string, value: number) => {
    setRates((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = () => {
    const settingsRaw = localStorage.getItem("printhub_db_settings");
    let settings: any = {};
    if (settingsRaw) {
      try { settings = JSON.parse(settingsRaw); } catch {}
    }
    settings.rates = rates;
    localStorage.setItem("printhub_db_settings", JSON.stringify(settings));
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setRates({ ...DEFAULT_PRICING_CONFIG });
    setHasChanges(true);
    setSaved(false);
  };

  const getDefaultRate = (key: string) => {
    return DEFAULT_PRICING_CONFIG[key as keyof typeof DEFAULT_PRICING_CONFIG] ?? 0;
  };

  const isModified = (key: string) => {
    return rates[key] !== getDefaultRate(key);
  };

  return (
    <div className="space-y-6 page-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Pricing Manager</h1>
          <p className="text-sm text-zinc-500 mt-1">Edit service rates. Changes affect checkout calculations and the public pricing page.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-400 hover:text-white transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20 disabled:opacity-40"
          >
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Notification */}
      {hasChanges && (
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-zinc-400">
            <span className="text-amber-400 font-bold">Unsaved changes.</span> Click "Save Changes" to apply your new rates to all live calculations.
          </p>
        </div>
      )}

      {/* Pricing Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {RATE_GROUPS.map((group) => (
          <div key={group.title} className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-indigo-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">{group.title}</h2>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {group.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition">
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${isModified(item.key) ? "text-indigo-400" : "text-zinc-300"}`}>
                      {item.label}
                      {isModified(item.key) && <span className="ml-1.5 text-[9px] text-indigo-500 font-bold">MODIFIED</span>}
                    </p>
                    <p className="text-[10px] text-zinc-600">
                      Default: ₹{getDefaultRate(item.key).toFixed(2)}/{item.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={rates[item.key] ?? 0}
                      onChange={(e) => updateRate(item.key, parseFloat(e.target.value) || 0)}
                      className={`w-24 px-3 py-1.5 rounded-lg text-right text-xs font-bold focus:outline-none transition ${
                        isModified(item.key)
                          ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
                          : "bg-white/[0.03] border border-white/5 text-zinc-200"
                      }`}
                    />
                    <span className="text-[10px] text-zinc-600 w-14">/{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
