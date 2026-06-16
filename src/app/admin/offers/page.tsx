"use client";

import React, { useState, useEffect } from "react";
import { dbService } from "@/lib/firebase";
import { OfferRecord, ServiceItem } from "@/types";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Save,
  Gift,
  Percent,
  DollarSign,
  Calendar,
  Eye,
  EyeOff,
  Tag,
  Zap,
  Clock,
} from "lucide-react";

const EMPTY_OFFER: Omit<OfferRecord, "id" | "createdAt"> = {
  name: "",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  applicableServiceIds: [],
  minOrderValue: 0,
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  isActive: true,
};

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferRecord | null>(null);
  const [formData, setFormData] = useState(EMPTY_OFFER);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "expired" | "all">("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const [o, s] = await Promise.all([
        dbService.getCollection<OfferRecord>("offers"),
        dbService.getCollection<ServiceItem>("services"),
      ]);
      setOffers(o.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setServices(s);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const isOfferActive = (offer: OfferRecord) => {
    if (!offer.isActive) return false;
    const now = new Date();
    return now >= new Date(offer.startDate) && now <= new Date(offer.endDate);
  };

  const isOfferExpired = (offer: OfferRecord) => {
    return new Date() > new Date(offer.endDate);
  };

  const openAddModal = () => {
    setEditingOffer(null);
    setFormData({ ...EMPTY_OFFER });
    setShowModal(true);
  };

  const openEditModal = (offer: OfferRecord) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name,
      description: offer.description,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      applicableServiceIds: [...offer.applicableServiceIds],
      minOrderValue: offer.minOrderValue || 0,
      startDate: offer.startDate.split("T")[0],
      endDate: offer.endDate.split("T")[0],
      isActive: offer.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      if (editingOffer) {
        const record: OfferRecord = {
          ...formData,
          id: editingOffer.id,
          createdAt: editingOffer.createdAt,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        };
        await dbService.setDocument("offers", editingOffer.id, record);
        setOffers((prev) => prev.map((o) => (o.id === editingOffer.id ? record : o)));
      } else {
        const newId = `offer-${Date.now().toString(36)}`;
        const record: OfferRecord = {
          ...formData,
          id: newId,
          createdAt: new Date().toISOString(),
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        };
        await dbService.setDocument("offers", newId, record);
        setOffers((prev) => [record, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save offer:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (offerId: string) => {
    try {
      await dbService.deleteDocument("offers", offerId);
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete offer:", err);
    }
  };

  const toggleOfferActive = async (offer: OfferRecord) => {
    const updated = { ...offer, isActive: !offer.isActive };
    await dbService.setDocument("offers", offer.id, updated);
    setOffers((prev) => prev.map((o) => (o.id === offer.id ? updated : o)));
  };

  const toggleServiceSelection = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableServiceIds: prev.applicableServiceIds.includes(serviceId)
        ? prev.applicableServiceIds.filter((id) => id !== serviceId)
        : [...prev.applicableServiceIds, serviceId],
    }));
  };

  const filteredOffers = offers.filter((o) => {
    if (activeTab === "active") return isOfferActive(o);
    if (activeTab === "expired") return isOfferExpired(o);
    return true;
  });

  const getServiceName = (id: string) => services.find((s) => s.id === id)?.name || id;

  return (
    <div className="space-y-6 page-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Offers & Discounts</h1>
          <p className="text-sm text-zinc-500 mt-1">Create promotional offers that dynamically affect pricing.</p>
        </div>
        <button onClick={openAddModal} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20">
          <Plus className="h-4 w-4" />
          Create Offer
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["all", "active", "expired"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
              activeTab === tab
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                : "bg-white/[0.03] text-zinc-500 border border-white/5 hover:text-zinc-300"
            }`}
          >
            {tab} ({tab === "all" ? offers.length : tab === "active" ? offers.filter(isOfferActive).length : offers.filter(isOfferExpired).length})
          </button>
        ))}
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-16 text-center">
          <Gift className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No offers found. Create one to start promoting.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOffers.map((offer) => {
            const active = isOfferActive(offer);
            const expired = isOfferExpired(offer);

            return (
              <div
                key={offer.id}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  active ? "bg-white/[0.03] border-emerald-500/20" : expired ? "bg-white/[0.01] border-white/5 opacity-60" : "bg-white/[0.02] border-white/5"
                }`}
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    active ? "bg-emerald-500/10" : "bg-white/5"
                  }`}>
                    {offer.discountType === "percentage" ? (
                      <Percent className={`h-5 w-5 ${active ? "text-emerald-400" : "text-zinc-600"}`} />
                    ) : (
                      <DollarSign className={`h-5 w-5 ${active ? "text-emerald-400" : "text-zinc-600"}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-white truncate">{offer.name}</h3>
                      {active && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400">
                          <Zap className="h-2.5 w-2.5" /> LIVE
                        </span>
                      )}
                      {expired && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-500/10 text-zinc-500">
                          <Clock className="h-2.5 w-2.5" /> EXPIRED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate">{offer.description || "No description"}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-600">
                      <span className="font-bold text-indigo-400">
                        {offer.discountType === "percentage" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                      </span>
                      <span>|</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(offer.startDate).toLocaleDateString()} — {new Date(offer.endDate).toLocaleDateString()}
                      </span>
                      <span>|</span>
                      <span>
                        {offer.applicableServiceIds.length === 0 ? "All services" : `${offer.applicableServiceIds.length} services`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleOfferActive(offer)}
                      className={`p-2 rounded-lg transition ${
                        offer.isActive ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-white/5 text-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {offer.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button onClick={() => openEditModal(offer)} className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-indigo-400 transition"><Edit3 className="h-4 w-4" /></button>
                    {deleteConfirm === offer.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(offer.id)} className="p-2 rounded-lg bg-rose-500/20 text-rose-400"><Check className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteConfirm(null)} className="p-2 rounded-lg hover:bg-white/10 text-zinc-500"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(offer.id)} className="p-2 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                </div>

                {/* Applicable services preview */}
                {offer.applicableServiceIds.length > 0 && (
                  <div className="px-5 pb-3 flex flex-wrap gap-1">
                    {offer.applicableServiceIds.map((id) => (
                      <span key={id} className="px-2 py-0.5 rounded text-[9px] font-medium bg-white/5 text-zinc-500 border border-white/5">{getServiceName(id)}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f0f18] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-bold text-white">{editingOffer ? "Edit Offer" : "Create New Offer"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-zinc-500"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-grow">
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Offer Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Summer Sale 2026" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30" />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Description</label>
                <textarea rows={2} value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the promotion..." className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Discount Type</label>
                  <div className="flex bg-white/[0.03] p-0.5 rounded-xl border border-white/5">
                    <button onClick={() => setFormData((p) => ({ ...p, discountType: "percentage" }))} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${formData.discountType === "percentage" ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-500"}`}>
                      <Percent className="h-3.5 w-3.5 inline mr-1" />Percentage
                    </button>
                    <button onClick={() => setFormData((p) => ({ ...p, discountType: "flat" }))} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${formData.discountType === "flat" ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-500"}`}>
                      <DollarSign className="h-3.5 w-3.5 inline mr-1" />Flat Amount
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">
                    Discount Value {formData.discountType === "percentage" ? "(%)" : "(₹)"}
                  </label>
                  <input type="number" min="0" max={formData.discountType === "percentage" ? 100 : undefined} value={formData.discountValue} onChange={(e) => setFormData((p) => ({ ...p, discountValue: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/30" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Start Date</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/30" />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">End Date</label>
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/30" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Min. Order Value (₹) — 0 = no minimum</label>
                <input type="number" min="0" value={formData.minOrderValue || 0} onChange={(e) => setFormData((p) => ({ ...p, minOrderValue: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/30" />
              </div>

              {/* Applicable Services */}
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">
                  Applicable Services <span className="text-zinc-600">(none selected = applies to all)</span>
                </label>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-white/5 divide-y divide-white/[0.03]">
                  {services.map((svc) => (
                    <label key={svc.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={formData.applicableServiceIds.includes(svc.id)}
                        onChange={() => toggleServiceSelection(svc.id)}
                        className="w-3.5 h-3.5 rounded border-zinc-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 bg-transparent"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-300 truncate">{svc.name}</p>
                        <p className="text-[10px] text-zinc-600 capitalize">{svc.category} • ₹{svc.basePrice}</p>
                      </div>
                    </label>
                  ))}
                </div>
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
                {saving ? "Saving..." : editingOffer ? "Update Offer" : "Create Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
