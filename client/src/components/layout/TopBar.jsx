import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Bell, Search, Sun, Moon, Shield, ChevronDown,
  User, Settings, LogOut, Zap
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSocketStore } from '../../store/socketStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function TopBar({ sidebarOpen, onToggleSidebar, onMobileMenuOpen }) {
  const { user, logout } = useAuthStore();
  const { isConnected, liveAlerts } = useSocketStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const unreadAlerts = liveAlerts.filter((a) => !a.isRead).length;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-14 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50 flex items-center px-4 gap-4 flex-shrink-0 relative z-30">
      {/* Left: Menu toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md hidden md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search threats, IPs, events..."
            className="w-full bg-dark-800/50 border border-dark-600/50 rounded-lg pl-9 pr-4 py-2 text-sm text-dark-200 placeholder-dark-500 focus:outline-none focus:border-cyber-500/50 focus:ring-1 focus:ring-cyber-500/20 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-dark-500 bg-dark-700 px-1.5 py-0.5 rounded border border-dark-600">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Connection status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-800/50 border border-dark-700/50">
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-xs text-dark-400 font-mono">
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* Current time */}
        <div className="hidden lg:flex items-center px-2.5 py-1.5 rounded-lg bg-dark-800/50 border border-dark-700/50">
          <span className="text-xs text-dark-400 font-mono">
            {format(new Date(), 'HH:mm:ss')}
          </span>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-mono"
              >
                {unreadAlerts > 9 ? '9+' : unreadAlerts}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 glass-card shadow-2xl z-50"
              >
                <div className="p-3 border-b border-dark-700/50 flex items-center justify-between">
                  <span className="text-sm font-semibold text-dark-100">Live Alerts</span>
                  <span className="text-xs text-dark-400">{liveAlerts.length} total</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {liveAlerts.length === 0 ? (
                    <div className="p-4 text-center text-dark-400 text-sm">No live alerts</div>
                  ) : (
                    liveAlerts.slice(0, 10).map((alert, i) => (
                      <div key={i} className="p-3 border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors">
                        <div className="flex items-start gap-2">
                          <span className={`badge-${alert.severity} mt-0.5`}>{alert.severity}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-dark-200 truncate">{alert.title}</p>
                            <p className="text-xs text-dark-500 mt-0.5">{alert.sourceIp}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2">
                  <button
                    onClick={() => { navigate('/dashboard/alerts'); setShowNotifications(false); }}
                    className="w-full text-xs text-cyber-400 hover:text-cyber-300 py-1.5 transition-colors"
                  >
                    View all alerts →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-dark-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyber-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-dark-200 leading-none">{user?.name}</p>
              <p className="text-xs text-dark-500 capitalize leading-none mt-0.5">{user?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-dark-400 hidden sm:block" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 glass-card shadow-2xl z-50"
              >
                <div className="p-3 border-b border-dark-700/50">
                  <p className="text-sm font-medium text-dark-100">{user?.name}</p>
                  <p className="text-xs text-dark-400">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { navigate('/dashboard/settings'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-800/50 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowUserMenu(false); setShowNotifications(false); }}
        />
      )}
    </header>
  );
}
