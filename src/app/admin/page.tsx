"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dbService } from "@/lib/firebase";
import { Order, ServiceItem, UserProfile } from "@/types";
import {
  Package,
  DollarSign,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  ShoppingBag,
  Layers,
  Gift,
  Settings,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [o, s] = await Promise.all([
          dbService.getCollection<Order>("orders"),
          dbService.getCollection<ServiceItem>("services"),
        ]);
        setOrders(o.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setServices(s);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.priceBreakdown?.total || 0), 0);
  const activeOrders = orders.filter((o) => !["Delivered", "Cancelled"].includes(o.orderStatus));
  const deliveredOrders = orders.filter((o) => o.orderStatus === "Delivered");
  const cancelledOrders = orders.filter((o) => o.orderStatus === "Cancelled");

  // Generate chart data from orders (last 7 days)
  const chartData = (() => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      const dayOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });
      data.push({
        date: dateStr,
        revenue: dayOrders.reduce((s, o) => s + (o.priceBreakdown?.total || 0), 0),
        orders: dayOrders.length,
      });
    }
    return data;
  })();

  const kpiCards = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Total Orders",
      value: orders.length.toString(),
      icon: Package,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-500/10",
      textColor: "text-indigo-400",
      trend: "+8.3%",
      trendUp: true,
    },
    {
      title: "Active Orders",
      value: activeOrders.length.toString(),
      icon: Clock,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-400",
      trend: activeOrders.length > 0 ? "In Progress" : "None",
      trendUp: true,
    },
    {
      title: "Services Offered",
      value: services.length.toString(),
      icon: Layers,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
      trend: `${services.length} active`,
      trendUp: true,
    },
  ];

  const quickActions = [
    { label: "Manage Orders", href: "/admin/orders", icon: Package, desc: "View & update order statuses" },
    { label: "Edit Services", href: "/admin/services", icon: Layers, desc: "Add, edit, or remove services" },
    { label: "Create Offer", href: "/admin/offers", icon: Gift, desc: "Launch a new promotional offer" },
    { label: "Update Pricing", href: "/admin/pricing", icon: DollarSign, desc: "Change service rates" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 page-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-white">Dashboard Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">Monitor your business metrics and recent activity.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/5 p-5 group hover:border-white/10 transition-all duration-300"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${kpi.bgColor} blur-3xl opacity-30 rounded-full -translate-y-1/2 translate-x-1/2`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${kpi.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${kpi.textColor}`} />
                  </div>
                  <span className={`flex items-center gap-0.5 text-[11px] font-bold ${kpi.trendUp ? "text-emerald-400" : "text-rose-400"}`}>
                    {kpi.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {kpi.trend}
                  </span>
                </div>
                <p className="text-2xl font-black text-white tracking-tight">{kpi.value}</p>
                <p className="text-[11px] text-zinc-500 font-medium mt-1 uppercase tracking-wider">{kpi.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-white/[0.03] border border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-white">Revenue Trend</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-bold">Live</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#f4f4f5",
                  }}
                  formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6">
          <h2 className="text-sm font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition group"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-200 group-hover:text-white transition">{action.label}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{action.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Recent Orders</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Latest customer orders</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition flex items-center gap-1"
          >
            View All <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Service</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-6 py-3.5">
                    <span className="text-xs font-bold font-mono text-indigo-400">{order.id}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <p className="text-xs font-medium text-zinc-300">{order.customerName}</p>
                    <p className="text-[10px] text-zinc-600">{order.customerEmail}</p>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-zinc-400">{order.serviceName}</td>
                  <td className="px-6 py-3.5 text-xs font-bold text-zinc-200">₹{order.priceBreakdown.total.toFixed(2)}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.orderStatus === "Delivered"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : order.orderStatus === "Cancelled"
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-indigo-500/10 text-indigo-400"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-[11px] text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-600 text-sm">
                    No orders found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
