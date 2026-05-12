import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', twoFactorCode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(form.email, form.password, form.twoFactorCode || undefined);

    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else if (result.requiresTwoFactor) {
      setRequiresTwoFactor(true);
    } else {
      setError(result.message);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@cybershield.io', password: 'Admin@123' },
      analyst: { email: 'analyst@cybershield.io', password: 'Analyst@123' },
      viewer: { email: 'viewer@cybershield.io', password: 'Viewer@123' },
    };
    setForm({ ...form, ...creds[role] });
  };

  return (
    <div className="min-h-screen bg-dark-950 bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-cyber-600/20 border border-cyber-500/30 rounded-2xl mb-4 neon-blue"
          >
            <Shield className="w-8 h-8 text-cyber-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">CyberShield IDS</h1>
          <p className="text-dark-400 text-sm mt-1">AI-Powered Intrusion Detection System</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h2 className="text-lg font-semibold text-dark-100 mb-6">
            {requiresTwoFactor ? 'Two-Factor Authentication' : 'Sign In to Dashboard'}
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!requiresTwoFactor ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-dark-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="cyber-input pl-10"
                      placeholder="admin@cybershield.io"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-dark-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="cyber-input pl-10 pr-10"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-dark-600 bg-dark-800 text-cyber-500" />
                    <span className="text-xs text-dark-400">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-xs text-cyber-400 hover:text-cyber-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-dark-300 mb-1.5">2FA Code</label>
                <input
                  type="text"
                  value={form.twoFactorCode}
                  onChange={(e) => setForm({ ...form, twoFactorCode: e.target.value })}
                  className="cyber-input text-center text-lg tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
                <p className="text-xs text-dark-400 mt-2 text-center">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary justify-center py-2.5 text-sm font-semibold"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {requiresTwoFactor ? 'Verify Code' : 'Sign In'}
                </span>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          {!requiresTwoFactor && (
            <div className="mt-6 pt-5 border-t border-dark-700/50">
              <p className="text-xs text-dark-400 text-center mb-3">Quick Demo Access</p>
              <div className="grid grid-cols-3 gap-2">
                {['admin', 'analyst', 'viewer'].map((role) => (
                  <button
                    key={role}
                    onClick={() => fillDemo(role)}
                    className="text-xs py-1.5 px-2 rounded-lg bg-dark-800/50 border border-dark-700/50 text-dark-300 hover:text-dark-100 hover:border-cyber-500/30 transition-all capitalize"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-dark-400 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyber-400 hover:text-cyber-300 transition-colors">
              Register
            </Link>
          </p>
        </div>

        {/* Security notice */}
        <p className="text-center text-xs text-dark-500 mt-4">
          🔒 Protected by enterprise-grade security
        </p>
      </motion.div>
    </div>
  );
}
