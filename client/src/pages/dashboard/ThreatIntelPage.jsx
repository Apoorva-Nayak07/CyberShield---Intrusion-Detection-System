import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Globe, MapPin, TrendingUp, Shield } from 'lucide-react';
import api from '../../lib/api';

export default function ThreatIntelPage() {
  const { data: geoData } = useQuery({
    queryKey: ['geo-data'],
    queryFn: () => api.get('/analytics/geo').then((r) => r.data.data),
    refetchInterval: 60000,
  });

  const { data: overview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.get('/analytics/overview').then((r) => r.data.data),
  });

  const topCountries = (geoData || []).slice(0, 10);
  const geoDistribution = overview?.geoDistribution || [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-dark-100 flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyber-400" />
          Threat Intelligence
        </h1>
        <p className="text-sm text-dark-400 mt-0.5">Global threat landscape and attack origins</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Attack Origins */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-dark-100 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-400" />
            Top Attack Origins (7 Days)
          </h3>
          <div className="space-y-3">
            {geoDistribution.slice(0, 10).map((item, i) => (
              <motion.div
                key={item.countryCode}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="text-xs font-mono text-dark-400 w-4">{i + 1}</span>
                <span className="text-sm font-medium text-dark-200 flex-1">{item.country || item.countryCode}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${Math.min((item.count / (geoDistribution[0]?.count || 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-dark-400 w-8 text-right">{item.count}</span>
                </div>
              </motion.div>
            ))}
            {geoDistribution.length === 0 && (
              <p className="text-dark-400 text-sm text-center py-4">No geo data available</p>
            )}
          </div>
        </div>

        {/* Attack Heatmap (simplified) */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-dark-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyber-400" />
            Threat Intelligence Summary
          </h3>
          <div className="space-y-3">
            <div className="bg-dark-800/30 rounded-lg p-4">
              <p className="text-xs text-dark-400 mb-1">Most Active Attack Type</p>
              <p className="text-sm font-semibold text-dark-100">
                {overview?.topAttackTypes?.[0]?.type?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
              </p>
              <p className="text-xs text-dark-400 mt-0.5">
                {overview?.topAttackTypes?.[0]?.count || 0} incidents in last 7 days
              </p>
            </div>
            <div className="bg-dark-800/30 rounded-lg p-4">
              <p className="text-xs text-dark-400 mb-1">Top Source Country</p>
              <p className="text-sm font-semibold text-dark-100">
                {geoDistribution[0]?.country || 'Unknown'}
              </p>
              <p className="text-xs text-dark-400 mt-0.5">
                {geoDistribution[0]?.count || 0} attacks originated
              </p>
            </div>
            <div className="bg-dark-800/30 rounded-lg p-4">
              <p className="text-xs text-dark-400 mb-1">Countries Involved</p>
              <p className="text-sm font-semibold text-dark-100">{geoDistribution.length}</p>
              <p className="text-xs text-dark-400 mt-0.5">Unique attack origins detected</p>
            </div>
            <div className="bg-dark-800/30 rounded-lg p-4">
              <p className="text-xs text-dark-400 mb-1">Threat Level</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <p className="text-sm font-semibold text-red-400">HIGH</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Geo coordinates table */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-dark-100 mb-4">Attack Source Details</h3>
        <div className="overflow-x-auto">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Country</th>
                <th>Code</th>
                <th>Attacks</th>
                <th>Severity</th>
                <th>Coordinates</th>
              </tr>
            </thead>
            <tbody>
              {(geoData || []).slice(0, 15).map((item, i) => (
                <tr key={i}>
                  <td className="text-dark-500 font-mono text-xs">{i + 1}</td>
                  <td className="text-dark-200 text-sm">{item.country || 'Unknown'}</td>
                  <td className="font-mono text-xs text-cyber-400">{item.countryCode}</td>
                  <td className="font-mono text-xs text-dark-300">{item.count}</td>
                  <td>
                    {item.hasCritical ? (
                      <span className="badge-critical">CRITICAL</span>
                    ) : (
                      <span className="badge-high">HIGH</span>
                    )}
                  </td>
                  <td className="font-mono text-xs text-dark-500">
                    {item.lat?.toFixed(2)}, {item.lon?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
