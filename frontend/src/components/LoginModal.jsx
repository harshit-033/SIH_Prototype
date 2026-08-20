import React, { useState } from 'react';
import { loginUser, seedDemoUsers } from '../services/authService';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, backendOnline }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [error, setError] = useState('');
  const [seedNotice, setSeedNotice] = useState('');

  if (!isOpen) return null;

  const handleQuickLogin = async (quickEmail, quickPass) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setLoading(true);
    setError('');
    setSeedNotice('');

    try {
      const res = await loginUser(quickEmail, quickPass);
      onLoginSuccess(res);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');
    setSeedNotice('');

    try {
      const res = await loginUser(email, password);
      onLoginSuccess(res);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeedLoading(true);
    setSeedNotice('');
    setError('');
    try {
      const res = await seedDemoUsers();
      setSeedNotice(res.isSimulated ? "Demo users initialized (Simulated mode)." : "Default users seeded successfully in PostgreSQL!");
    } catch (err) {
      setError(err.message || 'Failed to seed users.');
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white border-b border-slate-800 flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg shadow-inner font-bold">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <h3 className="font-bold text-base font-outfit">Institutional Portal Authentication</h3>
              <p className="text-xs text-slate-400 font-mono">Spring Boot JWT Security Layer</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-800 flex items-center justify-center transition">
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          
          {/* Backend Status Bar */}
          <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <i className="fa-solid fa-server text-[10px] text-slate-400"></i> Backend Status:
            </span>
            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
              backendOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {backendOnline ? '● Spring Boot Online (Port 8080)' : '● Standalone / Demo Fallback'}
            </span>
          </div>

          {/* Quick-Login Preset Buttons */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">One-Click Quick Login Presets</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@sih.gov.in', 'Password@123')}
                disabled={loading}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-left transition flex flex-col justify-between"
              >
                <i className="fa-solid fa-building-columns text-indigo-600 mb-1 text-sm"></i>
                <span className="font-bold text-slate-800 text-[11px]">Admin / Univ</span>
                <span className="text-[9px] text-slate-400">ROLE_ADMIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('inspector@sih.gov.in', 'Password@123')}
                disabled={loading}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-left transition flex flex-col justify-between"
              >
                <i className="fa-solid fa-user-check text-indigo-600 mb-1 text-sm"></i>
                <span className="font-bold text-slate-800 text-[11px]">Inspector</span>
                <span className="text-[9px] text-slate-400">ROLE_INSPECTOR</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('institute@sih.gov.in', 'Password@123')}
                disabled={loading}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-left transition flex flex-col justify-between"
              >
                <i className="fa-solid fa-graduation-cap text-indigo-600 mb-1 text-sm"></i>
                <span className="font-bold text-slate-800 text-[11px]">College</span>
                <span className="text-[9px] text-slate-400">ROLE_INSTITUTE</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">or Custom Credentials</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. inspector@sih.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold flex items-center gap-2">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}

            {seedNotice && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold flex items-center gap-2">
                <i className="fa-solid fa-circle-check"></i>
                <span>{seedNotice}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2"
            >
              {loading && <i className="fa-solid fa-spinner fa-spin"></i>}
              <span>{loading ? 'Authenticating with Spring Boot...' : 'Sign In with JWT'}</span>
            </button>
          </form>

          {/* Seed button */}
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Need default test accounts?</span>
            <button
              type="button"
              onClick={handleSeed}
              disabled={seedLoading}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline inline-flex items-center gap-1"
            >
              <i className="fa-solid fa-bolt text-[10px]"></i>
              <span>{seedLoading ? 'Seeding...' : 'Seed Demo Users'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
