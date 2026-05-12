import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle, Eye, Search, Filter, RefreshCw, MessageSquare } from 'lucide-react';
import api from '../../lib/api';
import SeverityBadge from '../../components/ui/SeverityBadge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useSocketStore } from '../../store/socketStore';

export default function AlertsPage() {
  const { user } = useAuthStore();
  const { liveAlerts } = useSocketStore();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ page: 1, limit: 20, severity: '', status: '', search: '' });
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [noteText, setNoteText] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['alerts', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      return api.get(`/alerts?${params}`).then((r) => r.data);
    },
    keepPreviousData: true,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id) => api.put(`/alerts/${id}/acknowledge`),
    onSuccess: () => { toast.success('Alert acknowledged'); queryClient.invalidateQueries(['alerts']); },
  });

  const resolveMutation = useMutation({
    mutationFn: (id) => api.put(`/alerts/${id}/resolve`),
    onSuccess: () => { toast.success('Alert resolved'); queryClient.invalidateQueries(['alerts']); },
  });

  const addNoteMutation = useMutation({
    mutationFn: ({ id, content }) => api.post(`/alerts/${id}/notes`, { content }),
    onSuccess: () => { toast.success('Note added'); setNoteText(''); queryClient.invalidateQueries(['alerts']); },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.put('/alerts/mark-all-read'),
    onSuccess: () => { toast.success('All marked as read'); queryClient.invalidateQueries(['alerts']); },
  });

  const alerts = data?.data || [];
  const unreadCount = data?.unreadCount || 0;
  const canModify = ['admin', 'analyst'].includes(user?.role);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            Alerts Center
            {unreadCount > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-mono">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-dark-400 mt-0.5">{data?.pagination?.total || 0} total alerts</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={() => markAllReadMutation.mutate()} className="btn-secondary text-sm py-2">
              Mark all read
            </button>
          )}
          <button onClick={() => refetch()} className="btn-secondary text-sm py-2">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live alerts banner */}
      {liveAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 border-red-500/20 bg-red-500/5"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-sm text-red-400 font-medium">
              {liveAlerts.length} live alert{liveAlerts.length > 1 ? 's' : ''} received this session
            </span>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search alerts..."
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
            {['critical', 'high', 'medium', 'low'].map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="cyber-input text-sm py-2 w-40"
          >
            <option value="">All Status</option>
            {['new', 'acknowledged', 'investigating', 'resolved'].map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="skeleton w-16 h-5 rounded" />
                <div className="skeleton flex-1 h-4 rounded" />
                <div className="skeleton w-20 h-4 rounded" />
              </div>
            </div>
          ))
        ) : alerts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Bell className="w-10 h-10 mx-auto mb-3 text-dark-600" />
            <p className="text-dark-400">No alerts found</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <motion.div
              key={alert._id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card p-4 cursor-pointer hover:border-dark-600/50 transition-all ${
                !alert.isRead ? 'border-l-2 border-l-cyber-500' : ''
              }`}
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="flex items-start gap-3">
                <SeverityBadge severity={alert.severity} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-dark-100 truncate">{alert.title}</p>
                    {!alert.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-dark-400 truncate">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-mono text-cyber-400">{alert.sourceIp}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      alert.status === 'new' ? 'text-red-400 bg-red-500/10' :
                      alert.status === 'resolved' ? 'text-green-400 bg-green-500/10' :
                      'text-yellow-400 bg-yellow-500/10'
                    }`}>
                      {alert.status}
                    </span>
                    <span className="text-xs text-dark-500">
                      {format(new Date(alert.createdAt), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                </div>
                {canModify && (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {alert.status === 'new' && (
                      <button
                        onClick={() => acknowledgeMutation.mutate(alert._id)}
                        className="p-1.5 rounded text-dark-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors text-xs"
                        title="Acknowledge"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {alert.status !== 'resolved' && (
                      <button
                        onClick={() => resolveMutation.mutate(alert._id)}
                        className="p-1.5 rounded text-dark-400 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                        title="Resolve"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAlert(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-dark-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SeverityBadge severity={selectedAlert.severity} />
                <h3 className="font-semibold text-dark-100 text-sm">{selectedAlert.title}</h3>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="text-dark-400 hover:text-dark-200 text-xl">×</button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-dark-300">{selectedAlert.message}</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Source IP', selectedAlert.sourceIp],
                  ['Status', selectedAlert.status],
                  ['Category', selectedAlert.category],
                  ['Priority', selectedAlert.priority],
                ].map(([label, value]) => (
                  <div key={label} className="bg-dark-800/30 rounded-lg p-3">
                    <p className="text-xs text-dark-400 mb-1">{label}</p>
                    <p className="text-sm font-mono text-dark-100 capitalize">{value}</p>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {selectedAlert.notes?.length > 0 && (
                <div>
                  <p className="text-xs text-dark-400 mb-2">Analyst Notes</p>
                  <div className="space-y-2">
                    {selectedAlert.notes.map((note, i) => (
                      <div key={i} className="bg-dark-800/30 rounded-lg p-3">
                        <p className="text-xs text-dark-400 mb-1">{note.author?.name} · {format(new Date(note.createdAt), 'MMM dd HH:mm')}</p>
                        <p className="text-sm text-dark-200">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add note */}
              {canModify && (
                <div>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add analyst note..."
                    className="cyber-input text-sm resize-none"
                    rows={3}
                  />
                  <button
                    onClick={() => addNoteMutation.mutate({ id: selectedAlert._id, content: noteText })}
                    disabled={!noteText.trim()}
                    className="btn-primary text-sm mt-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Add Note
                  </button>
                </div>
              )}

              {canModify && selectedAlert.status !== 'resolved' && (
                <div className="flex gap-2">
                  {selectedAlert.status === 'new' && (
                    <button
                      onClick={() => { acknowledgeMutation.mutate(selectedAlert._id); setSelectedAlert(null); }}
                      className="btn-secondary flex-1 justify-center text-sm"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => { resolveMutation.mutate(selectedAlert._id); setSelectedAlert(null); }}
                    className="btn-primary flex-1 justify-center text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Resolve
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
