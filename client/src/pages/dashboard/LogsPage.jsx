import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FileText, Search, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const levelColors = {
  debug: 'text-dark-400',
  info: 'text-blue-400',
  warn: 'text-yellow-400',
  error: 'text-red-400',
  critical: 'text-red-500',
};

export default function LogsPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 50, level: '', category: '', search: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['logs', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      return api.get(`/logs?${params}`).then((r) => r.data);
    },
    keepPreviousData: true,
  });

  const handleExport = async () => {
    try {
      const response = await api.get('/logs/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cybershield-logs-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Logs exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const logs = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyber-400" />
            Logs Explorer
          </h1>
          <p className="text-sm text-dark-400 mt-0.5">{pagination.total || 0} log entries</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="btn-secondary text-sm py-2">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button onClick={() => refetch()} className="btn-secondary text-sm py-2">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="cyber-input pl-9 text-sm py-2"
            />
          </div>
          <select
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value, page: 1 })}
            className="cyber-input text-sm py-2 w-32"
          >
            <option value="">All Levels</option>
            {['debug', 'info', 'warn', 'error', 'critical'].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
            className="cyber-input text-sm py-2 w-36"
          >
            <option value="">All Categories</option>
            {['auth', 'threat', 'network', 'system', 'user', 'api', 'ml', 'audit'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Level</th>
                <th>Category</th>
                <th>Message</th>
                <th>Source IP</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j}><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-dark-400">No logs found</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td className="font-mono text-xs text-dark-400">
                      {format(new Date(log.createdAt), 'MM/dd HH:mm:ss')}
                    </td>
                    <td>
                      <span className={`text-xs font-mono font-semibold uppercase ${levelColors[log.level] || 'text-dark-400'}`}>
                        {log.level}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-dark-700/50 text-dark-300">
                        {log.category}
                      </span>
                    </td>
                    <td className="text-xs text-dark-200 max-w-xs truncate">{log.message}</td>
                    <td className="font-mono text-xs text-cyber-400">{log.sourceIp || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-700/50">
            <span className="text-xs text-dark-400">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page <= 1}
                className="p-1.5 rounded text-dark-400 hover:text-dark-200 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page >= pagination.pages}
                className="p-1.5 rounded text-dark-400 hover:text-dark-200 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
