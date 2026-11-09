import React from 'react';
import { Lead, User, DashboardMetrics, TargetConfig, DPRRecord } from '../../types/crm';
import {
  GraduationCap,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertCircle,
  Video,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  PhoneCall,
  Sparkles,
  AlertTriangle,
  Upload,
  FileText,
  CalendarDays,
  ShieldCheck,
  Award
} from 'lucide-react';
import { PhoneActionGroup } from '../PhoneActionGroup';

interface DashboardViewProps {
  leads: Lead[];
  currentUser: User;
  allUsers: User[];
  metrics: DashboardMetrics;
  targets: TargetConfig;
  dprRecords?: DPRRecord[];
  onNavigateToTab: (tabId: string) => void;
  onOpenLeadProfile: (lead: Lead) => void;
  onOpenDemoScheduler: (lead: Lead) => void;
  onOpenDprUpload?: () => void;
  onInitiateCall?: (lead: Lead) => void;
  onOpenWhatsAppModal?: (lead: Lead) => void;
  onNotifyToast?: (msg: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  currentUser,
  allUsers,
  metrics,
  targets,
  dprRecords = [],
  onNavigateToTab,
  onOpenLeadProfile,
  onOpenDemoScheduler,
  onOpenDprUpload,
  onInitiateCall,
  onOpenWhatsAppModal,
  onNotifyToast = () => {},
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isCounselor = currentUser.role === 'counselor' || currentUser.role === 'sales_user';

  // Leads for current user
  const myLeads = isSuperAdmin ? leads : leads.filter((l) => l.assignedTo === currentUser.id);
  const myAdmitted = myLeads.filter((l) => l.status === 'admission_joined');
  const myFollowups = myLeads.filter((l) => l.isPendingToday);
  const myDemos = myLeads.filter((l) => Boolean(l.demoDetails?.date));

  // Counselor targets (Deepti has fixed monthly target)
  const counselorAdmissionsTarget = currentUser.monthlyTarget?.admissions || 18;
  const counselorRevenueTarget = currentUser.monthlyTarget?.revenue || 250000;
  const counselorDailyCallsTarget = currentUser.monthlyTarget?.dailyCalls || 45;

  const effectiveAdmissionsTarget = isSuperAdmin ? targets.monthlyAdmissions : counselorAdmissionsTarget;
  const effectiveRevenueTarget = isSuperAdmin ? targets.monthlyRevenue : counselorRevenueTarget;

  const currentAdmissions = isSuperAdmin ? metrics.admissionsCount : myAdmitted.length;
  const currentRevenue = isSuperAdmin
    ? metrics.totalRevenue
    : myAdmitted.reduce((sum, l) => sum + (l.revenue || l.paymentDetails?.amountPaid || 0), 0);

  const admissionPct = Math.min(100, Math.round((currentAdmissions / (effectiveAdmissionsTarget || 1)) * 100));
  const revenuePct = Math.min(100, Math.round((currentRevenue / (effectiveRevenueTarget || 1)) * 100));

  // Check today's DPR for counselor
  const todayDpr = dprRecords.find(
    (r) => r.date === '2026-11-08' && (isSuperAdmin ? r.counselorId === 'usr_deepti' : r.counselorId === currentUser.id)
  );
  const isDprMissing = !todayDpr || todayDpr.status === 'missing' || todayDpr.status === 'pending_verification';

  return (
    <div className="space-y-6">
      {/* 1. DPR Pending Warning Banner for Counselor */}
      {isCounselor && isDprMissing && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Daily Performance Report Pending Submission</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                    Due Today (08 Nov)
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Upload your end-of-day phone log screenshot. OCR will automatically verify your call counts and talk times.
                </p>
              </div>
            </div>

            {onOpenDprUpload && (
              <button
                onClick={onOpenDprUpload}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-md shadow-amber-500/20 self-start sm:self-center whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Call Log Screenshot
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1b. Super Admin DPR Compliance Alert */}
      {isSuperAdmin && isDprMissing && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Daily DPR Reminder Alert: Deepti has not submitted today's call logs (08 Nov)
              </span>
              <span className="text-[11px] text-slate-400">
                Counselor reminder scheduled for 18:00 IST. Yesterday's DPR was verified (17 calls, 14m 58s).
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('dpr')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-300 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 transition self-start sm:self-center"
          >
            Review DPR Dashboard
          </button>
        </div>
      )}

      {/* 2. Top Welcome Bento Header */}
      <div className="bg-[#111827] border border-[#1E2D4A] rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                isSuperAdmin
                  ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                  : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
              }`}>
                {isSuperAdmin ? 'Super Admin Portal' : 'Admissions Counselor Workspace'}
              </span>
              <span className="text-xs text-slate-400">
                {currentUser.designation || (isSuperAdmin ? 'Managing Director' : 'Senior Counselor')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {isSuperAdmin
                ? 'CorporateAcademy executive control center. Monitor lead funnels, fee collections, counselor targets, and daily OCR verification reports.'
                : 'Your dedicated counseling workspace. Track your assigned leads, upcoming demo sessions, tuition enrollment milestones, and daily call reports.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTab('leads')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#151F35] hover:bg-[#1E2D4A] border border-[#1E2D4A] transition shadow"
            >
              <span>{isSuperAdmin ? 'Manage All Leads' : 'My Assigned Leads'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isSuperAdmin ? (
              <button
                onClick={() => onNavigateToTab('targets')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Adjust Target Goals</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigateToTab('dpr')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20"
              >
                <FileText className="w-4 h-4" />
                <span>Daily DPR Desk</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Primary KPI Bento Grid Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Leads */}
        <div className="bg-[#111827] border border-[#1E2D4A] p-5 rounded-2xl shadow-lg relative overflow-hidden group hover:border-[#1E2D4A]/80 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">
              {isSuperAdmin ? 'Total Lead Desk' : 'My Active Leads'}
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{myLeads.length}</div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">{myFollowups.length} scheduled</span>
            <span>for follow-up today</span>
          </div>
        </div>

        {/* Admissions Completed */}
        <div className="bg-[#111827] border border-[#1E2D4A] p-5 rounded-2xl shadow-lg relative overflow-hidden group hover:border-[#1E2D4A]/80 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">
              {isSuperAdmin ? 'Total Admissions' : 'My Admissions'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {currentAdmissions} <span className="text-xs font-normal text-slate-400">/ {effectiveAdmissionsTarget} target</span>
          </div>
          <div className="w-full bg-[#151F35] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${admissionPct}%` }} />
          </div>
        </div>

        {/* Tuition Revenue */}
        <div className="bg-[#111827] border border-[#1E2D4A] p-5 rounded-2xl shadow-lg relative overflow-hidden group hover:border-[#1E2D4A]/80 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">
              {isSuperAdmin ? 'Company Revenue' : 'My Closed Revenue'}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            ₹{(currentRevenue / 1000).toFixed(0)}k
            <span className="text-xs font-normal text-slate-400 ml-1">/ ₹{(effectiveRevenueTarget / 1000).toFixed(0)}k</span>
          </div>
          <div className="w-full bg-[#151F35] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${revenuePct}%` }} />
          </div>
        </div>

        {/* Daily Calling Pacing */}
        <div className="bg-[#111827] border border-[#1E2D4A] p-5 rounded-2xl shadow-lg relative overflow-hidden group hover:border-[#1E2D4A]/80 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Daily Calling Benchmark</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {isSuperAdmin ? targets.dailyCalls : counselorDailyCallsTarget}
            <span className="text-xs font-normal text-slate-400 ml-1">calls/day</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span className="text-amber-400 font-semibold">17 calls</span>
            <span>logged yesterday via OCR</span>
          </div>
        </div>
      </div>

      {/* 4. Target Progress & Pacing Bento Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admissions Progress Card */}
        <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Monthly Admissions Enrollment Pacing
                </h3>
                <span className="text-xs text-slate-400">
                  Target: {effectiveAdmissionsTarget} Enrollments {isCounselor && '(Assigned by Super Admin)'}
                </span>
              </div>
            </div>
            <span className="text-lg font-black text-emerald-400">{admissionPct}%</span>
          </div>

          <div className="w-full bg-[#151F35] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${admissionPct}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-[#151F35] p-3 rounded-xl border border-[#1E2D4A]">
              <span className="text-[10px] text-slate-400 block">Admissions Achieved</span>
              <span className="text-base font-bold text-white mt-0.5 block">{currentAdmissions}</span>
            </div>
            <div className="bg-[#151F35] p-3 rounded-xl border border-[#1E2D4A]">
              <span className="text-[10px] text-slate-400 block">Remaining Gap</span>
              <span className="text-base font-bold text-amber-400 mt-0.5 block">
                {Math.max(0, effectiveAdmissionsTarget - currentAdmissions)}
              </span>
            </div>
            <div className="bg-[#151F35] p-3 rounded-xl border border-[#1E2D4A]">
              <span className="text-[10px] text-slate-400 block">Days Left in Month</span>
              <span className="text-base font-bold text-blue-400 mt-0.5 block">
                {metrics.daysRemainingInMonth} Days
              </span>
            </div>
          </div>
        </div>

        {/* Tuition Revenue Progress Card */}
        <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Tuition Fee Collection Pacing
                </h3>
                <span className="text-xs text-slate-400">
                  Target: ₹{effectiveRevenueTarget.toLocaleString('en-IN')} {isCounselor && '(Assigned by Super Admin)'}
                </span>
              </div>
            </div>
            <span className="text-lg font-black text-amber-400">{revenuePct}%</span>
          </div>

          <div className="w-full bg-[#151F35] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${revenuePct}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-[#151F35] p-3 rounded-xl border border-[#1E2D4A]">
              <span className="text-[10px] text-slate-400 block">Revenue Collected</span>
              <span className="text-base font-bold text-white mt-0.5 block">₹{currentRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-[#151F35] p-3 rounded-xl border border-[#1E2D4A]">
              <span className="text-[10px] text-slate-400 block">Revenue Gap</span>
              <span className="text-base font-bold text-rose-400 mt-0.5 block">
                ₹{Math.max(0, effectiveRevenueTarget - currentRevenue).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-[#151F35] p-3 rounded-xl border border-[#1E2D4A]">
              <span className="text-[10px] text-slate-400 block">Required Daily Run</span>
              <span className="text-base font-bold text-purple-400 mt-0.5 block">
                ₹{Math.round(Math.max(0, effectiveRevenueTarget - currentRevenue) / Math.max(1, metrics.daysRemainingInMonth)).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Super Admin Counselor Leaderboard OR Counselor Recent Leads */}
      {isSuperAdmin ? (
        <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E2D4A]">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Active Counselor Performance & DPR Audit</h3>
                <span className="text-xs text-slate-400">Comparison of active admissions counselors</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('counselors')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Full Counselor Analysis →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E2D4A] text-slate-400 font-semibold bg-[#151F35]/60">
                  <th className="py-3 px-3">Counselor</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Assigned Leads</th>
                  <th className="py-3 px-3 text-center">Admissions</th>
                  <th className="py-3 px-3 text-center">Revenue</th>
                  <th className="py-3 px-3 text-center">DPR Compliance</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2D4A]/60">
                <tr className="hover:bg-[#151F35]/40 transition">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                        D
                      </div>
                      <div>
                        <span className="font-semibold text-white block">Deepti</span>
                        <span className="text-[11px] text-slate-400">Senior Admissions Counselor</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-white">11</td>
                  <td className="py-3.5 px-3 text-center font-bold text-emerald-400">4 / 18</td>
                  <td className="py-3.5 px-3 text-center font-bold text-white">₹1,14,000</td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="font-semibold text-amber-400">86% (6 / 7 days)</span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => onNavigateToTab('monthly_report')}
                      className="px-2.5 py-1 text-[11px] bg-[#151F35] hover:bg-[#1E2D4A] text-slate-200 rounded-lg border border-[#1E2D4A] transition font-medium"
                    >
                      Inspect DPRs
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E2D4A]">
            <div>
              <h3 className="text-sm font-bold text-white">My High-Priority Follow-ups & Demos</h3>
              <span className="text-xs text-slate-400">Leads assigned to Deepti requiring immediate phone contact</span>
            </div>
            <button
              onClick={() => onNavigateToTab('followups')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              View All Follow-ups →
            </button>
          </div>

          <div className="space-y-3">
            {myLeads.slice(0, 4).map((lead) => (
              <div
                key={lead.id}
                className="bg-[#151F35] border border-[#1E2D4A] p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400/40 transition group"
              >
                <div 
                  className="cursor-pointer"
                  onClick={() => onOpenLeadProfile(lead)}
                >
                  <span className="font-semibold text-white text-xs sm:text-sm block group-hover:text-amber-400 transition">
                    {lead.name} • {lead.course}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {lead.location || 'India'} • Status: <strong className="text-slate-300">{lead.status}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <PhoneActionGroup
                    phone={lead.phone}
                    candidateName={lead.name}
                    courseName={lead.course}
                    counselorName={currentUser.name}
                    onInitiateCall={() => {
                      if (onInitiateCall) onInitiateCall(lead);
                    }}
                    onOpenWhatsAppModal={() => {
                      if (onOpenWhatsAppModal) onOpenWhatsAppModal(lead);
                    }}
                    onNotifyToast={onNotifyToast}
                    size="sm"
                  />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDemoScheduler(lead);
                    }}
                    className="px-2.5 py-1.5 text-[11px] font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl border border-blue-600/40 transition"
                  >
                    Demo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
