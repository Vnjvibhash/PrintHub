"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { dbService } from "@/lib/firebase";
import { UserProfile, UserRole } from "@/types";
import {
  Search,
  Users,
  ChevronRight,
  Trash2,
  RefreshCw,
  Edit3,
  X,
} from "lucide-react";

const ROLE_OPTIONS = ["all", "customer", "admin"] as const;

type RoleFilter = (typeof ROLE_OPTIONS)[number];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    email: "",
    role: "customer" as UserRole,
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const rawUsers = await dbService.getCollection<UserProfile>("users");
      const normalizedUsers: UserProfile[] = Array.isArray(rawUsers)
        ? rawUsers
        : rawUsers
        ? Object.values(rawUsers as Record<string, UserProfile>)
        : [];

      const sorted = normalizedUsers
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setUsers(sorted);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({
      displayName: user.displayName,
      email: user.email,
      role: user.role,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);

    const updatedAt = new Date().toISOString();
    const updates = {
      displayName: editForm.displayName,
      email: editForm.email,
      role: editForm.role,
      updatedAt,
    };

    try {
      await dbService.updateDocument("users", editingUser.uid, updates);
      setUsers((prev) =>
        prev.map((user) =>
          user.uid === editingUser.uid
            ? { ...user, ...updates }
            : user
        )
      );
      setShowModal(false);
      setEditingUser(null);
    } catch (err) {
      console.error("Failed to update user:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (uid: string) => {
    const confirmed = window.confirm("Delete this user account? This action cannot be undone.");
    if (!confirmed) return;

    setRefreshing(true);
    try {
      await dbService.deleteDocument("users", uid);
      setUsers((prev) => prev.filter((user) => user.uid !== uid));
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const search = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !search ||
      user.displayName.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.uid.toLowerCase().includes(search);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 page-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">User Management</h1>
          <p className="text-sm text-zinc-500 mt-1">View, search, and manage registered accounts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadUsers}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/10 text-xs font-bold text-indigo-300 hover:text-white hover:bg-indigo-500/20 transition"
          >
            <Users className="h-3.5 w-3.5" />
            Back to Admin
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-4 py-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total Users</p>
          <p className="text-3xl font-black text-white mt-2">{users.length}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-4 py-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Admins</p>
          <p className="text-3xl font-black text-white mt-2">{users.filter((user) => user.role === "admin").length}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-4 py-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Customers</p>
          <p className="text-3xl font-black text-white mt-2">{users.filter((user) => user.role === "customer").length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="relative rounded-2xl bg-white/[0.03] border border-white/5 p-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name, email, or UID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/30 transition"
            />
          </div>
        </div>
        <div className="flex items-center rounded-2xl bg-white/[0.03] border border-white/5 p-3">
          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mr-3">Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/30 transition"
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role === "all" ? "All Roles" : role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Registered Accounts</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">{filteredUsers.length} result{filteredUsers.length === 1 ? "" : "s"} found</p>
          </div>
          <p className="text-[11px] text-zinc-500">Updated at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-16 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-zinc-500">
            No users match your current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[720px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">User</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Created</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Last Updated</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`}
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full border border-white/10"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
                          <p className="text-[11px] text-zinc-500 truncate">{user.uid}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300 truncate">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        user.role === "admin"
                          ? "bg-indigo-500/15 text-indigo-300"
                          : "bg-emerald-500/10 text-emerald-300"
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[12px] text-zinc-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-[12px] text-zinc-500">{new Date(user.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(user)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/15 transition text-[11px] font-semibold"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user.uid)}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/15 transition text-[11px] font-semibold"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-[#09090f] border border-white/10 shadow-2xl shadow-black/30 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Edit User</h3>
                <p className="text-sm text-zinc-500 mt-1">Update name, email, or role for this account.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-zinc-400 hover:text-white hover:bg-white/5 transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Full Name</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, displayName: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/30 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/30 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/30 transition"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#05050a]">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto rounded-2xl border border-white/10 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto rounded-2xl bg-indigo-500 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-600 transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
