import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  trendValue,
  loading = false,
  pulse = false,
  className = '',
}) {
  const colorMap = {
    blue: {
      bg: 'bg-cyber-500/10',
      border: 'border-cyber-500/20',
      icon: 'text-cyber-400',
      value: 'text-cyber-400',
      glow: 'shadow-[0_0_20px_rgba(24,144,255,0.1)]',
    },
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      icon: 'text-red-400',
      value: 'text-red-400',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.1)]',
    },
    green: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      icon: 'text-green-400',
      value: 'text-green-400',
      glow: 'shadow-[0_0_20px_rgba(74,222,128,0.1)]',
    },
    yellow: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      icon: 'text-yellow-400',
      value: 'text-yellow-400',
      glow: 'shadow-[0_0_20px_rgba(250,204,21,0.1)]',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      icon: 'text-purple-400',
      value: 'text-purple-400',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.1)]',
    },
  };

  const colors = colorMap[color] || colorMap.blue;

  if (loading) {
    return (
      <div className={`glass-card p-5 ${className}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="skeleton w-10 h-10 rounded-lg" />
          <div className="skeleton w-16 h-5 rounded" />
        </div>
        <div className="skeleton w-20 h-8 rounded mb-2" />
        <div className="skeleton w-32 h-4 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`glass-card p-5 ${colors.glow} ${className} relative overflow-hidden`}
    >
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-24 h-24 ${colors.bg} rounded-full -translate-y-8 translate-x-8 blur-2xl`} />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 ${colors.bg} border ${colors.border} rounded-lg flex items-center justify-center`}>
            {Icon && <Icon className={`w-5 h-5 ${colors.icon}`} />}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-green-400' : 'text-dark-400'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> :
               trend === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> :
               <Minus className="w-3.5 h-3.5" />}
              {trendValue}
            </div>
          )}
        </div>

        <div className="flex items-end gap-2 mb-1">
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-2xl font-bold font-mono ${colors.value}`}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.span>
          {pulse && (
            <span className="mb-1 w-2 h-2 rounded-full bg-current animate-pulse" style={{ color: 'inherit' }} />
          )}
        </div>

        <p className="text-sm font-medium text-dark-200">{title}</p>
        {subtitle && <p className="text-xs text-dark-400 mt-0.5">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
