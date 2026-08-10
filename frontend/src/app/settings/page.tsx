"use client";

import { useState, useEffect } from "react";
import { Pencil, Loader2, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function SettingsProfilePage() {
  const { user, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    jobTitle: "",
    email: "",
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  const handleEditClick = (field: string) => {
    setEditingField(field);
    setTimeout(() => {
      document.getElementsByName(field)[0]?.focus();
    }, 0);
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        jobTitle: user.jobTitle || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await api.patch('/users/me', formData);
      await refreshUser();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-10">
      
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Profile</h1>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (showSuccess ? <Check className="w-4 h-4" /> : null)}
            {showSuccess ? "Saved!" : "Save Changes"}
          </button>
        </div>
        
        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
          {/* Profile Picture */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-zinc-800">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile picture</span>
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 overflow-hidden ring-1 ring-gray-200 dark:ring-zinc-700">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || user.email}&backgroundColor=c0aede`} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
          
          {/* Email */}
          <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-zinc-800 gap-2 md:gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
            <div className="w-full md:w-72 relative">
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => setEditingField(null)}
                readOnly={editingField !== 'email'}
                className={cn(
                  "w-full bg-transparent rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none transition-all pr-8",
                  editingField === 'email' ? "border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" : "border border-transparent cursor-default hover:border-gray-100 dark:hover:border-zinc-800"
                )}
              />
              <button type="button" onMouseDown={(e) => { e.preventDefault(); handleEditClick('email'); }} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {/* Full Name */}
          <div className="flex flex-col md:flex-row md:items-start justify-between px-6 py-5 border-b border-gray-100 dark:border-zinc-800 gap-2 md:gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 md:pt-2">Full name</span>
            <div className="w-full md:w-72 relative">
              <input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => setEditingField(null)}
                readOnly={editingField !== 'name'}
                className={cn(
                  "w-full bg-transparent rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none transition-all pr-8",
                  editingField === 'name' ? "border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" : "border border-transparent cursor-default hover:border-gray-100 dark:hover:border-zinc-800"
                )}
              />
              <button type="button" onMouseDown={(e) => { e.preventDefault(); handleEditClick('name'); }} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {/* Title */}
          <div className="flex flex-col md:flex-row md:items-start justify-between px-6 py-5 border-b border-gray-100 dark:border-zinc-800 gap-2 md:gap-4">
            <div className="flex flex-col gap-0.5 md:pt-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Your job title or role</span>
            </div>
            <div className="w-full md:w-72 relative">
              <input 
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                onBlur={() => setEditingField(null)}
                readOnly={editingField !== 'jobTitle'}
                placeholder="e.g. Product Designer"
                className={cn(
                  "w-full bg-transparent rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none transition-all pr-8",
                  editingField === 'jobTitle' ? "border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" : "border border-transparent cursor-default hover:border-gray-100 dark:hover:border-zinc-800"
                )}
              />
              <button type="button" onMouseDown={(e) => { e.preventDefault(); handleEditClick('jobTitle'); }} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {/* Username */}
          <div className="flex flex-col md:flex-row md:items-start justify-between px-6 py-5 gap-2 md:gap-4">
            <div className="flex flex-col gap-0.5 md:pt-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">One word, like a nickname or first name</span>
            </div>
            <div className="w-full md:w-72 relative">
              <input 
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={() => setEditingField(null)}
                readOnly={editingField !== 'username'}
                placeholder="e.g. dexuser"
                className={cn(
                  "w-full bg-transparent rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none transition-all pr-8",
                  editingField === 'username' ? "border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" : "border border-transparent cursor-default hover:border-gray-100 dark:hover:border-zinc-800"
                )}
              />
              <button type="button" onMouseDown={(e) => { e.preventDefault(); handleEditClick('username'); }} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Workspace access</h2>
        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Remove yourself from the workspace</span>
          <button className="px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-100 dark:border-red-900/50 w-full sm:w-auto">
            Leave Workspace
          </button>
        </div>
      </div>

    </div>
  );
}
