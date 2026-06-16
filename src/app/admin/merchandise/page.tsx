"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/firebase";
import { ProductItem } from "@/types";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Search,
  Save,
  ShoppingBag,
  Palette,
} from "lucide-react";

const PRODUCT_TYPES = ["mug", "tshirt", "hoodie", "pillow", "cap", "mousepad", "keychain", "mobilecover", "photoframe"] as const;

const COMMON_COLORS = [
  "#ffffff", "#000000", "#18181b", "#374151", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#10b981", "#3b82f6", "#6366f1", "#8b5cf6",
  "#ec4899", "#e11d48", "#1e3a8a", "#fef08a", "#fbcfe8",
];

const EMPTY_PRODUCT: Omit<ProductItem, "id"> = {
  name: "",
  type: "mug",
  basePrice: 0,
  imageUrl: "/images/default.jpg",
  colors: ["#ffffff"],
  sizes: [],
};

export default function AdminMerchandisePage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [formData, setFormData] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newSize, setNewSize] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const prods = await dbService.getCollection<ProductItem>("products");
      setProducts(prods);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ ...EMPTY_PRODUCT });
    setShowModal(true);
  };

  const openEditModal = (prod: ProductItem) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      type: prod.type,
      basePrice: prod.basePrice,
      imageUrl: prod.imageUrl,
      colors: [...prod.colors],
      sizes: prod.sizes ? [...prod.sizes] : [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      const data = { ...formData, basePrice: Number(formData.basePrice) };

      if (editingProduct) {
        const record = { ...data, id: editingProduct.id } as ProductItem;
        await dbService.setDocument("products", editingProduct.id, record);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? record : p)));
      } else {
        const newId = `prod-${formData.type}-${Date.now().toString(36)}`;
        const record = { ...data, id: newId } as ProductItem;
        await dbService.setDocument("products", newId, record);
        setProducts((prev) => [...prev, record]);
      }
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save product:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await dbService.deleteDocument("products", productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const toggleColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const addSize = () => {
    if (!newSize.trim()) return;
    setFormData((prev) => ({
      ...prev,
      sizes: [...(prev.sizes || []), newSize.trim()],
    }));
    setNewSize("");
  };

  const removeSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: (prev.sizes || []).filter((s) => s !== size),
    }));
  };

  const filtered = products.filter((p) =>
    !searchQuery ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 page-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Merchandise Manager</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage custom products available in the customizer.</p>
        </div>
        <button onClick={openAddModal} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20">
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30 transition" />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-16 text-center">
          <ShoppingBag className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((prod) => (
            <div key={prod.id} className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 hover:border-white/10 transition group">
              <div className="flex items-start justify-between mb-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 uppercase">{prod.type}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openEditModal(prod)} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-indigo-400 transition"><Edit3 className="h-3.5 w-3.5" /></button>
                  {deleteConfirm === prod.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(prod.id)} className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400"><Check className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(prod.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-bold text-white mb-2">{prod.name}</h3>

              {/* Colors */}
              <div className="flex items-center gap-1 mb-2">
                <Palette className="h-3 w-3 text-zinc-600" />
                {prod.colors.slice(0, 6).map((color) => (
                  <span key={color} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                ))}
                {prod.colors.length > 6 && <span className="text-[10px] text-zinc-500">+{prod.colors.length - 6}</span>}
              </div>

              {/* Sizes */}
              {prod.sizes && prod.sizes.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {prod.sizes.map((size) => (
                    <span key={size} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 text-zinc-400 border border-white/5">{size}</span>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Price</span>
                  <p className="text-sm font-black text-white">₹{prod.basePrice.toFixed(2)}</p>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono">{prod.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f0f18] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-bold text-white">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-zinc-500"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-grow">
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Product Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Premium Cotton T-Shirt" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Type *</label>
                  <select value={formData.type} onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value as any }))} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-300 focus:outline-none">
                    {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Base Price (₹) *</label>
                  <input type="number" min="0" value={formData.basePrice} onChange={(e) => setFormData((p) => ({ ...p, basePrice: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/30" />
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Available Colors</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={`w-7 h-7 rounded-lg border-2 transition-all ${
                        formData.colors.includes(color) ? "border-indigo-400 scale-110" : "border-white/10 opacity-60 hover:opacity-80"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-zinc-600 mt-1">{formData.colors.length} selected</p>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Available Sizes</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(formData.sizes || []).map((size) => (
                    <span key={size} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-xs text-zinc-300 border border-white/5">
                      {size}
                      <button onClick={() => removeSize(size)} className="text-zinc-600 hover:text-rose-400"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newSize} onChange={(e) => setNewSize(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())} placeholder="e.g. XL" className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/30" />
                  <button onClick={addSize} className="px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold hover:bg-indigo-500/20 transition">Add</button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Image URL</label>
                <input type="text" value={formData.imageUrl} onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/30" />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3 flex-shrink-0">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 border border-white/5 hover:bg-white/5 transition">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20 disabled:opacity-40"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
