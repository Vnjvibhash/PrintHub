"use client";

import React, { useState, useEffect } from "react";
import { dbService, isFirebaseEnabled } from "@/lib/firebase";
import {
  Save,
  Check,
  Building2,
  Mail,
  FileText,
  CreditCard,
  Percent,
  RotateCcw,
  AlertTriangle,
  Shield,
} from "lucide-react";

interface SettingsData {
  companyName: string;
  companyAddress: string;
  gstNumber: string;
  contactEmail: string;
  upiId: string;
  taxRate: number;
}

const DEFAULT_SETTINGS: SettingsData = {
  companyName: "PrintHub Services Ltd.",
  companyAddress: "102, Digital Towers, Sector 62, Noida, UP - 201301",
  gstNumber: "27AAAAA1111A1Z1",
  contactEmail: "support@printhub.com",
  upiId: "pay.printhub@okaxis",
  taxRate: 18,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("printhub_db_settings");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSettings({
          companyName: parsed.companyName || DEFAULT_SETTINGS.companyName,
          companyAddress: parsed.companyAddress || DEFAULT_SETTINGS.companyAddress,
          gstNumber: parsed.gstNumber || DEFAULT_SETTINGS.gstNumber,
          contactEmail: parsed.contactEmail || DEFAULT_SETTINGS.contactEmail,
          upiId: parsed.upiId || DEFAULT_SETTINGS.upiId,
          taxRate: parsed.taxRate ?? DEFAULT_SETTINGS.taxRate,
        });
      } catch {}
    }
  }, []);

  const updateField = (field: keyof SettingsData, value: string | number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = () => {
    const raw = localStorage.getItem("printhub_db_settings");
    let existing: any = {};
    if (raw) {
      try { existing = JSON.parse(raw); } catch {}
    }
    const merged = { ...existing, ...settings };
    localStorage.setItem("printhub_db_settings", JSON.stringify(merged));
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings({ ...DEFAULT_SETTINGS });
    setHasChanges(true);
    setSaved(false);
  };

  const fields: {
    key: keyof SettingsData;
    label: string;
    icon: any;
    type: string;
    placeholder: string;
    description: string;
  }[] = [
    {
      key: "companyName",
      label: "Company Name",
      icon: Building2,
      type: "text",
      placeholder: "PrintHub Services Ltd.",
      description: "Appears on invoices, receipts, and email communications.",
    },
    {
      key: "companyAddress",
      label: "Company Address",
      icon: Building2,
      type: "text",
      placeholder: "102, Digital Towers, Sector 62, Noida, UP - 201301",
      description: "Full registered office address for invoice and GST compliance.",
    },
    {
      key: "gstNumber",
      label: "GST Registration Number",
      icon: FileText,
      type: "text",
      placeholder: "27AAAAA1111A1Z1",
      description: "15-digit GSTIN displayed on all tax invoices.",
    },
    {
      key: "contactEmail",
      label: "Support Email",
      icon: Mail,
      type: "email",
      placeholder: "support@printhub.com",
      description: "Primary contact email for customer inquiries.",
    },
    {
      key: "upiId",
      label: "UPI Payment ID",
      icon: CreditCard,
      type: "text",
      placeholder: "pay.printhub@okaxis",
      description: "UPI VPA used for QR code payment at checkout.",
    },
    {
      key: "taxRate",
      label: "GST Tax Rate (%)",
      icon: Percent,
      type: "number",
      placeholder: "18",
      description: "Standard GST percentage applied to all orders. Default: 18%.",
    },
  ];

  return (
    <div className="space-y-6 page-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Business Settings</h1>
          <p className="text-sm text-zinc-500 mt-1">Configure company details, tax rates, and payment settings.</p>
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
            onClick={async () => {
              if (!isFirebaseEnabled) return;
              setSeeding(true);
              setSeedMessage(null);
              try {
                await dbService.seedDefaultData();
                setSeedMessage("Firebase seeding complete. Default data has been written.");
              } catch (err) {
                console.error(err);
                setSeedMessage("Unable to seed Firebase. Check console and Firebase config.");
              } finally {
                setSeeding(false);
              }
            }}
            disabled={!isFirebaseEnabled || seeding}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/10 text-xs font-bold text-emerald-300 hover:text-white hover:bg-emerald-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${seeding ? "animate-spin" : ""}`} />
            {seeding ? "Seeding Firebase..." : "Seed Firebase Data"}
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20 disabled:opacity-40"
          >
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>

      {seedMessage && (
        <div className="rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-zinc-200">
          {seedMessage}
        </div>
      )}

      {/* Unsaved warning */}
      {hasChanges && (
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-zinc-400">
            <span className="text-amber-400 font-bold">Unsaved changes.</span> Click "Save Settings" to persist your configuration.
          </p>
        </div>
      )}

      {/* Settings Form */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 divide-y divide-white/[0.03]">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.key} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.01] transition">
              <div className="flex items-start gap-3 sm:w-1/3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-200">{field.label}</p>
                  <p className="text-[10px] text-zinc-600 leading-relaxed mt-0.5">{field.description}</p>
                </div>
              </div>
              <div className="sm:flex-1">
                <input
                  type={field.type}
                  value={settings[field.key]}
                  onChange={(e) =>
                    updateField(
                      field.key,
                      field.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value
                    )
                  }
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30 transition"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
            <Shield className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-200 mb-1">Data Storage</h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              All settings are saved to the hybrid Firebase/localStorage data layer. When Firebase is configured,
              changes sync to Firestore automatically. In mock mode, settings persist in your browser&apos;s
              localStorage. These values are used across invoice generation, pricing calculations, and checkout flows.
            </p>
            {!isFirebaseEnabled && (
              <p className="text-[11px] text-rose-400 mt-3">
                Firebase is not enabled. Set your Firebase environment variables and restart the app to seed data.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
