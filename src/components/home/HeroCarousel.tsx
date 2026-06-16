"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Printer,
  Layers,
  Sparkles,
  ShoppingBag,
  Gift,
  Shirt,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Image,
} from "lucide-react";
import { dbService } from "@/lib/firebase";
import { CarouselSlide } from "@/types";

interface Slide {
  id: string;
  tag: string;
  tagColor: string;
  headline: string;
  highlight: string;
  sub: string;
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  gradient: string; // for the decorative blob
  accentColor: string;
  icon: React.ElementType;
  stats: { value: string; label: string }[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  Printer, Layers, Sparkles, ShoppingBag, Gift, Shirt, Coffee, Image,
};

const GRADIENT_MAP: Record<string, string> = {
  indigo: "from-indigo-500/20 via-purple-500/10 to-transparent",
  emerald: "from-emerald-500/20 via-teal-500/10 to-transparent",
  purple: "from-purple-500/20 via-pink-500/10 to-transparent",
  amber: "from-amber-500/20 via-orange-500/10 to-transparent",
};

const DEFAULT_SLIDES: Slide[] = [
  {
    id: "document-print",
    tag: "⚡ Super Fast",
    tagColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    headline: "Print Documents,",
    highlight: "Instantly.",
    sub: "A4 & A3 documents, reports, theses — B&W or full color. Ready within the hour.",
    cta: { label: "Upload & Order Now", href: "/services" },
    secondaryCta: { label: "View Pricing", href: "/pricing" },
    gradient: "from-indigo-500/20 via-purple-500/10 to-transparent",
    accentColor: "indigo",
    icon: Printer,
    stats: [
      { value: "₹2", label: "per A4 B&W page" },
      { value: "₹10", label: "per A4 color page" },
      { value: "1 hr", label: "average turnaround" },
    ],
  },
  {
    id: "business-cards",
    tag: "💼 Corporate",
    tagColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    headline: "Premium Business",
    highlight: "Cards & Stationery.",
    sub: "350GSM matte & glossy finish cards, letterheads, envelopes, and brochures for your brand.",
    cta: { label: "Design Your Cards", href: "/services" },
    secondaryCta: { label: "Bulk Quote", href: "/pricing" },
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    accentColor: "emerald",
    icon: Layers,
    stats: [
      { value: "₹1.5", label: "per card" },
      { value: "500+", label: "minimum for bulk" },
      { value: "350gsm", label: "premium cardstock" },
    ],
  },
  {
    id: "custom-merch",
    tag: "🎁 Trending Now",
    tagColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    headline: "Custom Merchandise",
    highlight: "Made to Order.",
    sub: "T-shirts, hoodies, caps, mugs, cushions, mobile covers and more — print your design on anything.",
    cta: { label: "Start Customizing", href: "/customizer" },
    secondaryCta: { label: "See All Merch", href: "/services" },
    gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
    accentColor: "purple",
    icon: Sparkles,
    stats: [
      { value: "20+", label: "product types" },
      { value: "₹150", label: "starting price" },
      { value: "DTF", label: "premium print tech" },
    ],
  },
  {
    id: "gifts",
    tag: "🎀 Perfect Gifts",
    tagColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    headline: "Personalized Gifts",
    highlight: "They'll Love.",
    sub: "Magic mugs, canvas prints, photo pillows, keychains, and more — perfect for every occasion.",
    cta: { label: "Browse Gift Ideas", href: "/customizer" },
    secondaryCta: { label: "Corporate Gifts", href: "/services" },
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    accentColor: "amber",
    icon: Gift,
    stats: [
      { value: "100%", label: "custom printed" },
      { value: "₹150", label: "mugs starting at" },
      { value: "Next day", label: "dispatch available" },
    ],
  },
];

function mapDbSlideToSlide(dbSlide: CarouselSlide): Slide {
  return {
    id: dbSlide.id,
    tag: dbSlide.tag,
    tagColor: dbSlide.tagColor,
    headline: dbSlide.headline,
    highlight: dbSlide.highlight,
    sub: dbSlide.sub,
    cta: { label: dbSlide.ctaLabel, href: dbSlide.ctaHref },
    secondaryCta: dbSlide.secondaryCtaLabel
      ? { label: dbSlide.secondaryCtaLabel, href: dbSlide.secondaryCtaHref || "/services" }
      : undefined,
    gradient: GRADIENT_MAP[dbSlide.accentColor] || GRADIENT_MAP.indigo,
    accentColor: dbSlide.accentColor,
    icon: ICON_MAP[dbSlide.iconName] || Printer,
    stats: dbSlide.stats,
  };
}

const accentClasses: Record<string, string> = {
  indigo: "from-indigo-500 via-indigo-600 to-purple-600",
  emerald: "from-emerald-400 via-emerald-500 to-teal-600",
  purple: "from-purple-500 via-purple-600 to-pink-600",
  amber: "from-amber-400 via-amber-500 to-orange-500",
};

const dotActive: Record<string, string> = {
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  purple: "bg-purple-500",
  amber: "bg-amber-500",
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function HeroCarousel() {
  const [[current, direction], setPage] = useState([0, 0]);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);

  // Load slides from DB
  useEffect(() => {
    async function loadSlides() {
      try {
        const dbSlides = await dbService.getCollection<CarouselSlide>("carousel");
        const activeSlides = dbSlides
          .filter((s) => s.isActive)
          .sort((a, b) => a.order - b.order);
        if (activeSlides.length > 0) {
          setSlides(activeSlides.map(mapDbSlideToSlide));
        }
      } catch (err) {
        console.warn("Failed to load carousel slides from DB, using defaults:", err);
      }
    }
    loadSlides();
  }, []);

  const slide = slides[current % slides.length];
  const Icon = slide.icon;

  const paginate = useCallback(
    (dir: number) => {
      setPage(([prev]) => {
        const next = (prev + dir + slides.length) % slides.length;
        return [next, dir];
      });
    },
    [slides.length]
  );

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => paginate(1), 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, paginate]);

  const goTo = (idx: number) => {
    setPage(([prev]) => [idx, idx > prev ? 1 : -1]);
  };

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Full-bleed gradient backdrop */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-all duration-700 pointer-events-none`}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-zinc-500) 1px, transparent 1px), linear-gradient(90deg, var(--color-zinc-500) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`slide-${current}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16"
          >
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Tag badge */}
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className={`inline-flex items-center px-3 py-1 rounded-full border border-current/20 text-xs font-bold uppercase tracking-wider ${slide.tagColor} mb-5`}
              >
                {slide.tag}
              </motion.span>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
                {slide.headline}{" "}
                <span
                  className={`bg-clip-text text-transparent bg-gradient-to-r ${accentClasses[slide.accentColor]}`}
                >
                  {slide.highlight}
                </span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
                {slide.sub}
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href={slide.cta.href}
                  className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white shadow-lg transition hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r ${accentClasses[slide.accentColor]} hover:shadow-xl hover:shadow-current/20`}
                >
                  <Icon className="h-5 w-5" />
                  {slide.cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {slide.secondaryCta && (
                  <Link
                    href={slide.secondaryCta.href}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition backdrop-blur-sm"
                  >
                    {slide.secondaryCta.label}
                  </Link>
                )}
              </div>

              {/* Mini Stats */}
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-5">
                {slide.stats.map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <p className={`text-xl font-black bg-clip-text text-transparent bg-gradient-to-r ${accentClasses[slide.accentColor]}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Panel */}
            <div className="flex-shrink-0 w-full max-w-sm lg:max-w-md">
              <div className="relative">
                {/* Glow blob */}
                <div
                  className={`absolute inset-0 -m-4 rounded-3xl blur-3xl opacity-20 bg-gradient-to-br ${accentClasses[slide.accentColor]} pointer-events-none`}
                />
                {/* Card */}
                <div className="relative glass-panel rounded-3xl p-8 border border-white/20 dark:border-white/5 shadow-2xl">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${accentClasses[slide.accentColor]} shadow-lg`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Floating mini cards */}
                  <div className="space-y-3">
                    {slide.stats.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/60 dark:bg-zinc-800/60 border border-white/40 dark:border-white/5 backdrop-blur-sm"
                      >
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</span>
                        <span className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${accentClasses[slide.accentColor]}`}>
                          {stat.value}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA mini */}
                  <Link
                    href={slide.cta.href}
                    className={`mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${accentClasses[slide.accentColor]} hover:opacity-90 transition`}
                  >
                    {slide.cta.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls Row */}
        <div className="mt-10 flex items-center justify-center lg:justify-between gap-6">
          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  i === current
                    ? `w-7 h-2.5 ${dotActive[s.accentColor]}`
                    : "w-2.5 h-2.5 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600"
                }`}
              />
            ))}
          </div>

          {/* Arrow controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => paginate(-1)}
              aria-label="Previous slide"
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => paginate(1)}
              aria-label="Next slide"
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="hidden lg:block flex-1 max-w-xs h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              key={`progress-${current}-${paused}`}
              initial={{ width: "0%" }}
              animate={{ width: paused ? undefined : "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              className={`h-full rounded-full bg-gradient-to-r ${accentClasses[slide.accentColor]}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
