"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/components/providers/AuthProvider";
import { dbService } from "@/lib/firebase";
import { Order, Address } from "@/types";
import { useRouter } from "next/navigation";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  MapPin, 
  FileText, 
  Download, 
  User, 
  Plus, 
  Trash, 
  AlertCircle 
} from "lucide-react";
import { generateInvoicePDF } from "@/lib/invoice";

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, updateProfile, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">("orders");

  // Address form
  const [addrName, setAddrName] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrZip, setAddrZip] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    async function loadOrders() {
      if (user) {
        // Query orders matching user
        const customerOrders = await dbService.queryDocuments<Order>("orders", [
          { field: "customerId", operator: "==", value: user.uid }
        ]);
        // Sort by date descending
        customerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(customerOrders);
      }
    }
    loadOrders();
  }, [user, loading]);

  const handleDownloadInvoice = (order: Order) => {
    const pdf = generateInvoicePDF(order, {
      companyName: "PrintHub Services Ltd.",
      companyAddress: "102, Digital Towers, Sector 62, Noida, UP - 201301",
      gstNumber: "27AAAAA1111A1Z1",
      contactEmail: "support@printhub.com"
    });
    pdf.save(`Invoice_${order.id}.pdf`);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newAddr: Address = {
      id: `addr-${Math.random().toString(36).substring(2, 9)}`,
      name: addrName,
      street: addrStreet,
      city: addrCity,
      state: addrState,
      zipCode: addrZip,
      phone: addrPhone,
    };

    const updatedAddresses = [...(user.addresses || []), newAddr];
    await updateProfile({ addresses: updatedAddresses });

    // Reset Form
    setAddrName("");
    setAddrStreet("");
    setAddrCity("");
    setAddrState("");
    setAddrZip("");
    setAddrPhone("");
    setIsAddingAddress(false);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
    const updated = (user.addresses || []).filter((a) => a.id !== addressId);
    await updateProfile({ addresses: updated });
  };

  if (loading || !user) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen">
        <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate order counts
  const totalCount = orders.length;
  const activeCount = orders.filter(o => !["Delivered", "Cancelled"].includes(o.orderStatus)).length;
  const completedCount = orders.filter(o => o.orderStatus === "Delivered").length;
  const cancelledCount = orders.filter(o => o.orderStatus === "Cancelled").length;

  return (
    <>
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full page-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-150 dark:border-zinc-850 pb-6 mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Customer Portal</span>
            <h1 className="text-2xl font-black mt-1 text-zinc-950 dark:text-white">Welcome back, {user.displayName}</h1>
          </div>
          <span className="text-xs text-zinc-400 font-medium sm:text-right mt-2 sm:mt-0">Account ID: {user.uid}</span>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel border-white/5 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Total Placed</span>
            <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{totalCount}</p>
          </div>
          <div className="glass-panel border-white/5 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Active Orders</span>
            <p className="text-2xl font-black text-indigo-500 mt-1">{activeCount}</p>
          </div>
          <div className="glass-panel border-white/5 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Delivered</span>
            <p className="text-2xl font-black text-emerald-500 mt-1">{completedCount}</p>
          </div>
          <div className="glass-panel border-white/5 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Cancelled</span>
            <p className="text-2xl font-black text-rose-500 mt-1">{cancelledCount}</p>
          </div>
        </div>

        {/* Layout Tabs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Side Menu */}
          <div className="lg:col-span-3">
            <div className="glass-panel border-white/5 rounded-2xl p-4 space-y-1">
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "orders"
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>My Orders</span>
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "addresses"
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Saved Addresses</span>
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile Settings</span>
              </button>
            </div>
          </div>

          {/* Active Tab Panel */}
          <div className="lg:col-span-9">
            
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Order History</h2>
                
                {orders.length === 0 ? (
                  <div className="glass-panel border-white/5 rounded-2xl p-12 text-center text-zinc-400">
                    <ClipboardList className="w-12 h-12 text-zinc-300 dark:text-zinc-800 mx-auto mb-4 animate-pulse" />
                    <p className="text-sm">You haven't placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div 
                        key={ord.id}
                        className="glass-panel border-white/5 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2.5">
                            <span className="font-mono font-bold text-indigo-500 text-sm">{ord.id}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.orderStatus === "Delivered"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                                : ord.orderStatus === "Cancelled"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-450"
                                : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-450"
                            }`}>
                              {ord.orderStatus}
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{ord.serviceName}</h3>
                          <p className="text-[11px] text-zinc-400 leading-none">
                            Placed on {new Date(ord.createdAt).toLocaleDateString()} • Qty: {ord.quantity} • Total: ₹{ord.priceBreakdown.total.toFixed(2)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 md:self-center">
                          <button
                            onClick={() => router.push(`/track?id=${ord.id}`)}
                            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 transition"
                          >
                            Track Status
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(ord)}
                            className="p-2 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl text-indigo-500 transition"
                            title="Download Invoice PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Shipping Address Book</h2>
                  <button
                    onClick={() => setIsAddingAddress(!isAddingAddress)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-500/10 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Address</span>
                  </button>
                </div>

                {isAddingAddress && (
                  <form onSubmit={handleAddAddress} className="glass-panel border-indigo-500/10 rounded-2xl p-5 space-y-4 text-xs sm:text-sm page-fade-in">
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-200">New Address</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Address Label (e.g. Home, Office)</label>
                        <input
                          type="text"
                          required
                          value={addrName}
                          onChange={(e) => setAddrName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-xs focus:outline-none"
                          placeholder="Home"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-xs focus:outline-none"
                          placeholder="9876543210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-xs focus:outline-none"
                        placeholder="102, Digital Residency"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">State</label>
                        <input
                          type="text"
                          required
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Zip Code</label>
                        <input
                          type="text"
                          required
                          value={addrZip}
                          onChange={(e) => setAddrZip(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                {(!user.addresses || user.addresses.length === 0) ? (
                  <div className="glass-panel border-white/5 rounded-2xl p-12 text-center text-zinc-400">
                    <MapPin className="w-12 h-12 text-zinc-300 dark:text-zinc-800 mx-auto mb-4" />
                    <p className="text-sm">No saved delivery addresses found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => (
                      <div 
                        key={addr.id}
                        className="glass-panel border-white/5 rounded-2xl p-5 shadow-sm space-y-3 relative group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase">
                            {addr.name}
                          </span>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                            title="Delete Address"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200">{addr.street}</p>
                          <p>{addr.city}, {addr.state} - {addr.zipCode}</p>
                          <p className="text-[10px] font-mono">Ph: {addr.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Settings Tab */}
            {activeTab === "profile" && (
              <div className="glass-panel border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Profile Details</h2>
                <div className="flex items-center space-x-4">
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-16 h-16 rounded-full border border-indigo-500/20"
                  />
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-base">{user.displayName}</h3>
                    <p className="text-xs text-zinc-400">{user.email}</p>
                    <span className="mt-1.5 inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-150 text-indigo-800 capitalize">
                      Role: {user.role}
                    </span>
                  </div>
                </div>

                <div className="border-t border-zinc-150 dark:border-zinc-850 pt-6 space-y-4 text-xs sm:text-sm">
                  <div className="flex items-start space-x-2 text-zinc-400">
                    <AlertCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      This is a dynamic Profile page linked to the Hybrid Firebase Data layer. Your profile details, addresses, and transaction listings are stored in synchronized local/remote databases.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
