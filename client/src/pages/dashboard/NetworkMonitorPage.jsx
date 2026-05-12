import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Network, Zap, Activity, RefreshCw, AlertTriangle, Shield } from 'lucide-react';
import api from '../../lib/api';
import StatCard from '../../components/ui/StatCard';
import { useSocketStore } from '../../store/socketStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function NetworkMonitorPage() {
  const { networkActivity, isConnected } = useSocketStore();
  const queryClient = useQueryClient();
  const [attackType, setAttackType] = useState('port_scan');

  const { data: stats } = useQuery({
    queryKey: ['network-stats'],
    queryFn: () => api.get('/network/stats').then((r) => r.data.data),
    refetchInterval: 10000,
  });

  const simulateMutation = useMutation({
    mutationFn: (type) => api.post('/network/simulate', { attackType: type }),
    onSuccess: () => {
      toast.success('Attack simulation started');
      queryClient.invalidateQueries(['network-stats']);
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-100 flex items-center gap-2">
            <Network className="w-5 h-5 text-cyber-400" />
            Network Monitor
          </h1>
          <p className="text-sm text-dark-400 mt-0.5">Real-time network activity tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={attackType}
            onChange={(e) => setAttackType(e.target.value)}
            className="cyber-input text-sm py-2"
          >
            <option value="port_scan">Port Scan</option>
            <option value="brute_force">Brute Force</option>
            <option value="ddos">DDoS</option>
            <option value="sql_injection">SQL Injection</option>
          </select>
          <button
            onClick={() => simulateMutation.mutate(attackType)}
            disabled={simulateMutation.isLoading}
            className="btn-primary text-sm py-2"
          >
            <Zap className="w-4 h-4" />
            Simulate Attack
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Events (5min)"
          value={stats?.eventsLast5min || 0}
          icon={Activity}
          color="blue"
          pulse={isConnected}
        />
        <StatCard
          title="Events (1h)"
          value={stats?.eventsLast1h || 0}
          icon={Network}
          color="purple"
        />
        <StatCard
          title="Suspicious"
          value={stats?.byStatus?.suspicious || 0}
          icon={AlertTriangle}
          color="yellow"
        />
        <StatCard
          title="Malicious"
          value={stats?.byStatus?.malicious || 0}
          icon={Shield}
          color="red"
        />
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-dark-100">Live Network Activity</h3>
          <span className="text-xs text-dark-400">{networkActivity.length} events</span>
        </div>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {networkActivity.slice(0, 50).map((event, i) => (
            <div key={i} className="flex items-center gap-3 text-xs font-mono py-1.5 px-3 rounded bg-dark-800/30">
              <span className="text-dark-500">{format(new Date(event.createdAt || Date.now()), 'HH:mm:ss')}</span>
              <span className="text-cyber-400">{event.sourceIp}</span>
              <span className="text-dark-500">→</span>
              <span className="text-green-400">{event.destinationIp}</span>
              <span className="text-dark-400">{event.protocol}</span>
              <span className="text-dark-500">:{event.destinationPort}</span>
              <span className={`ml-auto px-1.5 py-0.5 rounded ${
                event.status === 'malicious' ? 'bg-red-500/20 text-red-400' :
                event.status === 'suspicious' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {event.status}
              </span>
            </div>
          ))}
          {networkActivity.length === 0 && (
            <div className="text-center py-8 text-dark-400">No network activity</div>
          )}
        </div>
      </div>
    </div>
  );
}
