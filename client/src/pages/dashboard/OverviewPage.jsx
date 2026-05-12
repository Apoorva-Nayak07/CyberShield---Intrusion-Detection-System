import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Shield, Activity, Zap, TrendingUp,
  Globe, Clock, CheckCircle, XCircle, Eye
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import StatCard from '../../components/ui/StatCard';
import { useSocketStore } from '../../store/socketStore';
import { format } from 'date-fns';

const COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
  info: '#6b7280',
};

const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6'];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-900/95 border border-dark-700/50 rounded-lg p-3 shadow-xl">
        <p className="text-xs text-dark-400 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-xs font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function OverviewPage() {
  const { liveThreats, isConnected } = useSocketStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: overview, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.get('/analytics/overview').then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { data: recentThreats } = useQuery({
    queryKey: ['recent-threats'],
    queryFn: () => api.get('/threats?limit=8&sortBy=createdAt&sortOrder=desc').then((r) => r.data.data),
    refetchInterval: 15000,
  });

  const summary = overview?.summary || {};
  const threatTrend = overview?.threatTrend || [];
  const topAttackTypes = overview?.topAttackTypes || [];
  const threatsBySeverity = overview?.threatsBySeverity || {};

  const severityData = Object.entries(threatsBySeverity).map(([name, value]) => ({ name, value }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-100">Security Overview</h1>
          <p className="text-sm text-dark-400 mt-0.5">
            Real-time threat intelligence dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800/50 border border-dark-700/50">
            <Clock className="w-3.5 h-3.5 text-dark-400" />
            <span className="text-xs font-mono text-dark-300">
              {format(currentTime, 'MMM dd, yyyy HH:mm:ss')}
            </span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            isConnected
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-xs font-medium">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Threats"
          value={summary.activeThreats ?? 0}
          subtitle="Requires attention"
          icon={AlertTriangle}
          color="red"
          trend="up"
          trendValue={`+${summary.threats24h ?? 0} today`}
          loading={isLoading}
          pulse
        />
        <StatCard
          title="Critical Alerts"
          value={summary.criticalAlerts ?? 0}
          subtitle="Immediate action needed"
          icon={Zap}
          color="red"
          loading={isLoading}
        />
        <StatCard
          title="Threats (24h)"
          value={summary.threats24h ?? 0}
          subtitle="Last 24 hours"
          icon={Activity}
          color="yellow"
          loading={isLoading}
        />
        <StatCard
          title="Resolved Today"
          value={summary.resolvedToday ?? 0}
          subtitle="Successfully mitigated"
          icon={CheckCircle}
          color="green"
          loading={isLoading}
        />
      </motion.div>

      {/* Secondary stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Threats"
          value={summary.totalThreats ?? 0}
          subtitle="All time"
          icon={Shield}
          color="blue"
          loading={isLoading}
        />
        <StatCard
          title="Network Events"
          value={summary.networkEvents24h ?? 0}
          subtitle="Last 24 hours"
          icon={Globe}
          color="purple"
          loading={isLoading}
        />
        <StatCard
          title="Threats (7d)"
          value={summary.threats7d ?? 0}
          subtitle="Last 7 days"
          icon={TrendingUp}
          color="blue"
          loading={isLoading}
        />
        <StatCard
          title="Risk Score"
          value={`${summary.avgRiskScore ?? 0}/100`}
          subtitle="Average active risk"
          icon={Eye}
          color={summary.avgRiskScore > 70 ? 'red' : summary.avgRiskScore > 40 ? 'yellow' : 'green'}
          loading={isLoading}
        />
      </motion.div>

      {/* Charts Row 1 */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Threat Trend */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark-100">Threat Trend (7 Days)</h3>
            <span className="text-xs text-dark-400">Daily breakdown</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={threatTrend}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1890ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#7c7e84', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#7c7e84', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="total" name="Total" stroke="#1890ff" fill="url(#totalGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="critical" name="Critical" stroke="#ef4444" fill="url(#criticalGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark-100">Severity Distribution</h3>
            <span className="text-xs text-dark-400">24h</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[entry.name] || PIE_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {severityData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[item.name] || PIE_COLORS[i] }} />
                  <span className="text-dark-300 capitalize">{item.name}</span>
                </div>
                <span className="text-dark-400 font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Charts Row 2 */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Attack Types */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-dark-100 mb-4">Top Attack Types (7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topAttackTypes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#7c7e84', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="type"
                tick={{ fill: '#7c7e84', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={100}
                tickFormatter={(v) => v.replace(/_/g, ' ')}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Count" fill="#1890ff" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Threats */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark-100">Recent Threats</h3>
            <span className="text-xs text-cyber-400 cursor-pointer hover:text-cyber-300">View all →</span>
          </div>
          <div className="space-y-2">
            {(recentThreats || []).slice(0, 6).map((threat, i) => (
              <motion.div
                key={threat._id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-dark-800/30 hover:bg-dark-800/50 transition-colors"
              >
                <span className={`badge-${threat.severity}`}>{threat.severity}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-dark-200 truncate">
                    {threat.type?.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <p className="text-xs text-dark-500 font-mono">{threat.sourceIp}</p>
                </div>
                <span className="text-xs text-dark-500 flex-shrink-0">
                  {threat.geoLocation?.countryCode || '??'}
                </span>
              </motion.div>
            ))}
            {(!recentThreats || recentThreats.length === 0) && (
              <div className="text-center py-8 text-dark-400 text-sm">
                No recent threats detected
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Live feed */}
      {liveThreats.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="glass-card p-5 border-cyber-500/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <h3 className="text-sm font-semibold text-dark-100">Live Threat Feed</h3>
            <span className="text-xs text-dark-400">({liveThreats.length} events)</span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {liveThreats.slice(0, 10).map((threat, i) => (
              <div key={i} className="flex items-center gap-3 text-xs font-mono py-1.5 px-3 rounded bg-dark-800/30">
                <span className="text-dark-500">{format(new Date(threat.createdAt || Date.now()), 'HH:mm:ss')}</span>
                <span className={`badge-${threat.severity}`}>{threat.severity}</span>
                <span className="text-dark-300">{threat.type?.replace(/_/g, ' ')}</span>
                <span className="text-cyber-400">{threat.sourceIp}</span>
                <span className="text-dark-500 ml-auto">{threat.geoLocation?.country || 'Unknown'}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
