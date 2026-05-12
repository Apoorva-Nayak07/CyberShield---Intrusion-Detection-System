import React from 'react';

const severityConfig = {
  critical: { label: 'CRITICAL', className: 'badge-critical' },
  high: { label: 'HIGH', className: 'badge-high' },
  medium: { label: 'MEDIUM', className: 'badge-medium' },
  low: { label: 'LOW', className: 'badge-low' },
  info: { label: 'INFO', className: 'badge-info' },
};

export default function SeverityBadge({ severity, size = 'sm' }) {
  const config = severityConfig[severity] || severityConfig.info;
  return (
    <span className={config.className}>
      {config.label}
    </span>
  );
}
