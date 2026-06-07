"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { dbService } from "@/lib/firebase";
import { Order, OrderStatus } from "@/types";
import { Search, Printer, CheckCircle, Package, Clock, Truck, ClipboardList, ShieldAlert, ArrowLeft } from "lucide-react";

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
  { status: "Pending", label: "Pending", desc: "Awaiting checkout confirmation or payment capture.", icon: Clock },
  { status: "Payment Received", label: "Payment Capture", desc: "Payment successfully captured and verified.", icon: ClipboardList },
  { status: "Processing", label: "Processing", desc: "Order details reviewed and queued in systems.", icon: Package },
  { status: "Designing", label: "Design Overlay", desc: "Mockups compiled or canvas customizer layout exported.", icon: Printer },
  { status: "Printing", label: "Print Queue", desc: "Ink channels printing on paper or merchandise fabrics.", icon: Printer },
  { status: "Ready for Pickup", label: "Ready for Collection", desc: "Printers completed. Packaged and waiting at hub.", icon: CheckCircle },
  { status: "Shipped", label: "Shipped", desc: "Courier package handed over to logistics partners.", icon: Truck },
  { status: "Delivered", label: "Delivered", desc: "Successfully delivered. File storage schedules auto-deleted.", icon: CheckCircle }
];

function TrackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id") || "";

  const [orderIdInput, setOrderIdInput] = useState(idParam);
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleSearch = async (targetId: string) => {
    if (!targetId.trim()) return;
    setSearched(true);
    setErrorText("");
    setOrder(null);

    try {
      // Look up in orders collection
      const matched = await dbService.getDocument<Order>("orders", targetId.trim().toUpperCase());
      if (matched) {
        setOrder(matched);
      } else {
        setErrorText("No order found matching this Order ID.");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Failed to retrieve order status.");
    }
  };

  // Sync Search on Load if ID param exists
  useEffect(() => {
    if (idParam) {
      handleSearch(idParam);
    }
  }, [idParam]);

  const getCurrentStepIndex = (): number => {
    if (!order) return -1;
    if (order.orderStatus === "Cancelled") return -1;
    return STATUS_STEPS.findIndex((s) => s.status === order.orderStatus);
  };

  const currentStepIdx = getCurrentStepIndex();

  return (
    <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 page-fade-in w-full">
      {/* Search Bar header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Track Your Order</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Enter your PrintHub Order ID (e.g. PH-9821) to check its live manufacturing status.
        </p>

        {/* Input Form */}
        <div className="mt-6 flex max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-2xl shadow-sm focus-within:border-indigo-500 transition">
          <input
            type="text"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(orderIdInput)}
            placeholder="PH-XXXX"
            className="flex-grow bg-transparent px-4 py-2 text-sm focus:outline-none uppercase tracking-widest font-mono font-bold"
          />
          <button
            onClick={() => handleSearch(orderIdInput)}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Error Output */}
      {searched && errorText && (
        <div className="glass-panel border-rose-500/20 bg-rose-500/5 rounded-2xl p-6 text-center max-w-md mx-auto space-y-2">
          <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto animate-pulse" />
          <h3 className="font-bold text-rose-800 dark:text-rose-400">Order Not Found</h3>
          <p className="text-xs text-rose-600/70 dark:text-rose-450/70">{errorText}</p>
        </div>
      )}

      {/* Stepper Status tracker */}
      {order && (
        <div className="space-y-8">
          {/* Summary Box */}
          <div className="glass-panel border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">Status Summary</span>
              <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white flex items-center">
                Order: <span className="font-mono text-indigo-500 ml-1">{order.id}</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Service item: <strong className="text-zinc-800 dark:text-zinc-200">{order.serviceName}</strong> (Qty: {order.quantity})
              </p>
              {order.orderStatus === "Cancelled" ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-450">
                  Order Cancelled
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  Current Stage: {order.orderStatus}
                </span>
              )}
            </div>
            
            <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 text-xs text-zinc-500 space-y-2">
              <div className="flex justify-between">
                <span>Customer Email:</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">{order.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment captured:</span>
                <span className="font-semibold text-emerald-500">Completed ({order.paymentMethod.toUpperCase()})</span>
              </div>
              <div className="flex justify-between">
                <span>Receipt total:</span>
                <span className="font-extrabold text-zinc-800 dark:text-zinc-100">₹{order.priceBreakdown.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Stepper Steps (Only if not Cancelled) */}
          {order.orderStatus !== "Cancelled" && (
            <div className="glass-panel border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
              <h3 className="font-bold text-base text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-900 pb-3">Status Pipeline</h3>
              
              <div className="relative pl-8 border-l border-zinc-150 dark:border-zinc-850 space-y-8">
                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx < currentStepIdx;
                  const isActive = idx === currentStepIdx;
                  const isFuture = idx > currentStepIdx;

                  return (
                    <div key={idx} className="relative">
                      {/* Step Indicator Dot */}
                      <span className={`absolute left-[-42px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                        isCompleted 
                          ? "bg-emerald-500 border-emerald-600 text-white" 
                          : isActive
                          ? "bg-indigo-600 border-indigo-700 text-white animate-pulse"
                          : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                      }`}>
                        {isCompleted ? "✓" : idx + 1}
                      </span>

                      {/* Step Contents */}
                      <div className="space-y-1">
                        <h4 className={`text-sm font-bold flex items-center ${
                          isActive 
                            ? "text-indigo-600 dark:text-indigo-400" 
                            : isCompleted 
                            ? "text-zinc-800 dark:text-zinc-200" 
                            : "text-zinc-400"
                        }`}>
                          <Icon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                          {step.label}
                        </h4>
                        <p className="text-xs text-zinc-400 max-w-xl">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default function TrackPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center py-20">
          <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <TrackContent />
      </Suspense>
      <Footer />
    </>
  );
}
