import React from 'react';
import { FileText } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-dark-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyber-400" />
          Reports
        </h1>
        <p className="text-sm text-dark-400 mt-0.5">Generate and export security reports</p>
      </div>
      <div className="glass-card p-12 text-center">
        <FileText className="w-12 h-12 mx-auto mb-3 text-dark-600" />
        <p className="text-dark-400">Report generation interface - Coming soon</p>
      </div>
    </div>
  );
}
