"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/firebase";
import { ServiceItem, ServiceCategory } from "@/types";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Search,
  Printer,
  Layers,
  Sparkles,
  FileText,
  Save,
  RefreshCw,
} from "lucide-react";

const CATEGORIES: { id: ServiceCategory; label: string; icon: any }[] = [
  { id: "printing", label: "Printing", icon: Printer },
  { id: "business", label: "Business", icon: Layers },
  { id: "merchandise", label: "Merchandise", icon: Sparkles },
  { id: "documents", label: "Documents", icon: FileText },
];

const EMPTY_SERVICE: Omit<ServiceItem, "id"> = {
  name: "",
  category: "printing",
  description: "",
  basePrice: 0,
  features: [""],
  image: "/images/default.jpg",
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState(EMPTY_SERVICE);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadServices = async () => {
    setLoading(true);
    try {
      const svcs = await dbService.getCollection<ServiceItem>("services");
      setServices(svcs);
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadServices(); }, []);

  const openAddModal = () => {
    setEditingService(null);
    setFormData(EMPTY_SERVICE);
    setShowModal(true);
  };

  const openEditModal = (svc: ServiceItem) => {
    setEditingService(svc);
    setFormData({
      name: svc.name,
      category: svc.category,
      description: svc.description,
      basePrice: svc.basePrice,
      features: svc.features.length > 0 ? svc.features : [""],
      image: svc.image,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.description.trim()) return;
    setSaving(true);
    try {
      const cleanFeatures = formData.features.filter((f) => f.trim() !== "");
      const data = {
        ...formData,
        features: cleanFeatures.length > 0 ? cleanFeatures : ["Standard service"],
        basePrice: Number(formData.basePrice),
      };

      if (editingService) {
        await dbService.setDocument("services", editingService.id, { ...data, id: editingService.id });
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? { ...s, ...data } : s))
        );
      } else {
        const newId = formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const record = { ...data, id: newId } as ServiceItem;
        await dbService.setDocument("services", newId, record);
        setServices((prev) => [...prev, record]);
      }
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save service:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    try {
      await dbService.deleteDocument("services", serviceId);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete service:", err);
    }
  };

  const addFeatureField = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }));
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const filtered = services.filter((s) => {
    const matchesCat = activeCategory === "all" || s.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categoryCounts = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat.id] = services.filter((s) => s.category === cat.id).length;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6 page-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Services Manager</h1>
          <p className="text-sm text-zinc-500 mt-1">Add, edit, or remove services from the catalog.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20"
        >
          <Plus className="h-4 w-4" />
          Add New Service
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            activeCategory === "all"
              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              : "bg-white/[0.03] text-zinc-500 border border-white/5 hover:text-zinc-300"
          }`}
        >
          All ({services.length})
        </button>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeCategory === cat.id
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "bg-white/[0.03] text-zinc-500 border border-white/5 hover:text-zinc-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.label} ({categoryCounts[cat.id] || 0})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30 transition"
        />
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-16 text-center">
          <Layers className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No services found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((svc) => (
            <div
              key={svc.id}
              className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 hover:border-white/10 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 uppercase">
                    {svc.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openEditModal(svc)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-indigo-400 transition"
                    title="Edit"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  {deleteConfirm === svc.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(svc.id)}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition"
                        title="Confirm Delete"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 transition"
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(svc.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-bold text-white mb-1">{svc.name}</h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2 mb-3">{svc.description}</p>

              <div className="space-y-1 mb-3">
                {svc.features.slice(0, 3).map((feat, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                    <Check className="h-3 w-3 text-indigo-500 flex-shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Base Rate</span>
                  <p className="text-sm font-black text-white">₹{svc.basePrice.toFixed(2)}</p>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono">{svc.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f0f18] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-bold text-white">
                {editingService ? "Edit Service" : "Add New Service"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-500 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-grow">
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Service Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Custom T-Shirt Printing"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value as ServiceCategory }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-300 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Base Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.basePrice}
                    onChange={(e) => setFormData((p) => ({ ...p, basePrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Description *</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the service in detail..."
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Features</label>
                  <button
                    onClick={addFeatureField}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition"
                  >
                    + Add Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => updateFeature(i, e.target.value)}
                        placeholder={`Feature ${i + 1}`}
                        className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30"
                      />
                      {formData.features.length > 1 && (
                        <button
                          onClick={() => removeFeature(i)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-600 hover:text-rose-400 transition"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Image Path</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData((p) => ({ ...p, image: e.target.value }))}
                  placeholder="/images/service.jpg"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-200 border border-white/5 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name.trim() || !formData.description.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20 disabled:opacity-40"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving..." : editingService ? "Update Service" : "Create Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
