"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/components/providers/AuthProvider";
import { calculatePricing } from "@/lib/pricing";
import { dbService } from "@/lib/firebase";
import { generateInvoicePDF } from "@/lib/invoice";
import { Order, SpecificationOptions, PriceBreakdown } from "@/types";
import { CreditCard, CheckCircle, Smartphone, MapPin, ChevronRight, FileText, Download, Printer } from "lucide-react";
import QRCode from "qrcode";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Read URL query parameters
  const serviceId = searchParams.get("serviceId");
  const qtyParam = searchParams.get("qty");
  const specsParam = searchParams.get("specs");
  
  // File details
  const fileUrl = searchParams.get("fileUrl") || "";
  const fileName = searchParams.get("fileName") || "";
  const fileSize = Number(searchParams.get("fileSize") || "0");
  const fileType = searchParams.get("fileType") || "";

  const [serviceName, setServiceName] = useState("Custom Printing Order");
  const [serviceCategory, setServiceCategory] = useState<any>("printing");
  const [quantity, setQuantity] = useState(1);
  const [specs, setSpecs] = useState<SpecificationOptions>({});
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "razorpay" | "upi">("stripe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [upiQrDataUrl, setUpiQrDataUrl] = useState("");
  
  // Completed Order state
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Initialize checkout configuration and keep price calculations up to date
  useEffect(() => {
    if (!serviceId) {
      router.push("/services");
      return;
    }

    async function loadService() {
      const service = await dbService.getDocument<any>("services", serviceId!);
      if (service) {
        setServiceName(service.name);
        setServiceCategory(service.category);
      }
    }
    loadService();

    const q = Math.max(1, Number(qtyParam) || 1);
    setQuantity(q);

    let parsedSpecs: SpecificationOptions = {};
    if (specsParam) {
      try {
        parsedSpecs = JSON.parse(specsParam);
      } catch (err) {
        console.error("Failed to parse specifications:", err);
      }
    }
    setSpecs(parsedSpecs);
  }, [serviceId, qtyParam, specsParam, router]);

  useEffect(() => {
    if (!serviceId) return;
    const price = calculatePricing(serviceId, quantity, specs);
    setPriceBreakdown(price);
  }, [serviceId, quantity, specs]);

  // Autocomplete if user is authenticated
  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setName(user.displayName);
      if (user.addresses && user.addresses.length > 0) {
        const addr = user.addresses[0];
        setStreet(addr.street);
        setCity(addr.city);
        setState(addr.state);
        setZipCode(addr.zipCode);
        setPhone(addr.phone);
      }
    }
  }, [user]);

  // Generate UPI QR Code URL when payment method is UPI
  useEffect(() => {
    if (paymentMethod === "upi" && priceBreakdown) {
      const upiString = `upi://pay?pa=pay.printhub@okaxis&pn=PrintHub%20Services&am=${priceBreakdown.total}&cu=INR&tn=PRINTHUB-ORDER`;
      QRCode.toDataURL(upiString, { width: 200, margin: 1 })
        .then((url) => setUpiQrDataUrl(url))
        .catch((err) => console.error("QR generation failed:", err));
    }
  }, [paymentMethod, priceBreakdown]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceBreakdown) return;

    if (paymentMethod === "upi") {
      setIsUpiModalOpen(true);
      return;
    }

    setIsProcessing(true);

    // Simulate Payment Capture delay for Stripe/Razorpay
    setTimeout(async () => {
      await processOrderCreation(`pay_gate_${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
    }, 2000);
  };

  const handleUpiPaymentConfirm = async () => {
    setIsUpiModalOpen(false);
    setIsProcessing(true);
    setTimeout(async () => {
      await processOrderCreation(`pay_upi_${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
    }, 1500);
  };

  const processOrderCreation = async (transactionId: string) => {
    if (!priceBreakdown || !serviceId) return;

    const newOrderId = `PH-${Math.floor(1000 + Math.random() * 9000)}`;
    const filesList = fileName ? [{ name: fileName, url: fileUrl, size: fileSize, type: fileType }] : [];

    const orderData: Order = {
      id: newOrderId,
      customerId: user ? user.uid : "anonymous-guest",
      customerEmail: email,
      customerName: name,
      serviceId,
      serviceName,
      serviceCategory,
      files: filesList,
      quantity,
      specifications: specs,
      priceBreakdown,
      paymentId: transactionId,
      paymentMethod,
      paymentStatus: "completed",
      orderStatus: "Payment Received",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // 1. Save to Database
      await dbService.addDocument("orders", orderData);
      
      // 2. Add billing payments record
      await dbService.addDocument("payments", {
        orderId: newOrderId,
        customerId: user?.uid || "guest",
        amount: priceBreakdown.total,
        method: paymentMethod,
        status: "completed",
        transactionId,
        createdAt: new Date().toISOString()
      });

      // 3. Generate and Save PDF invoice record
      const pdf = generateInvoicePDF(orderData, {
        companyName: "PrintHub Services Ltd.",
        companyAddress: "102, Digital Towers, Sector 62, Noida, UP - 201301",
        gstNumber: "27AAAAA1111A1Z1",
        contactEmail: "support@printhub.com"
      });
      
      // In a real env, we would upload pdf to storage.
      // In mock, we generate DataURI for immediate download on UI.
      const invoiceDataUri = pdf.output("datauristring");
      await dbService.addDocument("invoices", {
        orderId: newOrderId,
        invoiceNumber: newOrderId.replace("PH-", "INV-2026-"),
        pdfUrl: invoiceDataUri,
        totalAmount: priceBreakdown.total,
        taxAmount: priceBreakdown.gst,
        createdAt: new Date().toISOString()
      });

      // 4. Create Notification
      await dbService.addDocument("notifications", {
        userId: user?.uid || "guest",
        title: "Order Placed Successfully",
        body: `Your print order ${newOrderId} is received and payment verified. Status: Payment Received.`,
        read: false,
        createdAt: new Date().toISOString()
      });

      setCompletedOrder(orderData);
    } catch (err) {
      console.error("Failed to process order creation:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDFInvoice = () => {
    if (!completedOrder) return;
    const pdf = generateInvoicePDF(completedOrder, {
      companyName: "PrintHub Services Ltd.",
      companyAddress: "102, Digital Towers, Sector 62, Noida, UP - 201301",
      gstNumber: "27AAAAA1111A1Z1",
      contactEmail: "support@printhub.com"
    });
    pdf.save(`Invoice_${completedOrder.id}.pdf`);
  };

  // SUCCESS capture window layout
  if (completedOrder) {
    return (
      <main className="flex-grow max-w-xl mx-auto px-4 py-20 text-center space-y-6 page-fade-in">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto animate-bounce" />
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Payment Received!</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Thank you for your order. Your invoice receipt is compiled and files are queued.
          </p>
        </div>

        <div className="glass-panel border-white/5 rounded-3xl p-6 text-left space-y-4">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Order ID</span>
            <span className="font-mono font-bold text-zinc-700 dark:text-zinc-200">{completedOrder.id}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Service</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">{completedOrder.serviceName}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-400 border-b border-zinc-150/40 dark:border-zinc-850/60 pb-3">
            <span>Total Captured</span>
            <span className="font-extrabold text-indigo-500">₹{completedOrder.priceBreakdown.total.toFixed(2)}</span>
          </div>

          {/* Download and track buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={downloadPDFInvoice}
              className="flex items-center justify-center space-x-1.5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-xs font-bold transition"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span>Download Invoice</span>
            </button>
            <button
              onClick={() => router.push(`/track?id=${completedOrder.id}`)}
              className="flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-500/10"
            >
              <Printer className="w-4 h-4" />
              <span>Track Progress</span>
            </button>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={() => router.push("/services")}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Go back to Service Directory
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full page-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Checkout Billing Form Column */}
        <div className="lg:col-span-7">
          <div className="glass-panel border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-zinc-950 dark:text-white mb-6">Delivery & Billing</h2>
            
            <form onSubmit={handlePay} className="space-y-5">
              {/* Email / Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-205 dark:border-zinc-800 bg-white/5 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-205 dark:border-zinc-800 bg-white/5 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Order Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-205 dark:border-zinc-800 bg-white/5 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Service Type</label>
                  <div className="w-full px-4 py-2.5 rounded-xl border border-zinc-205 dark:border-zinc-800 bg-white/5 text-sm text-zinc-700 dark:text-zinc-200">
                    {serviceCategory?.charAt(0).toUpperCase() + serviceCategory?.slice(1)}
                  </div>
                </div>
              </div>

              {/* Shipping address details */}
              <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center">
                  <MapPin className="w-4.5 h-4.5 mr-1 text-indigo-500" />
                  Shipping Address
                </h3>
                
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Street Address</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-205 dark:border-zinc-800 bg-white/5 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Apt 402, Block B, Silver Heights"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-205 dark:border-zinc-800 bg-white/5 text-sm focus:outline-none"
                      placeholder="Noida"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-205 dark:border-zinc-800 bg-white/5 text-sm focus:outline-none"
                      placeholder="UP"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Zip Code</label>
                    <input
                      type="text"
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-205 dark:border-zinc-800 bg-white/5 text-sm focus:outline-none"
                      placeholder="201301"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-205 dark:border-zinc-800 bg-white/5 text-sm focus:outline-none"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              {/* Payment Methods selector */}
              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Payment Gateway</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("stripe")}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      paymentMethod === "stripe"
                        ? "border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mb-1" />
                    <span className="text-xs font-bold">Stripe</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("razorpay")}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      paymentMethod === "razorpay"
                        ? "border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mb-1 text-emerald-500" />
                    <span className="text-xs font-bold">Razorpay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      paymentMethod === "upi"
                        ? "border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <Smartphone className="w-5 h-5 mb-1 text-purple-500" />
                    <span className="text-xs font-bold">UPI QR</span>
                  </button>
                </div>
              </div>

              {/* Submit Pay */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center space-x-2 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg hover:shadow-indigo-500/10 disabled:opacity-50 transition cursor-pointer"
              >
                {isProcessing ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Capture payment of ₹{priceBreakdown?.total.toFixed(2)}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-5">
          <div className="glass-panel border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white border-b border-zinc-150/40 dark:border-zinc-850/60 pb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-500" />
              Order Summary
            </h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-900/60 pb-3">
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200">{serviceName}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Quantity: {quantity} {quantity === 1 ? 'copy' : 'copies'}</p>
                  {fileName && (
                    <p className="text-[10px] text-indigo-500 truncate max-w-[200px] mt-1">
                      File: {fileName}
                    </p>
                  )}
                </div>
                {priceBreakdown && (
                  <span className="font-bold text-zinc-900 dark:text-white">₹{priceBreakdown.subtotal.toFixed(2)}</span>
                )}
              </div>

              {/* Specs detailed listings */}
              <div className="bg-zinc-50 dark:bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 space-y-2 text-[10px]">
                <p className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] mb-1.5">Specifications Selected</p>
                {specs.paperSize && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Size:</span>
                    <span className="font-semibold">{specs.paperSize}</span>
                  </div>
                )}
                {specs.colorMode && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Ink Format:</span>
                    <span className="font-semibold">{specs.colorMode === "color" ? "Full Color" : "B/W"}</span>
                  </div>
                )}
                {specs.sides && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Sides:</span>
                    <span className="font-semibold capitalize">{specs.sides}-sided</span>
                  </div>
                )}
                {specs.binding && specs.binding !== "none" && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Binding/Finishing:</span>
                    <span className="font-semibold capitalize text-indigo-500">{specs.binding}</span>
                  </div>
                )}
                {specs.customText && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Overlay Text:</span>
                    <span className="font-semibold italic text-emerald-500 truncate max-w-[140px]">{specs.customText}</span>
                  </div>
                )}
              </div>

              {/* Price Calculations */}
              {priceBreakdown && (
                <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-900/60 pt-4 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Cart Subtotal</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">₹{priceBreakdown.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>GST Tax (18%)</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">₹{priceBreakdown.gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-150/40 dark:border-zinc-850/60 pt-3 text-sm font-bold">
                    <span className="text-zinc-900 dark:text-white">Amount Due</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-base">₹{priceBreakdown.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* UPI QR Payment Modal */}
      {isUpiModalOpen && priceBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">UPI QR Scanner</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Scan QR code using any UPI app (GPay, PhonePe, Paytm)</p>
            
            <div className="w-52 h-52 mx-auto bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center p-2 border border-zinc-200/50 dark:border-zinc-800/80">
              {upiQrDataUrl ? (
                <img src={upiQrDataUrl} alt="UPI QR Code" className="w-full h-full rounded" />
              ) : (
                <span className="text-xs text-zinc-400">Generating code...</span>
              )}
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl">
              <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">Amount to Transfer</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">₹{priceBreakdown.total.toFixed(2)}</span>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setIsUpiModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpiPaymentConfirm}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md"
              >
                Verify & Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center py-20">
          <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </>
  );
}
