import React, { useState, useEffect } from 'react';
import { User, Mail, Settings, Lock, Trash2, Check, Moon, Sun, Shield, X, AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

export default function Profile() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  // --- UI & THEME STATES ---
  const [toast, setToast] = useState(null); // { message: '', type: 'success' | 'error' }
  const [activeModal, setActiveModal] = useState(null); // 'password' | 'delete' | null
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- FORM STATES ---
  const [profileForm, setProfileForm] = useState({ 
    name: user?.name || user?.username || '',
    bio: user?.bio || 'Passionate about healthy eating and finding the best recipes!'
  });
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Check initial theme on load
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- API HANDLERS ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.put('/api/auth/update-profile', { 
        name: profileForm.name.trim(),
        bio: profileForm.bio.trim()
      });
      showToast("Profile details saved! ✨", "success");
      // Brief reload to update sidebar name universally
      setTimeout(() => window.location.reload(), 1000); 
    } catch (error) {
      showToast("Failed to save profile.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showToast("New passwords do not match!", "error");
      return;
    }
    if (passwords.new.length < 8) {
      showToast("New password must be at least 8 characters.", "error");
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.put('/api/auth/change-password', {
        old_password: passwords.old,
        new_password: passwords.new
      });
      showToast("Password updated successfully! 🔒", "success");
      setActiveModal(null);
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (error) {
      if (error.response?.status === 400) {
        showToast("Incorrect current password.", "error");
      } else {
        showToast("Failed to update password.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsSaving(true);
    try {
      await apiClient.delete('/api/auth/delete-account');
      setActiveModal(null);
      logout();
      navigate('/'); 
    } catch (error) {
      showToast("Failed to delete account.", "error");
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-8 relative pb-12">
      
      <header className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
           <User className="text-brand-green" /> My Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your personal information, bio, and app preferences.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PROFILE PREVIEW CARD */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-200 dark:border-dark-border shadow-sm text-center sticky top-8">
            <div className="w-28 h-28 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold border-4 border-white dark:border-dark-bg shadow-lg">
              {profileForm.name ? profileForm.name[0].toUpperCase() : 'U'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {profileForm.name || "Chef"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 text-sm mb-4">
              <Mail size={14} /> {user?.email || "No email provided"}
            </p>
            
            <div className="bg-gray-50 dark:bg-dark-bg/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-300 italic mb-6">
              "{profileForm.bio}"
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center px-4">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Status</span>
              <span className="bg-brand-green/10 text-brand-green px-3 py-1 rounded-lg text-xs font-bold inline-block">
                Active Member
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EDIT FORMS & SETTINGS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SECTION 1: PUBLIC DETAILS */}
          <div className="bg-white dark:bg-dark-card rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-dark-border shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Settings size={20} className="text-brand-green" /> Public Details
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-5">
              
              {/* Disabled Email Field */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled
                    className="w-full bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-500 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                  />
                  <div className="absolute right-4 top-3.5 text-gray-400">
                    <Lock size={16} />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5 ml-1">Email address cannot be changed. Contact support if needed.</p>
              </div>

              {/* Editable Name Field */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Display Name</label>
                <input 
                  type="text" required
                  value={profileForm.name} 
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="Your name"
                />
              </div>

              {/* Editable Bio Field */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Short Bio</label>
                <textarea 
                  rows="3"
                  value={profileForm.bio} 
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all resize-none text-gray-900 dark:text-white"
                  placeholder="Tell the community a bit about your food journey..."
                ></textarea>
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit" disabled={isSaving}
                  className="bg-brand-green hover:bg-brand-green-hover disabled:bg-brand-green/50 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
                >
                  {isSaving ? 'Saving...' : <><Check size={18} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>

          {/* SECTION 2: APPEARANCE */}
          <div className="bg-white dark:bg-dark-card rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-dark-border shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Moon size={20} className="text-brand-green" /> Appearance
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-gray-800 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white dark:bg-dark-card rounded-full flex items-center justify-center shadow-sm text-gray-500 dark:text-gray-400">
                  {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Dark Mode</h4>
                  <p className="text-xs text-gray-500">Easier on the eyes, better for night-time cooking.</p>
                </div>
              </div>
              
              {/* Interactive Toggle Switch */}
              <button 
                onClick={toggleTheme}
                className={`w-14 h-7 rounded-full p-1 transition-colors relative focus:outline-none ${isDarkMode ? 'bg-brand-green' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                 <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>

          {/* SECTION 3: SECURITY & DANGER ZONE */}
          <div className="bg-white dark:bg-dark-card rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-dark-border shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Shield size={20} className="text-brand-green" /> Security
            </h3>
            
            <div className="space-y-4">
              {/* Update Password */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-gray-800 rounded-2xl gap-4">
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Account Password</h4>
                  <p className="text-xs text-gray-500 mt-1">Change your password to keep your account secure.</p>
                </div>
                <button 
                  onClick={() => setActiveModal('password')}
                  className="whitespace-nowrap px-5 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 hover:border-brand-green dark:hover:border-brand-green text-gray-700 dark:text-gray-300 hover:text-brand-green rounded-xl text-sm font-bold transition-colors"
                >
                  Update Password
                </button>
              </div>

              {/* Delete Account */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl gap-4">
                <div className="text-left">
                  <h4 className="font-bold text-red-600 dark:text-red-400 text-sm">Delete Account</h4>
                  <p className="text-xs text-red-500 dark:text-red-400/70 mt-1">Permanently remove your account and all saved recipes.</p>
                </div>
                <button 
                  onClick={() => setActiveModal('delete')}
                  className="whitespace-nowrap px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2 justify-center"
                >
                  <Trash2 size={16} /> Delete Account
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- PASSWORD MODAL --- */}
      {activeModal === 'password' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-dark-border">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-dark-bg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Lock size={20} className="text-brand-green"/> Change Password
              </h2>
              <button onClick={() => { setActiveModal(null); setPasswords({old:'',new:'',confirm:''}); }} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-dark-card rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Password</label>
                <input 
                  type="password" required
                  value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-green outline-none text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">New Password</label>
                <input 
                  type="password" required minLength="8"
                  value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-green outline-none text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Confirm New Password</label>
                <input 
                  type="password" required minLength="8"
                  value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-green outline-none text-gray-900 dark:text-white"
                />
              </div>
              
              <button 
                type="submit" disabled={isSaving}
                className="w-full mt-4 bg-brand-green hover:bg-brand-green-hover disabled:bg-gray-300 text-white py-3.5 rounded-xl font-bold transition-colors"
              >
                {isSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE ACCOUNT MODAL --- */}
      {activeModal === 'delete' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center border border-gray-200 dark:border-dark-border">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Account?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              We'll be sad to see you go! Are you absolutely sure? This will permanently wipe your cookbook and settings.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDeleteAccount}
                disabled={isSaving}
                className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-dark-bg dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[100] animate-fade-in">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl font-bold text-white 
            ${toast.type === 'error' ? 'bg-red-500' : 'bg-brand-green'}`}
          >
            {toast.type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}