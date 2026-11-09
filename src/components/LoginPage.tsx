import React, { useState } from 'react';
import { User } from '../types/crm';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  PhoneCall,
  CalendarCheck2,
  GraduationCap,
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface LoginPageProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('priyanshu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeUsers = users.filter((u) => u.status !== 'deactivated');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const trimmedUser = username.trim().toLowerCase();
      const foundUser = users.find(
        (u) =>
          (u.username && u.username.toLowerCase() === trimmedUser) ||
          u.id.toLowerCase() === trimmedUser ||
          u.name.toLowerCase() === trimmedUser
      );

      if (!foundUser) {
        setError(`User ID "${username}" was not found. Please contact your Super Admin.`);
        setIsLoading(false);
        return;
      }

      // Check if account is deactivated
      if (foundUser.status === 'deactivated') {
        setError(
          `Account for ${foundUser.name} has been deactivated. Only active accounts (Priyanshu or Deepti) are permitted.`
        );
        setIsLoading(false);
        return;
      }

      if (foundUser.password && password !== foundUser.password) {
        setError('Invalid password. Default demo password is "password123".');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onLogin(foundUser);
    }, 200);
  };

  const handleQuickSelect = (user: User) => {
    setUsername(user.username || user.id);
    setPassword(user.password || 'password123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Split-Screen Bento Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
        
        {/* ================= LEFT COLUMN: BRANDING & BENTO HIGHLIGHTS ================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Brand header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#151F35] border border-[#23324E] text-xs font-semibold text-[#F59E0B]">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Corporate Admissions & Performance OS</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-amber-600 flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-amber-500/20">
                CA
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F8FAFC]">
                  CorporateAcademy <span className="text-[#F59E0B]">CRM</span>
                </h1>
                <p className="text-xs text-[#94A3B8]">
                  Enterprise Lead, DPR & Financial Governance Suite
                </p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight pt-2">
              Every lead, call and admission in one place.
            </h2>
            <p className="text-sm text-[#94A3B8] max-w-xl leading-relaxed">
              Automate daily call verification with mobile screenshot OCR, track candidate conversion pacing, and enforce role-based access for counselors and administrators.
            </p>
          </div>

          {/* Bento Feature Grid (4 Modular Highlights) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {/* Bento Card 1: Lead Management */}
            <div className="p-4 rounded-2xl bg-[#151F35] border border-[#23324E] hover:border-[#F59E0B]/40 transition-all space-y-2 group">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#F59E0B] transition-colors">
                Advanced Lead Management
              </h3>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Multi-condition filter bar with custom dates (e.g. 9–10 March), candidate search, and single-click contact copy.
              </p>
            </div>

            {/* Bento Card 2: Daily DPR with OCR */}
            <div className="p-4 rounded-2xl bg-[#151F35] border border-[#23324E] hover:border-[#F59E0B]/40 transition-all space-y-2 group">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#F59E0B] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#F59E0B] transition-colors">
                Daily DPR Screenshot OCR
              </h3>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                AI extraction for 11 distinct call metrics & durations directly from mobile dialer screenshots with manual verification.
              </p>
            </div>

            {/* Bento Card 3: Admissions & Payments */}
            <div className="p-4 rounded-2xl bg-[#151F35] border border-[#23324E] hover:border-[#F59E0B]/40 transition-all space-y-2 group">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#F59E0B] transition-colors">
                Admissions & Fee Ledger
              </h3>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Track enrollments, pending dues dates, token receipts, and UTR settlement records with automated WhatsApp alerts.
              </p>
            </div>

            {/* Bento Card 4: Monthly Reports & Analytics */}
            <div className="p-4 rounded-2xl bg-[#151F35] border border-[#23324E] hover:border-[#F59E0B]/40 transition-all space-y-2 group">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <CalendarCheck2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#F59E0B] transition-colors">
                Day-Wise Monthly Reports
              </h3>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Complete calendar day-by-day table showing confirmed calls, durations, and clear "Not Submitted" missing flags.
              </p>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: SIGN-IN CARD ================= */}
        <div className="lg:col-span-5">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#151F35] border border-[#23324E] shadow-2xl space-y-5 backdrop-blur-xl relative">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#F8FAFC]">
                  Sign In to Your Workspace
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Active RBAC
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Enter your credentials or choose a pre-configured profile below.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                  User ID / Username *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. priyanshu or deepti"
                    className="w-full text-xs font-medium text-[#F8FAFC] bg-[#0C1425] border border-[#23324E] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F59E0B] transition-colors"
                  />
                  <UserCheck className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#94A3B8]">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-[#F59E0B] hover:underline flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full text-xs font-medium text-[#F8FAFC] bg-[#0C1425] border border-[#23324E] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F59E0B] transition-colors font-mono"
                  />
                  <Lock className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-black text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to CorporateAcademy'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick-Switch Profile Selector */}
            <div className="pt-3 border-t border-[#23324E] space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                Quick-Switch Permitted Accounts:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Priyanshu: Super Admin */}
                <button
                  type="button"
                  onClick={() => {
                    const admin = users.find((u) => u.id === 'usr_priyanshu') || users[0];
                    handleQuickSelect(admin);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    username.toLowerCase() === 'priyanshu' || username.toLowerCase() === 'usr_priyanshu'
                      ? 'bg-[#1E2D4A] border-[#F59E0B] text-white'
                      : 'bg-[#0C1425] border-[#23324E] text-[#94A3B8] hover:text-white hover:border-[#64748B]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#F59E0B]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Priyanshu</span>
                  </div>
                  <div className="text-[10px] text-[#94A3B8]">Super Admin (Full Access)</div>
                </button>

                {/* Deepti: Counselor */}
                <button
                  type="button"
                  onClick={() => {
                    const deepti = users.find((u) => u.id === 'usr_deepti') || users[1];
                    handleQuickSelect(deepti);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    username.toLowerCase() === 'deepti' || username.toLowerCase() === 'usr_deepti'
                      ? 'bg-[#1E2D4A] border-emerald-400 text-white'
                      : 'bg-[#0C1425] border-[#23324E] text-[#94A3B8] hover:text-white hover:border-[#64748B]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Deepti</span>
                  </div>
                  <div className="text-[10px] text-[#94A3B8]">Counselor (DPR & Leads)</div>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0C1425] border border-[#23324E] text-[11px] text-[#64748B] flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Strict RBAC enforced: counselors only access their assigned leads & DPR.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
