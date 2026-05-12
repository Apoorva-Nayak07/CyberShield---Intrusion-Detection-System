import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, User, Key, Save } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [preferences, setPreferences] = useState(user?.preferences || {});
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const response = await api.put('/auth/profile', { name: profileForm.name, preferences });
      updateUser(response.data.data);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-dark-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyber-400" />
          Settings
        </h1>
        <p className="text-sm text-dark-400 mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="flex gap-5">
        {/* Sidebar tabs */}
        <div className="w-48 flex-shrink-0">
          <div className="glass-card p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item w-full ${activeTab === tab.id ? 'active' : ''}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-dark-100">Profile Information</h3>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyber-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-dark-100">{user?.name}</p>
                  <p className="text-sm text-dark-400">{user?.email}</p>
                  <span className="text-xs px-2 py-0.5 rounded bg-cyber-500/20 text-cyber-400 capitalize mt-1 inline-block">
                    {user?.role}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="cyber-input"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1.5">Email</label>
                <input type="email" value={user?.email} disabled className="cyber-input opacity-50 cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1.5">Theme</label>
                <select
                  value={preferences.theme || 'dark'}
                  onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                  className="cyber-input"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <button onClick={saveProfile} disabled={saving} className="btn-primary">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-dark-100">Change Password</h3>

              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="cyber-input"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="cyber-input"
                  placeholder="Min. 8 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="cyber-input"
                  placeholder="Repeat new password"
                />
              </div>

              <button onClick={changePassword} disabled={saving} className="btn-primary">
                <Key className="w-4 h-4" />
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-dark-100">Notification Preferences</h3>

              {[
                { key: 'notifications', label: 'Enable Notifications', desc: 'Receive in-app notifications' },
                { key: 'soundAlerts', label: 'Sound Alerts', desc: 'Play sound for critical alerts' },
                { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive email notifications' },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between p-3 rounded-lg bg-dark-800/30">
                  <div>
                    <p className="text-sm font-medium text-dark-100">{pref.label}</p>
                    <p className="text-xs text-dark-400">{pref.desc}</p>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, [pref.key]: !preferences[pref.key] })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      preferences[pref.key] ? 'bg-cyber-600' : 'bg-dark-600'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      preferences[pref.key] ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}

              <button onClick={saveProfile} disabled={saving} className="btn-primary">
                <Save className="w-4 h-4" />
                Save Preferences
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
