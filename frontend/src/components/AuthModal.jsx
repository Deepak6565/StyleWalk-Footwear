import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Mail, User, ShieldAlert, CheckCircle2, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ onClose, defaultAdmin = false }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isAdminPortal, setIsAdminPortal] = useState(defaultAdmin);
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState(defaultAdmin ? 'admin@stylewalk.com' : '');
  const [password, setPassword] = useState(defaultAdmin ? 'admin123' : '');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRedirect = (authenticatedUser) => {
    onClose();
    if (authenticatedUser?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let loggedUser;
      if (isLoginView) {
        loggedUser = await login(email, password);
      } else {
        loggedUser = await register(name, email, password);
      }
      handleRedirect(loggedUser);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAdminPortal = () => {
    setIsAdminPortal(true);
    setIsLoginView(true);
    setEmail('admin@stylewalk.com');
    setPassword('admin123');
    setError('');
  };

  const handleSelectCustomerPortal = () => {
    setIsAdminPortal(false);
    setEmail('customer@stylewalk.com');
    setPassword('user123');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-950/85 backdrop-blur-xl"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 20 }}
        className={`relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border shadow-2xl text-left text-white transition-all duration-300 ${
          isAdminPortal
            ? 'border-amber-500/50 bg-slate-900/90 shadow-amber-500/10'
            : 'border-indigo-500/40 bg-slate-950/90 shadow-indigo-500/10'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Portal Mode Header Badge */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            {isAdminPortal ? (
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>STYLEWALK ADMIN PORTAL</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>STYLEWALK SECURITY SUITE</span>
              </span>
            )}
          </div>

          <h3 className="text-2xl font-black text-white mt-2.5 font-heading">
            {isAdminPortal
              ? 'ADMIN CONTROL PORTAL'
              : isLoginView
              ? 'WELCOME BACK'
              : 'CREATE CUSTOMER ACCOUNT'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {isAdminPortal
              ? 'Authorized Administrator Authentication & Real-Time Inventory Suite'
              : 'Restricted Portal Access: Customers & Authenticated Store Members'}
          </p>
        </div>

        {/* Mode Selector Toggle Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-5 p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={handleSelectCustomerPortal}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center space-x-2 cursor-pointer ${
              !isAdminPortal
                ? 'bg-[#4F46E5] text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Customer Portal</span>
          </button>

          <button
            type="button"
            onClick={handleSelectAdminPortal}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center space-x-2 cursor-pointer ${
              isAdminPortal
                ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20'
                : 'text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Auto-Loaded Admin Details Info Banner */}
        {isAdminPortal && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold space-y-1">
            <div className="flex items-center space-x-1.5 font-extrabold text-amber-400 uppercase tracking-wider text-[10px]">
              <KeyRound className="w-3.5 h-3.5" />
              <span>AUTHORIZED ADMIN CREDENTIALS LOADED</span>
            </div>
            <p className="text-[11px] text-gray-300">
              Admin Email: <strong className="text-white font-mono">admin@stylewalk.com</strong>
            </p>
            <p className="text-[11px] text-gray-300">
              Password: <strong className="text-white font-mono">admin123</strong>
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && !isAdminPortal && (
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              {isAdminPortal ? 'Admin Email Identifier' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdminPortal ? 'admin@stylewalk.com' : 'customer@stylewalk.com'}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border text-xs font-bold text-white placeholder-gray-500 focus:outline-none ${
                  isAdminPortal
                    ? 'border-amber-500/40 focus:border-amber-500 focus:bg-white/10'
                    : 'border-white/10 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              {isAdminPortal ? 'Admin Passcode' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border text-xs font-bold text-white placeholder-gray-500 focus:outline-none ${
                  isAdminPortal
                    ? 'border-amber-500/40 focus:border-amber-500 focus:bg-white/10'
                    : 'border-white/10 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl text-white font-extrabold text-xs tracking-wider shadow-xl flex items-center justify-center space-x-2 transition cursor-pointer uppercase ${
              isAdminPortal
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-gray-950 font-black shadow-amber-500/20'
                : 'bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 shadow-indigo-500/20'
            }`}
          >
            <span>
              {loading
                ? 'Authenticating Security...'
                : isAdminPortal
                ? 'AUTHENTICATE & ENTER ADMIN PORTAL'
                : isLoginView
                ? 'LOG IN TO CUSTOMER ACCOUNT'
                : 'CREATE CUSTOMER ACCOUNT'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {!isAdminPortal && (
          <div className="mt-5 text-center text-xs text-gray-400 border-t border-white/10 pt-4">
            <span>{isLoginView ? "Don't have an account?" : 'Already have an account?'}</span>
            <button
              onClick={() => setIsLoginView(!isLoginView)}
              className="ml-2 text-indigo-400 font-extrabold hover:underline"
            >
              {isLoginView ? 'Register Now' : 'Log In'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
