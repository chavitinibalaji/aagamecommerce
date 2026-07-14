'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@aagam/utils';
import {
  UserCircle, Mail, Calendar, Shield, MapPin, Package, Heart, Tag,
  LogOut, Loader2, Pencil, Check, X, RotateCcw,
} from 'lucide-react';

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  emailVerified: boolean;
  createdAt?: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        setProfile(res.data);
        setNameDraft(res.data.name || '');
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_name', res.data.name || '');
          localStorage.setItem('user_email', res.data.email || '');
          localStorage.setItem('user_avatar', res.data.avatarUrl || '');
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleSaveName = async () => {
    if (!nameDraft.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiClient.patch('/auth/me', { name: nameDraft.trim() });
      setProfile((prev) => prev ? { ...prev, name: res.data.name } : prev);
      localStorage.setItem('user_name', res.data.name || '');
      setEditingName(false);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_avatar');
      localStorage.removeItem('access_token');
      router.push('/login');
    }
  };

  const initials = (profile?.name || profile?.email || 'A')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : null;

  const quickLinks = [
    { label: 'My Orders', icon: Package, href: '/shop/orders', color: 'bg-violet-100 text-violet-700' },
    { label: 'Addresses', icon: MapPin, href: '/shop/addresses', color: 'bg-teal-100 text-teal-700' },
    { label: 'Wishlist', icon: Heart, href: '/shop/wishlist', color: 'bg-rose-100 text-rose-700' },
    { label: 'Deals', icon: Tag, href: '/shop/deals', color: 'bg-amber-100 text-amber-700' },
    { label: 'Reorder', icon: RotateCcw, href: '/shop/reorder', color: 'bg-sky-100 text-sky-700' },
  ];

  if (loading) {
    return (
      <DashboardLayout allowedRole="CUSTOMER">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-7 w-7 animate-spin text-teal-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) return null;

  return (
    <DashboardLayout allowedRole="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-teal-600 to-teal-500" />
          <div className="-mt-12 px-6 pb-6">
            <div className="flex items-end gap-4">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-slate-950 text-2xl font-black text-white shadow-lg">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1 pb-1">
                <p className="text-xs font-bold text-slate-400">{profile.role}</p>
              </div>
            </div>

            {/* Name */}
            <div className="mt-5">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    placeholder="Your name"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving || !nameDraft.trim()}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-white transition hover:bg-teal-700 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameDraft(profile.name || ''); }}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-950">{profile.name || 'Unnamed account'}</h2>
                  <button
                    onClick={() => { setEditingName(true); setNameDraft(profile.name || ''); }}
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {error && <p className="mt-2 text-xs font-bold text-red-600">{error}</p>}
            </div>

            {/* Info rows */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email</p>
                  <p className="font-semibold text-slate-900">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500">
                  <Shield className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Role</p>
                  <p className="font-semibold text-slate-900">{profile.role}</p>
                </div>
              </div>
              {memberSince && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Member since</p>
                    <p className="font-semibold text-slate-900">{memberSince}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Quick links</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => router.push(link.href)}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-sm"
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${link.color}`}>
                  <link.icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold text-slate-900">{link.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </DashboardLayout>
  );
}
