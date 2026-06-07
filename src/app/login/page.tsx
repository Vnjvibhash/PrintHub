"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Printer, Mail, Lock, User, LogIn, ChevronRight, ShieldAlert } from "lucide-react";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signIn, signUp, signInWithGoogle, loading } = useAuth();
  
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [errorText, setErrorText] = useState("");
  const [processLoading, setProcessLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setProcessLoading(true);

    try {
      if (isSignUpMode) {
        await signUp(email, password, name);
      } else {
        const u = await signIn(email, password);
        if (u.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setProcessLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorText("");
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Google Authentication failed.");
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center py-16 px-4 page-fade-in max-w-md mx-auto w-full">
      <div className="glass-panel border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 text-indigo-600 dark:text-indigo-400 font-black text-2xl">
            <Printer className="h-7 w-7" />
            <span>PrintHub</span>
          </div>
          <h1 className="text-xl font-extrabold text-zinc-950 dark:text-white">
            {isSignUpMode ? "Create your account" : "Sign in to PrintHub"}
          </h1>
          <p className="text-xs text-zinc-400">
            {isSignUpMode ? "Get access to order history and saved profiles" : "Welcome back. Log in using credentials."}
          </p>
        </div>

        {/* Quick Dev Login Notice */}
        {!isSignUpMode && (
          <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl text-zinc-500 dark:text-zinc-450 text-[11px] text-center">
            <span className="font-semibold block text-indigo-600 dark:text-indigo-400 mb-0.5">Mock Test Accounts</span>
            Customer: <code className="font-bold">customer@printhub.com</code> / <code className="font-bold">password123</code><br/>
            Admin: <code className="font-bold">admin@printhub.com</code> / <code className="font-bold">admin123</code>
          </div>
        )}

        {/* Error Notification */}
        {errorText && (
          <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-start space-x-2">
            <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 text-rose-500" />
            <span>{errorText}</span>
          </div>
        )}

        {/* Email/Password Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {isSignUpMode && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 focus:outline-none focus:border-indigo-500"
                  placeholder="Jane Doe"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 focus:outline-none focus:border-indigo-500"
                placeholder="jane@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 focus:outline-none focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Pay */}
          <button
            type="submit"
            disabled={processLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg hover:shadow-indigo-500/10 disabled:opacity-50 transition cursor-pointer"
          >
            {processLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{isSignUpMode ? "Sign Up" : "Sign In"}</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-zinc-150 dark:border-zinc-850" />
          <span className="px-3 text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Or</span>
          <div className="flex-grow border-t border-zinc-150 dark:border-zinc-850" />
        </div>

        {/* Social login buttons */}
        <button
          onClick={handleGoogleLogin}
          className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-350 flex items-center justify-center space-x-2 transition"
        >
          <img src="https://api.iconify.design/logos:google-icon.svg" className="w-4.5 h-4.5" alt="Google Logo" />
          <span>Continue with Google</span>
        </button>

        {/* Toggle link */}
        <div className="text-center pt-2">
          <button
            onClick={() => setIsSignUpMode(!isSignUpMode)}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            {isSignUpMode ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center py-20">
          <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <LoginContent />
      </Suspense>
      <Footer />
    </>
  );
}
