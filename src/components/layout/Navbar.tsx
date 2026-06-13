"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { 
  Printer, 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Shield, 
  Lock, 
  ChevronDown, 
  HelpCircle,
  FileText,
  Sun,
  Moon,
  Monitor
} from "lucide-react";

export default function Navbar() {
  const { user, signIn, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickLoginOpen, setIsQuickLoginOpen] = useState(false);

  type Theme = "light" | "dark" | "system";
  const [theme, setTheme] = useState<Theme>("system");
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      const currentTheme = localStorage.getItem("theme") || "system";
      if (currentTheme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const applyTheme = (t: Theme) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else if (t === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
      root.classList.toggle("light", !isDark);
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    setIsThemeMenuOpen(false);
  };
  const pathname = usePathname();
  const router = useRouter();

  const handleQuickLogin = async (role: "customer" | "admin") => {
    try {
      if (role === "admin") {
        await signIn("admin@printhub.com", "admin123");
        router.push("/admin");
      } else {
        await signIn("customer@printhub.com", "password123");
        router.push("/dashboard");
      }
      setIsQuickLoginOpen(false);
    } catch (err) {
      console.error("Quick login failed:", err);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Custom Merch", href: "/customizer" },
    { name: "Pricing", href: "/pricing" },
    { name: "Track Order", href: "/track" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl tracking-tight">
              <Printer className="h-6 w-6 animate-pulse-slow" />
              <span>Print<span className="text-[#0f0f15] dark:text-white">Hub</span></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
                    isActive 
                      ? "text-indigo-600 dark:text-indigo-400" 
                      : "text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Auth Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-md" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 focus:outline-none hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full border border-indigo-500/20"
                  />
                  <span>{user.displayName}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl py-2 z-50 animate-fade-in text-zinc-700 dark:text-zinc-200">
                    <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs text-zinc-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-semibold truncate">{user.email}</p>
                      <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        user.role === 'admin' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {user.role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                        {user.role === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                    </div>

                    <Link
                      href={user.role === "admin" ? "/admin" : "/dashboard"}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        signOut();
                        router.push("/");
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-rose-600 dark:hover:text-rose-400 border-t border-zinc-100 dark:border-zinc-800 mt-1"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Developer Quick Login Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsQuickLoginOpen(!isQuickLoginOpen)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold"
                  >
                    <Lock className="h-3.5 w-3.5 mr-1" />
                    <span>Quick Login</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {isQuickLoginOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl py-2 z-50 text-zinc-700 dark:text-zinc-200">
                      <div className="px-4 py-1 text-xs text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                        Developer Helpers
                      </div>
                      <button
                        onClick={() => handleQuickLogin("customer")}
                        className="w-full flex items-center px-4 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <User className="h-4 w-4 mr-2 text-emerald-500" />
                        Login as Customer
                      </button>
                      <button
                        onClick={() => handleQuickLogin("admin")}
                        className="w-full flex items-center px-4 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <Shield className="h-4 w-4 mr-2 text-rose-500" />
                        Login as Admin
                      </button>
                    </div>
                  )}
                </div>

                <Link
                  href="/login"
                  className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {!user && !loading && (
              <button
                onClick={() => setIsQuickLoginOpen(!isQuickLoginOpen)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded border border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-xs font-semibold"
              >
                <Lock className="w-3 h-3" />
                <span>Quick Login</span>
              </button>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Options */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/95 py-3 px-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {link.name}
            </Link>
          ))}
          
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-3 py-1.5">
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full border border-indigo-500/20"
                  />
                  <div>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-100">{user.displayName}</p>
                    <p className="text-xs text-zinc-400">{user.email}</p>
                  </div>
                </div>
                <Link
                  href={user.role === "admin" ? "/admin" : "/dashboard"}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Dashboard ({user.role === "admin" ? "Admin" : "Customer"})
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                    router.push("/");
                  }}
                  className="w-full text-left block px-3 py-2 rounded-lg text-base font-medium hover:bg-rose-50 dark:hover:bg-rose-950/10 text-rose-600 dark:text-rose-400"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2 rounded-lg text-base font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Developer Quick Login Dropdown */}
      {isQuickLoginOpen && !user && (
        <div className="md:hidden absolute right-4 top-16 w-52 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl py-2 z-50 text-zinc-700 dark:text-zinc-200">
          <div className="px-4 py-1.5 text-xs text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 mb-1">
            Select Role (Mock Account)
          </div>
          <button
            onClick={() => handleQuickLogin("customer")}
            className="w-full flex items-center px-4 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <User className="h-4 w-4 mr-2 text-emerald-500" />
            Customer (Jane Doe)
          </button>
          <button
            onClick={() => handleQuickLogin("admin")}
            className="w-full flex items-center px-4 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Shield className="h-4 w-4 mr-2 text-rose-500" />
            Admin (Admin Partner)
          </button>
        </div>
      )}
    </nav>
  );
}
