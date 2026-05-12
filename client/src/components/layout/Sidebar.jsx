import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, LayoutDashboard, AlertTriangle, Bell, Activity,
  BarChart3, Globe, FileText, Users, Settings, Brain,
  Network, LogOut, ChevronLeft, Zap, Radio
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSocketStore } from '../../store/socketStore';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Overview', exact: true },
  { path: '/dashboard/threats', icon: AlertTriangle, label: 'Threat Detection' },
  { path: '/dashboard/alerts', icon: Bell, label: 'Alerts Center' },
  { path: '/dashboard/network', icon: Network, label: 'Network Monitor' },
  { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/dashboard/intelligence', icon: Globe, label: 'Threat Intel' },
  { path: '/dashboard/logs', icon: FileText, label: 'Logs Explorer' },
  { path: '/dashboard/ai-insights', icon: Brain, label: 'AI Insights' },
  { path: '/dashboard/reports', icon: Activity, label: 'Reports', roles: ['admin', 'analyst'] },
  { path: '/dashboard/users', icon: Users, label: 'User Management', roles: ['admin'] },
  { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuthStore();
  const { isConnected, liveThreats } = useSocketStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  const criticalCount = liveThreats.filter((t) => t.severity === 'critical').length;

  return (
    <div className="w-64 h-full bg-dark-900/95 backdrop-blur-xl border-r border-dark-700/50 flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-dark-700/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 bg-cyber-600/20 rounded-lg flex items-center justify-center border border-cyber-500/30">
              <Shield className="w-5 h-5 text-cyber-400" />
            </div>
            {isConnected && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-dark-900 animate-pulse" />
            )}
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">CyberShield</h1>
            <p className="text-xs text-dark-400">IDS Platform</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800 transition-colors lg:flex hidden"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Live status */}
      <div className="px-4 py-3 border-b border-dark-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-green-400' : 'text-red-400'}`} />
            <span className="text-xs text-dark-400">
              {isConnected ? 'Live Monitoring' : 'Disconnected'}
            </span>
          </div>
          {criticalCount > 0 && (
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-mono"
            >
              {criticalCount} CRITICAL
            </motion.span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cyber-400' : ''}`} />
                <span className="flex-1">{item.label}</span>
                {item.label === 'Alerts Center' && liveThreats.length > 0 && (
                  <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-mono min-w-[20px] text-center">
                    {liveThreats.length > 99 ? '99+' : liveThreats.length}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-dark-700/50">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-800/50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark-100 truncate">{user?.name}</p>
            <p className="text-xs text-dark-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
