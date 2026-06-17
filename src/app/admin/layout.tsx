"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  LayoutDashboard,
  Package,
  Layers,
  Image,
  DollarSign,
  ShoppingBag,
  Gift,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Menu,
  X,
  Printer,
  Sun,
  Moon,
} from "lucide-react";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: Package },
  { name: "Services", href: "/admin/services", icon: Layers },
  { name: "Carousel", href: "/admin/carousel", icon: Image },
  { name: "Pricing", href: "/admin/pricing", icon: DollarSign },
  { name: "Merchandise", href: "/admin/merchandise", icon: ShoppingBag },
  { name: "Offers", href: "/admin/offers", icon: Gift },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07070a]">
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-zinc-500 font-medium">Loading Admin Panel...</span>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-4 h-16 border-b border-white/5`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Printer className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold text-white">PrintHub</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? link.name : undefined}
              className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-indigo-500/10 text-indigo-400 shadow-sm shadow-indigo-500/5"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${active ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
              {!collapsed && <span>{link.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user section */}
      <div className={`px-3 py-4 border-t border-white/5 ${collapsed ? "flex flex-col items-center gap-2" : ""}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`}
              alt={user.displayName}
              className="w-8 h-8 rounded-full border border-indigo-500/20"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-200 truncate">{user.displayName}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            signOut();
            router.push("/");
          }}
          className={`flex items-center ${collapsed ? "justify-center w-full" : "gap-2"} px-3 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition w-full`}
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#07070a] text-zinc-100">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[#0a0a12] border-r border-white/5 transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-[260px]"
        } fixed inset-y-0 left-0 z-40`}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition shadow-md z-50"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0a0a12] border-r border-white/5 transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 sm:px-6 bg-[#07070a]/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Admin Console</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-indigo-400 font-medium transition"
            >
              ← Back to Store
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
