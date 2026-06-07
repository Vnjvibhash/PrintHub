"use client";

import React, { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FileUploader from "@/components/upload/FileUploader";
import { dbService } from "@/lib/firebase";
import { calculatePricing } from "@/lib/pricing";
import { ServiceItem, ServiceCategory, SpecificationOptions, PriceBreakdown } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Printer, 
  Layers, 
  Sparkles, 
  FileText, 
  Check, 
  ChevronRight, 
  DollarSign,
  Info,
  Settings,
  X,
  CreditCard
} from "lucide-react";

const CATEGORIES: { id: ServiceCategory; label: string; icon: any }[] = [
  { id: "printing", label: "Printing Services", icon: Printer },
  { id: "business", label: "Business Services", icon: Layers },
  { id: "merchandise", label: "Custom Merchandise", icon: Sparkles },
  { id: "documents", label: "Document Services", icon: FileText },
];

function ServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catParam = searchParams.get("category") as ServiceCategory;
  const initialCategory = CATEGORIES.some(c => c.id === catParam) ? catParam : "printing";

  const [activeCategory, setActiveCategory] = useState<ServiceCategory>(initialCategory);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Service Configuration State (For Modal)
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [pages, setPages] = useState<number>(1);
  const [copies, setCopies] = useState<number>(1);
  const [paperSize, setPaperSize] = useState<"A4" | "A3">("A4");
  const [colorMode, setColorMode] = useState<"bw" | "color">("bw");
  const [sides, setSides] = useState<"single" | "double">("single");
  const [binding, setBinding] = useState<"none" | "spiral" | "lamination">("none");
  const [quantity, setQuantity] = useState<number>(1); // General copies for standard items

  // File Upload State
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [uploadedFileMeta, setUploadedFileMeta] = useState<any>(null);

  // Live Pricing
  const [livePrice, setLivePrice] = useState<PriceBreakdown | null>(null);

  // Fetch Services
  useEffect(() => {
    async function loadServices() {
      try {
        const svcs = await dbService.getCollection<ServiceItem>("services");
        setServices(svcs);
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  // Update live pricing calculation
  useEffect(() => {
    if (!selectedService) return;

    const specs: SpecificationOptions = {
      paperSize,
      colorMode: selectedService.id.includes("color") ? "color" : colorMode,
      sides,
      binding,
      pages,
      copies,
    };

    const price = calculatePricing(selectedService.id, quantity, specs);
    setLivePrice(price);
  }, [selectedService, pages, copies, paperSize, colorMode, sides, binding, quantity]);

  const handleOpenConfigModal = (service: ServiceItem) => {
    // Check if custom merchandise, redirect to designer canvas directly
    if (service.category === "merchandise") {
      const type = service.id.replace("-print", "");
      router.push(`/customizer?type=${type}`);
      return;
    }

    setSelectedService(service);
    // Set some smart defaults based on service choice
    setPages(1);
    setCopies(1);
    setQuantity(1);
    setBinding("none");
    setUploadedFileUrl("");
    setUploadedFileMeta(null);

    if (service.id.includes("a3")) {
      setPaperSize("A3");
    } else {
      setPaperSize("A4");
    }

    if (service.id.includes("color")) {
      setColorMode("color");
    } else {
      setColorMode("bw");
    }
  };

  const handleUploadSuccess = (fileUrl: string, fileMetadata: { name: string; size: number; type: string }) => {
    setUploadedFileUrl(fileUrl);
    setUploadedFileMeta(fileMetadata);
  };

  const handleProceedToCheckout = () => {
    if (!selectedService || !livePrice) return;

    // Build specs payload
    const specs: SpecificationOptions = {
      paperSize,
      colorMode: selectedService.id.includes("color") ? "color" : colorMode,
      sides,
      binding,
      pages,
      copies,
      customImageUrl: uploadedFileUrl || undefined
    };

    const query = new URLSearchParams({
      serviceId: selectedService.id,
      qty: quantity.toString(),
      specs: JSON.stringify(specs),
      fileUrl: uploadedFileUrl,
      fileName: uploadedFileMeta?.name || "",
      fileSize: uploadedFileMeta?.size?.toString() || "0",
      fileType: uploadedFileMeta?.type || "",
    });

    setSelectedService(null);
    router.push(`/checkout?${query.toString()}`);
  };

  const filteredServices = services.filter(s => s.category === activeCategory);

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full page-fade-in">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">PrintHub Service Center</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          From fast high-volume black & white documents to custom visiting cards, typing assistance, and scanning.
        </p>
      </div>

      {/* Categories Tabs Selector */}
      <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-2xl max-w-2xl mx-auto border border-zinc-200/50 dark:border-zinc-800/80 mb-12 overflow-x-auto whitespace-nowrap">
        {CATEGORIES.map((cat) => {
          const CatIcon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <CatIcon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Services Grid layout */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((svc) => (
            <div 
              key={svc.id} 
              className="glass-panel border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-300 group shadow-md"
            >
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  {svc.name}
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[50px]">
                  {svc.description}
                </p>
                <div className="mt-4 border-t border-zinc-100 dark:border-zinc-900/60 pt-4 space-y-2">
                  {svc.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-zinc-600 dark:text-zinc-300">
                      <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-zinc-100 dark:border-zinc-900/50 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Base Rate</span>
                  <p className="text-base font-extrabold text-zinc-800 dark:text-zinc-100">
                    ₹{svc.basePrice.toFixed(2)}
                    {["printing", "documents"].includes(svc.category) && svc.id !== "resume-creation" && svc.id !== "passport-photo" ? <span className="text-xs text-zinc-400 font-normal">/pg</span> : ""}
                  </p>
                </div>
                
                <button
                  onClick={() => handleOpenConfigModal(svc)}
                  className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md hover:shadow-indigo-500/10 cursor-pointer"
                >
                  <span>{svc.category === "merchandise" ? "Design Studio" : "Order Print"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Configure Printing & Document specifications modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden my-8 page-fade-in max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <Settings className="w-5 h-5 text-indigo-500 animate-spin-slow" />
                <div>
                  <h3 className="font-extrabold text-zinc-950 dark:text-white text-sm sm:text-base">Configure specifications</h3>
                  <p className="text-[10px] text-zinc-400">{selectedService.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedService(null)}
                className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-grow">
              
              {/* File Upload Box */}
              {["printing", "documents"].includes(selectedService.category) && selectedService.id !== "resume-creation" && (
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Step 1: Upload Document File
                  </label>
                  <FileUploader 
                    onUploadSuccess={handleUploadSuccess}
                  />
                  {uploadedFileUrl ? (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Ready for checkout calculation.</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-zinc-400 flex items-center space-x-1">
                      <Info className="w-3.5 h-3.5" />
                      <span>File must be uploaded before completing checkout.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Specifications Controls Grid */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  {selectedService.category === "printing" ? "Step 2: Selection Options" : "Step 1: Configurations"}
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Total Pages (If printing/scans/photocopy) */}
                  {["printing", "documents"].includes(selectedService.category) && selectedService.id !== "resume-creation" && selectedService.id !== "passport-photo" && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Number of Pages in File</label>
                      <input
                        type="number"
                        min="1"
                        value={pages}
                        onChange={(e) => setPages(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-xs focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Copies count (If printing/scans/photocopy) */}
                  {["printing", "documents"].includes(selectedService.category) && selectedService.id !== "resume-creation" && selectedService.id !== "passport-photo" && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Number of Copies Needed</label>
                      <input
                        type="number"
                        min="1"
                        value={copies}
                        onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-xs focus:outline-none"
                      />
                    </div>
                  )}

                  {/* General quantity selector for other flat rate services */}
                  {(selectedService.id === "resume-creation" || selectedService.id === "passport-photo" || selectedService.category === "business") && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-xs focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Dimensions selection (Only standard prints) */}
                  {selectedService.category === "printing" && !selectedService.id.includes("photo") && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Paper Dimensions</label>
                      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200/40 dark:border-zinc-800/40">
                        <button
                          onClick={() => setPaperSize("A4")}
                          className={`flex-1 py-1 rounded text-xs font-semibold ${
                            paperSize === "A4" ? "bg-white dark:bg-zinc-850 text-indigo-500 shadow-sm" : "text-zinc-400"
                          }`}
                        >
                          A4 Standard
                        </button>
                        <button
                          onClick={() => setPaperSize("A3")}
                          className={`flex-1 py-1 rounded text-xs font-semibold ${
                            paperSize === "A3" ? "bg-white dark:bg-zinc-850 text-indigo-500 shadow-sm" : "text-zinc-400"
                          }`}
                        >
                          A3 Large Form
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ink Mode selection (Only standard prints) */}
                  {selectedService.category === "printing" && !selectedService.id.includes("photo") && !selectedService.id.includes("color") && !selectedService.id.includes("bw") && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Color Format</label>
                      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200/40 dark:border-zinc-800/40">
                        <button
                          onClick={() => setColorMode("bw")}
                          className={`flex-1 py-1 rounded text-xs font-semibold ${
                            colorMode === "bw" ? "bg-white dark:bg-zinc-850 text-indigo-500 shadow-sm" : "text-zinc-400"
                          }`}
                        >
                          Black & White
                        </button>
                        <button
                          onClick={() => setColorMode("color")}
                          className={`flex-1 py-1 rounded text-xs font-semibold ${
                            colorMode === "color" ? "bg-white dark:bg-zinc-850 text-indigo-500 shadow-sm" : "text-zinc-400"
                          }`}
                        >
                          Full Color
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Single vs Double Sided (Only prints) */}
                  {selectedService.category === "printing" && !selectedService.id.includes("photo") && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Sides Configuration</label>
                      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200/40 dark:border-zinc-800/40">
                        <button
                          onClick={() => setSides("single")}
                          className={`flex-1 py-1 rounded text-xs font-semibold ${
                            sides === "single" ? "bg-white dark:bg-zinc-850 text-indigo-500 shadow-sm" : "text-zinc-400"
                          }`}
                        >
                          Single-Sided
                        </button>
                        <button
                          onClick={() => setSides("double")}
                          className={`flex-1 py-1 rounded text-xs font-semibold ${
                            sides === "double" ? "bg-white dark:bg-zinc-850 text-indigo-500 shadow-sm" : "text-zinc-400"
                          }`}
                        >
                          Double-Sided
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Binding & Finishing selectors */}
                  {selectedService.category === "printing" && !selectedService.id.includes("photo") && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Binding & Finishing</label>
                      <select
                        value={binding}
                        onChange={(e) => setBinding(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none"
                      >
                        <option value="none">No Binding (Loose pages)</option>
                        <option value="spiral">Spiral Binding (+₹40)</option>
                        <option value="lamination">Thermal Lamination (+₹20)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Live Price Summary */}
              {livePrice && (
                <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl p-4 border border-zinc-200/40 dark:border-zinc-800/60 flex flex-col space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Base Unit Rate</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">₹{livePrice.base.toFixed(2)}</span>
                  </div>
                  {livePrice.optionsPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Additions (Binding / Finishing)</span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-200">+₹{livePrice.optionsPrice.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-400">
                      Calculated Sub-total 
                      {selectedService.id !== "resume-creation" && selectedService.id !== "passport-photo" && selectedService.category !== "business"
                        ? ` (${pages} ${pages === 1 ? 'pg' : 'pgs'} x ${copies} ${copies === 1 ? 'copy' : 'copies'})`
                        : ` (Qty: ${quantity})`}
                    </span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">₹{livePrice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-250/20 dark:border-zinc-800/80 pt-2 text-sm">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">Total Amount (incl. 18% GST)</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">₹{livePrice.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Action Footer */}
            <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 flex-shrink-0">
              <button
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold hover:bg-zinc-150 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToCheckout}
                disabled={["printing", "documents"].includes(selectedService.category) && selectedService.id !== "resume-creation" && !uploadedFileUrl}
                className="flex items-center space-x-2 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Confirm & Checkout</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center py-20">
          <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ServicesContent />
      </Suspense>
      <Footer />
    </>
  );
}
