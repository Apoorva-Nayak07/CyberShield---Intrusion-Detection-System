import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../../lib/api';

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

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d');

  const { data: trends } = useQuery({
    queryKey: ['trends', period],
    queryFn: () => api.get(`/analytics/trends?period=${period}`).then((r) => r.data.data),
    refetchInterval: 60000,
  });

  const { data: overview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.get('/analytics/overview').then((r) => r.data.data),
  });

  const trendData = trends?.trends || [];
  const attackTypes = trends?.attackTypes || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyber-400" />
            Analytics
          </h1>
          <p className="text-sm text-dark-400 mt-0.5">Threat trends and statistical analysis</p>
        </div>
        <div className="flex items-center gap-2">
          {['24h', '7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p
                  ? 'bg-cyber-600/20 text-cyber-400 border border-cyber-500/30'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-dark-100 mb-4">Threat Volume Over Time</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1890ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="timestamp" tick={{ fill: '#7c7e84', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#7c7e84', fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area type="monotone" dataKey="total" name="Total" stroke="#1890ff" fill="url(#totalGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="critical" name="Critical" stroke="#ef4444" fill="url(#criticalGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="high" name="High" stroke="#f97316" fill="url(#highGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attack Types */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-dark-100 mb-4">Attack Type Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={attackTypes.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#7c7e84', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="type"
                tick={{ fill: '#7c7e84', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={110}
                tickFormatter={(v) => v.replace(/_/g, ' ')}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Count" fill="#1890ff" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resolution Rate */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-dark-100 mb-4">Severity Breakdown</h3>
          <div className="space-y-4 mt-6">
            {[
              { label: 'Critical', value: overview?.threatsBySeverity?.critical || 0, color: 'bg-red-500', max: 100 },
              { label: 'High', value: overview?.threatsBySeverity?.high || 0, color: 'bg-orange-500', max: 100 },
              { label: 'Medium', value: overview?.threatsBySeverity?.medium || 0, color: 'bg-yellow-500', max: 100 },
              { label: 'Low', value: overview?.threatsBySeverity?.low || 0, color: 'bg-blue-500', max: 100 },
            ].map((item) => {
              const total = (overview?.summary?.threats24h || 1);
              const pct = Math.round((item.value / total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-dark-300">{item.label}</span>
                    <span className="text-xs font-mono text-dark-400">{item.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
