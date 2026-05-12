import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-dark-950 bg-grid flex items-center justify-center p-4">
      <div className="text-center">
        <Shield className="w-16 h-16 text-dark-600 mx-auto mb-4" />
        <h1 className="text-6xl font-bold text-dark-700 font-mono mb-2">404</h1>
        <p className="text-dark-400 mb-6">Page not found</p>
        <Link to="/dashboard" className="btn-primary inline-flex">
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
