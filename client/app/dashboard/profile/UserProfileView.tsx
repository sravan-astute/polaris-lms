"use client";

import React, { useState, useEffect } from "react";
import { 
  User, Mail, Shield, Building, Calendar, Loader2, 
  LogOut, Phone, FileText, Lock, Save, History, BadgeCheck
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://polaris-backend-379760782242.us-east4.run.app';

export default function UserProfileView() {
  const { theme, themeKey } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'activity'>('general');
  
  // 🛠️ UPDATED Form States: firstName and lastName
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    phone: '', 
    bio: '', 
    email: '',
    jobTitle: '' 
  });
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        // 🛠️ Mapping new schema fields to form state
        setFormData({ 
          firstName: data.firstName || '', 
          lastName: data.lastName || '', 
          phone: data.phone || '', 
          bio: data.bio || '',
          email: data.email || '',
          jobTitle: data.jobTitle || ''
        });
      }
    } catch (e) {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/profile/update`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
        fetchProfile();
      } else {
        toast.error("Update failed");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/profile/change-password`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(passData)
      });
      if (res.ok) {
        toast.success("Password changed successfully");
        setPassData({ currentPassword: '', newPassword: '' });
      } else {
        const error = await res.json();
        toast.error(error.message || "Password change failed");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center opacity-50">
      <Loader2 className="animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className={`h-full p-10 overflow-y-auto ${theme.bg} ${theme.text}`}>
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            {/* 🛠️ Using firstName directly from API */}
            <h1 className="text-4xl font-black tracking-tight mb-2">Welcome back, {profile?.firstName}</h1>
            <p className="opacity-60 text-sm font-bold">Manage your personal identity and security preferences.</p>
          </div>
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all bg-red-500/10 text-red-500 hover:bg-red-500/20`}
          >
            <LogOut size={18} /> Sign out
          </button>
        </div>

        {/* TABS NAVIGATION */}
        <div className={`flex gap-4 border-b ${theme.border} pb-1`}>
          {[
            { id: 'general', label: 'General Information', icon: User },
            { id: 'security', label: 'Security settings', icon: Lock },
            { id: 'activity', label: 'Activity logs', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-black transition-all border-b-4 ${
                activeTab === tab.id 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent opacity-40 hover:opacity-100"
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* PROFILE CARD */}
          <div className="space-y-6">
            <div className={`p-8 rounded-3xl border shadow-xl text-center ${theme.paper} ${theme.border}`}>
              <div className={`w-28 h-28 mx-auto flex items-center justify-center text-indigo-600 mb-6 rounded-3xl border-4 ${theme.border} bg-current/[0.08]`}>
                <User size={50} />
              </div>
              {/* 🛠️ Combining names for display */}
              <h2 className="text-2xl font-black">{profile?.firstName} {profile?.lastName}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <BadgeCheck size={16} className="text-indigo-500" />
                <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">
                  {profile?.role?.replace('_', ' ')}
                </span>
              </div>
              
              <div className="mt-8 space-y-3 pt-6 border-t border-dashed">
                <div className={`flex items-center gap-3 p-3 rounded-xl bg-current/[0.08] text-sm font-bold`}>
                  <Building size={16} className="opacity-40" /> {profile?.organization?.name || "Independent"}
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-xl bg-current/[0.08] text-sm font-bold`}>
                  <Calendar size={16} className="opacity-40" /> 
                  Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Recently"}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-2">
            {activeTab === 'general' && (
              <form onSubmit={handleUpdateProfile} className={`p-10 rounded-3xl border shadow-xl space-y-8 ${theme.paper} ${theme.border}`}>
                {/* 🛠️ Split Name Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black opacity-60 px-1">First name</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className={`w-full p-4 rounded-2xl border-2 transition-all outline-none focus:ring-4 focus:ring-indigo-500/10 ${theme.input} ${theme.border}`} 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black opacity-60 px-1">Last name</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className={`w-full p-4 rounded-2xl border-2 transition-all outline-none focus:ring-4 focus:ring-indigo-500/10 ${theme.input} ${theme.border}`} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black opacity-60 px-1">Email address</label>
                    <div className={`w-full p-4 rounded-2xl border-2 flex items-center gap-2 opacity-50 bg-current/[0.05] ${theme.border}`}>
                      <Mail size={16} /> {formData.email}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black opacity-60 px-1">Job title</label>
                    <input 
                      type="text" 
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                      className={`w-full p-4 rounded-2xl border-2 transition-all outline-none focus:ring-4 focus:ring-indigo-500/10 ${theme.input} ${theme.border}`} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                    <label className="text-xs font-black opacity-60 px-1">Phone number</label>
                    <input 
                      type="text" 
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={`w-full p-4 rounded-2xl border-2 transition-all outline-none focus:ring-4 focus:ring-indigo-500/10 ${theme.input} ${theme.border}`} 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black opacity-60 px-1">System Role</label>
                    <div className={`w-full p-4 rounded-2xl border-2 flex items-center gap-2 opacity-50 bg-current/[0.05] ${theme.border}`}>
                       {profile?.role?.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black opacity-60 px-1">Professional bio</label>
                  <textarea 
                    rows={4}
                    placeholder="Describe your role or expertise..."
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className={`w-full p-4 rounded-2xl border-2 transition-all outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none ${theme.input} ${theme.border}`}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    disabled={isUpdating}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-base shadow-xl flex items-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save changes
                  </button>
                </div>
              </form>
            )}

            {/* Security and Activity tabs remain the same as your code */}
            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword} className={`p-10 rounded-3xl border shadow-xl space-y-8 ${theme.paper} ${theme.border}`}>
                <div className="flex items-center gap-3">
                   <Lock size={24} className="text-indigo-600" />
                   <h3 className="font-black text-2xl">Update security</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black opacity-60 px-1">Current password</label>
                    <input 
                      type="password" 
                      required
                      value={passData.currentPassword}
                      onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                      className={`w-full p-4 rounded-2xl border-2 transition-all outline-none focus:ring-4 focus:ring-indigo-500/10 ${theme.input} ${theme.border}`} 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black opacity-60 px-1">New password</label>
                    <input 
                      type="password" 
                      required
                      value={passData.newPassword}
                      onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                      className={`w-full p-4 rounded-2xl border-2 transition-all outline-none focus:ring-4 focus:ring-indigo-500/10 ${theme.input} ${theme.border}`} 
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button 
                    disabled={isUpdating}
                    className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-base shadow-xl flex items-center gap-3 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} />}
                    Update security
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'activity' && (
              <div className={`p-16 rounded-3xl border shadow-xl text-center space-y-6 ${theme.paper} ${theme.border}`}>
                <div className={`w-20 h-20 mx-auto flex items-center justify-center rounded-3xl opacity-40 bg-current/[0.08]`}>
                  <History size={36} />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-black opacity-60">No recent activity logs found</p>
                  <p className="text-sm opacity-40">Your account interactions will appear here once tracked.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}