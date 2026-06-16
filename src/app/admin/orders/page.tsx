"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/firebase";
import { Order, OrderStatus } from "@/types";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Package,
  Clock,
  FileText,
  Download,
  RefreshCw,
} from "lucide-react";
import { generateInvoicePDF } from "@/lib/invoice";

const ALL_STATUSES: OrderStatus[] = [
  "Pending",
  "Payment Received",
  "Processing",
  "Designing",
  "Printing",
  "Ready for Pickup",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-zinc-500/10 text-zinc-400",
  "Payment Received": "bg-blue-500/10 text-blue-400",
  Processing: "bg-amber-500/10 text-amber-400",
  Designing: "bg-purple-500/10 text-purple-400",
  Printing: "bg-indigo-500/10 text-indigo-400",
  "Ready for Pickup": "bg-emerald-500/10 text-emerald-400",
  Shipped: "bg-cyan-500/10 text-cyan-400",
  Delivered: "bg-emerald-500/10 text-emerald-400",
  Cancelled: "bg-rose-500/10 text-rose-400",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const allOrders = await dbService.getCollection<Order>("orders");
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(allOrders);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await dbService.updateDocument("orders", orderId, {
        orderStatus: newStatus,
        updatedAt: new Date().toISOString(),
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, orderStatus: newStatus, updatedAt: new Date().toISOString() } : o
        )
      );
    } catch (err) {
      console.error("Failed to update order:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownloadInvoice = (order: Order) => {
    const settingsRaw = localStorage.getItem("printhub_db_settings");
    let settings = {
      companyName: "PrintHub Services Ltd.",
      companyAddress: "102, Digital Towers, Sector 62, Noida, UP - 201301",
      gstNumber: "27AAAAA1111A1Z1",
      contactEmail: "support@printhub.com",
    };
    if (settingsRaw) {
      try {
        const parsed = JSON.parse(settingsRaw);
        settings = { ...settings, ...parsed };
      } catch {}
    }
    const pdf = generateInvoicePDF(order, settings);
    pdf.save(`Invoice_${order.id}.pdf`);
  };

  // Filter + search
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.orderStatus === statusFilter;
    const matchesSearch =
      !searchQuery ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const orderCounts = {
    all: orders.length,
    active: orders.filter((o) => !["Delivered", "Cancelled"].includes(o.orderStatus)).length,
    delivered: orders.filter((o) => o.orderStatus === "Delivered").length,
    cancelled: orders.filter((o) => o.orderStatus === "Cancelled").length,
  };

  return (
    <div className="space-y-6 page-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Order Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Track, update, and manage all customer orders.</p>
        </div>
        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Orders", value: orderCounts.all, color: "text-white" },
          { label: "Active", value: orderCounts.active, color: "text-indigo-400" },
          { label: "Delivered", value: orderCounts.delivered, color: "text-emerald-400" },
          { label: "Cancelled", value: orderCounts.cancelled, color: "text-rose-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{stat.label}</p>
            <p className={`text-xl font-black mt-0.5 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by order ID, customer, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30 transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/30 transition appearance-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-16 text-center">
          <Package className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No orders match your filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const isUpdating = updatingId === order.id;

            return (
              <div
                key={order.id}
                className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden hover:border-white/10 transition"
              >
                {/* Order Row */}
                <div
                  className="flex items-center gap-4 px-4 sm:px-6 py-4 cursor-pointer"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 items-center">
                    <div>
                      <span className="text-xs font-bold font-mono text-indigo-400">{order.id}</span>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs font-medium text-zinc-300 truncate">{order.customerName}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs text-zinc-400 truncate">{order.serviceName}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-200">₹{order.priceBreakdown.total.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[order.orderStatus] || ""}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                  )}
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-5 pt-1 border-t border-white/5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Customer Details</p>
                        <div className="text-xs space-y-1 text-zinc-400">
                          <p><span className="text-zinc-300 font-medium">{order.customerName}</span></p>
                          <p>{order.customerEmail}</p>
                          <p>ID: {order.customerId}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Order Details</p>
                        <div className="text-xs space-y-1 text-zinc-400">
                          <p>Service: <span className="text-zinc-300">{order.serviceName}</span></p>
                          <p>Category: <span className="text-zinc-300 capitalize">{order.serviceCategory}</span></p>
                          <p>Qty: <span className="text-zinc-300">{order.quantity}</span></p>
                          <p>Payment: <span className="text-emerald-400 capitalize">{order.paymentStatus} ({order.paymentMethod})</span></p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Price Breakdown</p>
                        <div className="text-xs space-y-1 text-zinc-400">
                          <p>Base: <span className="text-zinc-300">₹{order.priceBreakdown.base.toFixed(2)}</span></p>
                          <p>Options: <span className="text-zinc-300">₹{order.priceBreakdown.optionsPrice.toFixed(2)}</span></p>
                          <p>Subtotal: <span className="text-zinc-300">₹{order.priceBreakdown.subtotal.toFixed(2)}</span></p>
                          <p>GST: <span className="text-zinc-300">₹{order.priceBreakdown.gst.toFixed(2)}</span></p>
                          <p className="font-bold text-white">Total: ₹{order.priceBreakdown.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Files */}
                    {order.files && order.files.length > 0 && (
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Attached Files</p>
                        <div className="flex flex-wrap gap-2">
                          {order.files.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-zinc-400">
                              <FileText className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[200px]">{f.name}</span>
                              <span className="text-zinc-600">({(f.size / 1024).toFixed(0)}KB)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2 flex-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold whitespace-nowrap">Update Status:</label>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                          disabled={isUpdating}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/30 transition disabled:opacity-50"
                        >
                          {ALL_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {isUpdating && <RefreshCw className="h-3.5 w-3.5 text-indigo-400 animate-spin" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadInvoice(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 hover:text-white transition"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Invoice
                        </button>
                        {order.orderStatus !== "Cancelled" && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, "Cancelled")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-600">
                      Created: {new Date(order.createdAt).toLocaleString()} • Updated: {new Date(order.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
