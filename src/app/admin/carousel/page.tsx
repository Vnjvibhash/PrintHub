"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/firebase";
import { CarouselSlide, CarouselAccentColor } from "@/types";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Save,
  Image,
  Sparkles,
} from "lucide-react";

const ACCENT_OPTIONS: { value: CarouselAccentColor; label: string; color: string }[] = [
  { value: "indigo", label: "Indigo", color: "bg-indigo-500" },
  { value: "emerald", label: "Emerald", color: "bg-emerald-500" },
  { value: "purple", label: "Purple", color: "bg-purple-500" },
  { value: "amber", label: "Amber", color: "bg-amber-500" },
];

const ICON_OPTIONS = ["Printer", "Layers", "Sparkles", "Gift", "ShoppingBag", "Coffee", "Shirt", "Image"];

const EMPTY_SLIDE: Omit<CarouselSlide, "id"> = {
  tag: "",
  tagColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  headline: "",
  highlight: "",
  sub: "",
  ctaLabel: "Order Now",
  ctaHref: "/services",
  secondaryCtaLabel: "",
  secondaryCtaHref: "",
  accentColor: "indigo",
  iconName: "Printer",
  stats: [{ value: "", label: "" }],
  isActive: true,
  order: 0,
};

export default function AdminCarouselPage() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [formData, setFormData] = useState(EMPTY_SLIDE);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadSlides = async () => {
    setLoading(true);
    try {
      const data = await dbService.getCollection<CarouselSlide>("carousel");
      data.sort((a, b) => a.order - b.order);
      setSlides(data);
    } catch (err) {
      console.error("Failed to load carousel:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSlides(); }, []);

  const openAddModal = () => {
    setEditingSlide(null);
    setFormData({ ...EMPTY_SLIDE, order: slides.length });
    setShowModal(true);
  };

  const openEditModal = (slide: CarouselSlide) => {
    setEditingSlide(slide);
    setFormData({
      tag: slide.tag,
      tagColor: slide.tagColor,
      headline: slide.headline,
      highlight: slide.highlight,
      sub: slide.sub,
      ctaLabel: slide.ctaLabel,
      ctaHref: slide.ctaHref,
      secondaryCtaLabel: slide.secondaryCtaLabel || "",
      secondaryCtaHref: slide.secondaryCtaHref || "",
      accentColor: slide.accentColor,
      iconName: slide.iconName,
      stats: slide.stats.length > 0 ? slide.stats : [{ value: "", label: "" }],
      isActive: slide.isActive,
      order: slide.order,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.headline.trim() || !formData.highlight.trim()) return;
    setSaving(true);
    try {
      const cleanStats = formData.stats.filter((s) => s.value.trim() && s.label.trim());
      const tagColorMap: Record<CarouselAccentColor, string> = {
        indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
        emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      };

      const data = {
        ...formData,
        tagColor: tagColorMap[formData.accentColor],
        stats: cleanStats.length > 0 ? cleanStats : [{ value: "—", label: "info" }],
      };

      if (editingSlide) {
        const record = { ...data, id: editingSlide.id };
        await dbService.setDocument("carousel", editingSlide.id, record);
        setSlides((prev) => prev.map((s) => (s.id === editingSlide.id ? record : s)).sort((a, b) => a.order - b.order));
      } else {
        const newId = `slide-${Date.now().toString(36)}`;
        const record = { ...data, id: newId } as CarouselSlide;
        await dbService.setDocument("carousel", newId, record);
        setSlides((prev) => [...prev, record].sort((a, b) => a.order - b.order));
      }
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save slide:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slideId: string) => {
    try {
      await dbService.deleteDocument("carousel", slideId);
      setSlides((prev) => prev.filter((s) => s.id !== slideId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete slide:", err);
    }
  };

  const toggleActive = async (slide: CarouselSlide) => {
    const updated = { ...slide, isActive: !slide.isActive };
    await dbService.setDocument("carousel", slide.id, updated);
    setSlides((prev) => prev.map((s) => (s.id === slide.id ? updated : s)));
  };

  const moveSlide = async (slide: CarouselSlide, direction: "up" | "down") => {
    const sorted = [...slides].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === slide.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const tempOrder = sorted[idx].order;
    sorted[idx] = { ...sorted[idx], order: sorted[swapIdx].order };
    sorted[swapIdx] = { ...sorted[swapIdx], order: tempOrder };

    await dbService.setDocument("carousel", sorted[idx].id, sorted[idx]);
    await dbService.setDocument("carousel", sorted[swapIdx].id, sorted[swapIdx]);
    setSlides(sorted.sort((a, b) => a.order - b.order));
  };

  const addStatField = () => {
    setFormData((prev) => ({ ...prev, stats: [...prev.stats, { value: "", label: "" }] }));
  };

  const updateStat = (index: number, field: "value" | "label", val: string) => {
    setFormData((prev) => ({
      ...prev,
      stats: prev.stats.map((s, i) => (i === index ? { ...s, [field]: val } : s)),
    }));
  };

  const removeStat = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index),
    }));
  };

  const accentGradients: Record<CarouselAccentColor, string> = {
    indigo: "from-indigo-500 to-purple-600",
    emerald: "from-emerald-400 to-teal-600",
    purple: "from-purple-500 to-pink-600",
    amber: "from-amber-400 to-orange-500",
  };

  return (
    <div className="space-y-6 page-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Carousel Manager</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage hero banner slides on the homepage.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20"
        >
          <Plus className="h-4 w-4" />
          Add New Slide
        </button>
      </div>

      {/* Info */}
      <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/10 px-4 py-3 flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-zinc-400">
          <span className="text-indigo-400 font-bold">Active slides</span> appear on the homepage hero carousel. Use the arrows to reorder and the toggle to enable/disable slides.
        </p>
      </div>

      {/* Slides List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-16 text-center">
          <Image className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No carousel slides found. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`rounded-2xl border overflow-hidden transition-all ${
                slide.isActive
                  ? "bg-white/[0.03] border-white/10"
                  : "bg-white/[0.01] border-white/5 opacity-60"
              }`}
            >
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Order & Move */}
                <div className="flex flex-col items-center gap-0.5">
                  <button
                    onClick={() => moveSlide(slide, "up")}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-white/10 text-zinc-600 hover:text-zinc-300 disabled:opacity-20 transition"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-zinc-600">{idx + 1}</span>
                  <button
                    onClick={() => moveSlide(slide, "down")}
                    disabled={idx === slides.length - 1}
                    className="p-1 rounded hover:bg-white/10 text-zinc-600 hover:text-zinc-300 disabled:opacity-20 transition"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Color accent preview */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accentGradients[slide.accentColor]} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-lg">{slide.tag.split(" ")[0]}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold text-white truncate">
                      {slide.headline} <span className={`bg-clip-text text-transparent bg-gradient-to-r ${accentGradients[slide.accentColor]}`}>{slide.highlight}</span>
                    </h3>
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate">{slide.sub}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-zinc-600">CTA: {slide.ctaLabel}</span>
                    <span className="text-[10px] text-zinc-600">Icon: {slide.iconName}</span>
                    <span className="text-[10px] text-zinc-600">Stats: {slide.stats.length}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(slide)}
                    className={`p-2 rounded-lg transition ${
                      slide.isActive
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-white/5 text-zinc-600 hover:text-zinc-300"
                    }`}
                    title={slide.isActive ? "Active — Click to hide" : "Hidden — Click to show"}
                  >
                    {slide.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => openEditModal(slide)}
                    className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-indigo-400 transition"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  {deleteConfirm === slide.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(slide.id)}
                        className="p-2 rounded-lg bg-rose-500/20 text-rose-400"
                        title="Confirm"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="p-2 rounded-lg hover:bg-white/10 text-zinc-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(slide.id)}
                      className="p-2 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f0f18] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-bold text-white">
                {editingSlide ? "Edit Slide" : "Add New Slide"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-zinc-500"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-grow">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Headline *</label>
                  <input type="text" value={formData.headline} onChange={(e) => setFormData((p) => ({ ...p, headline: e.target.value }))} placeholder="Print Documents," className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30" />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Highlight Text *</label>
                  <input type="text" value={formData.highlight} onChange={(e) => setFormData((p) => ({ ...p, highlight: e.target.value }))} placeholder="Instantly." className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Tag Badge</label>
                <input type="text" value={formData.tag} onChange={(e) => setFormData((p) => ({ ...p, tag: e.target.value }))} placeholder="⚡ Super Fast" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30" />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Subtitle</label>
                <textarea rows={2} value={formData.sub} onChange={(e) => setFormData((p) => ({ ...p, sub: e.target.value }))} placeholder="A4 & A3 documents, reports..." className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Primary CTA Label</label>
                  <input type="text" value={formData.ctaLabel} onChange={(e) => setFormData((p) => ({ ...p, ctaLabel: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/30" />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Primary CTA Link</label>
                  <input type="text" value={formData.ctaHref} onChange={(e) => setFormData((p) => ({ ...p, ctaHref: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/30" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Secondary CTA Label</label>
                  <input type="text" value={formData.secondaryCtaLabel || ""} onChange={(e) => setFormData((p) => ({ ...p, secondaryCtaLabel: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/30" />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Secondary CTA Link</label>
                  <input type="text" value={formData.secondaryCtaHref || ""} onChange={(e) => setFormData((p) => ({ ...p, secondaryCtaHref: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/30" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Accent Color</label>
                  <div className="flex gap-2">
                    {ACCENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFormData((p) => ({ ...p, accentColor: opt.value }))}
                        className={`w-8 h-8 rounded-lg ${opt.color} transition-all ${
                          formData.accentColor === opt.value ? "ring-2 ring-white ring-offset-2 ring-offset-[#0f0f18] scale-110" : "opacity-60 hover:opacity-80"
                        }`}
                        title={opt.label}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Icon</label>
                  <select
                    value={formData.iconName}
                    onChange={(e) => setFormData((p) => ({ ...p, iconName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-300 focus:outline-none"
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stats */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Stats (shown in card)</label>
                  <button onClick={addStatField} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold">+ Add Stat</button>
                </div>
                <div className="space-y-2">
                  {formData.stats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="text" value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} placeholder="₹2" className="w-24 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/30" />
                      <input type="text" value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} placeholder="per A4 page" className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/30" />
                      {formData.stats.length > 1 && (
                        <button onClick={() => removeStat(i)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-600 hover:text-rose-400"><X className="h-3.5 w-3.5" /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3 flex-shrink-0">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 border border-white/5 hover:bg-white/5 transition">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.headline.trim() || !formData.highlight.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20 disabled:opacity-40"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving..." : editingSlide ? "Update Slide" : "Create Slide"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
