import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle, Search, Filter, RefreshCw, CheckCircle,
  Eye, ChevronLeft, ChevronRight, Download, Zap
} from 'lucide-react';
import api from '../../lib/api';
import SeverityBadge from '../../components/ui/SeverityBadge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const THREAT_TYPES = [
  'port_scan', 'brute_force', 'sql_injection', 'ddos', 'malware',
  'suspicious_login', 'traffic_spike', 'unauthorized_access', 'xss', 'anomaly',
];

export default function ThreatDetectionPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    page: 1, limit: 20, severity: '', status: '', type: '', search: '',
  });
  const [selectedThreat, setSelectedThreat] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['threats', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      return api.get(`/threats?${params}`).then((r) => r.data);
    },
    keepPreviousData: true,
  });

  const resolveMutation = useMutation({
    mutationFn: (id) => api.put(`/threats/${id}/resolve`),
    onSuccess: () => {
      toast.success('Threat resolved');
      queryClient.invalidateQueries(['threats']);
    },
  });

  const threats = data?.data || [];
  const pagination = data?.pagination || {};

  const canModify = ['admin', 'analyst'].includes(user?.role);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Threat Detection
          </h1>
          <p className="text-sm text-dark-400 mt-0.5">
            {pagination.total || 0} total threats detected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="btn-secondary text-sm py-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
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
              placeholder="Search IP, description..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="cyber-input pl-9 text-sm py-2"
            />
          </div>

          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value, page: 1 })}
            className="cyber-input text-sm py-2 w-36"
          >
            <option value="">All Severity</option>
            {['critical', 'high', 'medium', 'low', 'info'].map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="cyber-input text-sm py-2 w-36"
          >
            <option value="">All Status</option>
            {['active', 'investigating', 'resolved', 'false_positive'].map((s) => (
              <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="cyber-input text-sm py-2 w-40"
          >
            <option value="">All Types</option>
            {THREAT_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Type</th>
                <th>Source IP</th>
                <th>Protocol</th>
                <th>Location</th>
                <th>Status</th>
                <th>Risk Score</th>
                <th>Detected</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j}><div className="skeleton h-4 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : threats.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-dark-400">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No threats found
                  </td>
                </tr>
              ) : (
                threats.map((threat) => (
                  <motion.tr
                    key={threat._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedThreat(threat)}
                  >
                    <td><SeverityBadge severity={threat.severity} /></td>
                    <td>
                      <span className="text-xs font-mono text-dark-200">
                        {threat.type?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-cyber-400">{threat.sourceIp}</span>
                    </td>
                    <td>
                      <span className="text-xs text-dark-300">{threat.protocol}</span>
                    </td>
                    <td>
                      <span className="text-xs text-dark-300">
                        {threat.geoLocation?.country || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        threat.status === 'active' ? 'text-red-400 bg-red-500/10' :
                        threat.status === 'resolved' ? 'text-green-400 bg-green-500/10' :
                        threat.status === 'investigating' ? 'text-yellow-400 bg-yellow-500/10' :
                        'text-dark-400 bg-dark-700/50'
                      }`}>
                        {threat.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-dark-700 rounded-full h-1.5 w-16">
                          <div
                            className={`h-1.5 rounded-full ${
                              threat.riskScore >= 80 ? 'bg-red-500' :
                              threat.riskScore >= 60 ? 'bg-orange-500' :
                              threat.riskScore >= 40 ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${threat.riskScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-dark-400">{threat.riskScore}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-dark-400">
                        {format(new Date(threat.createdAt), 'MM/dd HH:mm')}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedThreat(threat)}
                          className="p-1.5 rounded text-dark-400 hover:text-cyber-400 hover:bg-cyber-500/10 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canModify && threat.status !== 'resolved' && (
                          <button
                            onClick={() => resolveMutation.mutate(threat._id)}
                            className="p-1.5 rounded text-dark-400 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                            title="Resolve"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-700/50">
            <span className="text-xs text-dark-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page <= 1}
                className="p-1.5 rounded text-dark-400 hover:text-dark-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-dark-300 font-mono">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page >= pagination.pages}
                className="p-1.5 rounded text-dark-400 hover:text-dark-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Threat Detail Modal */}
      {selectedThreat && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedThreat(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-dark-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SeverityBadge severity={selectedThreat.severity} />
                <h3 className="font-semibold text-dark-100">
                  {selectedThreat.type?.replace(/_/g, ' ').toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setSelectedThreat(null)}
                className="text-dark-400 hover:text-dark-200 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Source IP', selectedThreat.sourceIp],
                  ['Destination IP', selectedThreat.destinationIp || 'N/A'],
                  ['Protocol', selectedThreat.protocol],
                  ['Port', selectedThreat.destinationPort || 'N/A'],
                  ['Status', selectedThreat.status],
                  ['Risk Score', `${selectedThreat.riskScore}/100`],
                  ['Detected By', selectedThreat.detectedBy?.replace(/_/g, ' ')],
                  ['Location', selectedThreat.geoLocation?.country || 'Unknown'],
                ].map(([label, value]) => (
                  <div key={label} className="bg-dark-800/30 rounded-lg p-3">
                    <p className="text-xs text-dark-400 mb-1">{label}</p>
                    <p className="text-sm font-mono text-dark-100">{value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-dark-800/30 rounded-lg p-3">
                <p className="text-xs text-dark-400 mb-1">Description</p>
                <p className="text-sm text-dark-200">{selectedThreat.description}</p>
              </div>

              {selectedThreat.aiPrediction && (
                <div className="bg-dark-800/30 rounded-lg p-3">
                  <p className="text-xs text-dark-400 mb-2">AI Prediction</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-dark-300">Model: <span className="text-cyber-400">{selectedThreat.aiPrediction.model}</span></span>
                    <span className="text-dark-300">Confidence: <span className="text-green-400">{Math.round((selectedThreat.aiPrediction.confidence || 0) * 100)}%</span></span>
                  </div>
                </div>
              )}

              {canModify && selectedThreat.status !== 'resolved' && (
                <button
                  onClick={() => {
                    resolveMutation.mutate(selectedThreat._id);
                    setSelectedThreat(null);
                  }}
                  className="btn-primary w-full justify-center"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Resolved
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
