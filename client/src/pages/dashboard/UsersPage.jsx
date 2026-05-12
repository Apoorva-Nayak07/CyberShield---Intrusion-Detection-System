import React from 'react';
import { Users } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-dark-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-cyber-400" />
          User Management
        </h1>
        <p className="text-sm text-dark-400 mt-0.5">Manage system users and permissions</p>
      </div>
      <div className="glass-card p-12 text-center">
        <Users className="w-12 h-12 mx-auto mb-3 text-dark-600" />
        <p className="text-dark-400">User management interface - Coming soon</p>
      </div>
    </div>
  );
}
