import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Brain, Cpu, TrendingUp, CheckCircle, Activity } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../lib/api';
import StatCard from '../../components/ui/StatCard';

export default function AIInsightsPage() {
  const { data: mlMetrics } = useQuery({
    queryKey: ['ml-metrics'],
    queryFn: () => api.get('/analytics/ml-metrics').then((r) => r.data.data),
    refetchInterval: 60000,
  });

  const { data: mlHealth } = useQuery({
    queryKey: ['ml-health'],
    queryFn: () => api.get('/ml/health').then((r) => r.data),
  });

  const models = mlMetrics?.models || [];

  const radarData = models.map((m) => ({
    model: m.name.split(' ')[0],
    accuracy: m.accuracy,
    precision: m.precision,
    recall: m.recall,
    f1: m.f1,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-dark-100 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI Model Insights
        </h1>
        <p className="text-sm text-dark-400 mt-0.5">Machine learning model performance and predictions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="ML Detected"
          value={mlMetrics?.mlDetected || 0}
          icon={Brain}
          color="purple"
        />
        <StatCard
          title="Rule Detected"
          value={mlMetrics?.ruleDetected || 0}
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="ML Coverage"
          value={`${mlMetrics?.mlPercentage || 0}%`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Avg Confidence"
          value={`${mlMetrics?.avgConfidence || 0}%`}
          icon={CheckCircle}
          color={mlMetrics?.avgConfidence > 80 ? 'green' : 'yellow'}
        />
      </div>

      {/* ML Service Status */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyber-400" />
          ML Service Status
        </h3>
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          mlHealth?.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${mlHealth?.success ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className={`text-sm font-medium ${mlHealth?.success ? 'text-green-400' : 'text-red-400'}`}>
            {mlHealth?.success ? 'ML Service Online' : 'ML Service Offline'}
          </span>
          <span className="text-xs text-dark-400 ml-auto">
            {mlHealth?.success ? 'All models loaded and ready' : 'Start ml-service to enable AI detection'}
          </span>
        </div>
      </div>

      {/* Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-dark-100 mb-4">Model Performance Metrics</h3>
          <div className="space-y-4">
            {models.map((model, i) => (
              <motion.div
                key={model.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-dark-800/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-dark-100">{model.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    model.accuracy >= 95 ? 'bg-green-500/20 text-green-400' :
                    model.accuracy >= 90 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {model.accuracy}% accuracy
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Precision', value: model.precision },
                    { label: 'Recall', value: model.recall },
                    { label: 'F1 Score', value: model.f1 },
                  ].map((metric) => (
                    <div key={metric.label} className="text-center">
                      <p className="text-xs text-dark-400">{metric.label}</p>
                      <p className="text-sm font-mono font-semibold text-cyber-400">{metric.value}%</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-dark-100 mb-4">Model Comparison Radar</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={[
                { metric: 'Accuracy', ...Object.fromEntries(models.map((m) => [m.name.split(' ')[0], m.accuracy])) },
                { metric: 'Precision', ...Object.fromEntries(models.map((m) => [m.name.split(' ')[0], m.precision])) },
                { metric: 'Recall', ...Object.fromEntries(models.map((m) => [m.name.split(' ')[0], m.recall])) },
                { metric: 'F1 Score', ...Object.fromEntries(models.map((m) => [m.name.split(' ')[0], m.f1])) },
              ]}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#7c7e84', fontSize: 11 }} />
                {models.map((model, i) => (
                  <Radar
                    key={model.name}
                    name={model.name}
                    dataKey={model.name.split(' ')[0]}
                    stroke={['#1890ff', '#52c41a', '#722ed1', '#fa8c16'][i]}
                    fill={['#1890ff', '#52c41a', '#722ed1', '#fa8c16'][i]}
                    fillOpacity={0.1}
                  />
                ))}
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-dark-400">
              <p className="text-sm">No model data available</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          AI-Generated Recommendations
        </h3>
        <div className="space-y-3">
          {[
            { icon: '🔴', title: 'High DDoS Risk Detected', desc: 'Traffic patterns suggest elevated DDoS risk. Consider enabling rate limiting on public endpoints.', severity: 'critical' },
            { icon: '🟡', title: 'Brute Force Pattern', desc: 'Multiple failed SSH login attempts from Eastern European IPs. Recommend IP blocking and 2FA enforcement.', severity: 'high' },
            { icon: '🟢', title: 'Model Performance Optimal', desc: 'All ML models are performing above 90% accuracy. No retraining required at this time.', severity: 'low' },
            { icon: '🔵', title: 'Anomaly Baseline Updated', desc: 'Network behavior baseline has been updated with 7 days of clean traffic data.', severity: 'info' },
          ].map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-dark-800/30"
            >
              <span className="text-lg">{rec.icon}</span>
              <div>
                <p className="text-sm font-medium text-dark-100">{rec.title}</p>
                <p className="text-xs text-dark-400 mt-0.5">{rec.desc}</p>
              </div>
              <span className={`badge-${rec.severity} ml-auto flex-shrink-0`}>{rec.severity}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
