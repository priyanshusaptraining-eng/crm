import React, { useState } from 'react';
import { Lead, User, TargetConfig } from '../../types/crm';
import { computeFunnelAnalytics } from '../../utils/crmLogic';
import { 
  TrendingUp, 
  UserX, 
  PhoneCall, 
  Video, 
  GraduationCap, 
  IndianRupee, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  UserCheck, 
  MessageSquare,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Users
} from 'lucide-react';

interface ConversionAnalyticsViewProps {
  leads: Lead[];
  currentUser: User;
  allUsers: User[];
  targets: TargetConfig;
  onOpenTargetModal: () => void;
  onReassignLead: (leadId: string, newUserId: string) => void;
  onOpenClientDetail: (lead: Lead) => void;
  onNotifyToast: (msg: string) => void;
}

export const ConversionAnalyticsView: React.FC<ConversionAnalyticsViewProps> = ({
  leads,
  currentUser,
  allUsers,
  targets,
  onOpenTargetModal,
  onReassignLead,
  onOpenClientDetail,
  onNotifyToast,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const [selectedCounselorFilter, setSelectedCounselorFilter] = useState<string>('all');

  // Filter leads based on counselor if selected
  const analyzedLeads = selectedCounselorFilter === 'all'
    ? leads
    : leads.filter((l) => l.assignedTo === selectedCounselorFilter);

  const stats = computeFunnelAnalytics(analyzedLeads);
  const totalCalls = analyzedLeads.reduce((acc, l) => acc + (l.callsMade || l.callsCount || 0), 0);
  const totalRev = analyzedLeads.reduce((acc, l) => acc + (l.paymentDetails?.amountPaid || l.dealValue || 0), 0);

  // Lost leads
  const lostLeads = analyzedLeads.filter((l) => l.status === 'not_interested' || l.status === 'npu');

  // Funnel steps with drop-off percentages
  const funnelSteps = [
    { label: 'Total Inquiries Ingested', count: stats.total, pct: 100, color: 'bg-blue-500' },
    { label: 'Contacted by Call', count: stats.contacted, pct: stats.total ? Math.round((stats.contacted / stats.total) * 100) : 0, color: 'bg-indigo-500' },
    { label: 'Demos / Webinars Scheduled', count: stats.demosScheduled, pct: stats.total ? Math.round((stats.demosScheduled / stats.total) * 100) : 0, color: 'bg-purple-500' },
    { label: 'Webinar Attended', count: stats.demosAttended, pct: stats.total ? Math.round((stats.demosAttended / stats.total) * 100) : 0, color: 'bg-violet-500' },
    { label: 'Admissions Joined & Paid', count: stats.admissions, pct: stats.conversionRate, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Counselor Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--crm-surface)] border border-[var(--crm-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--crm-primary)]/10 text-[var(--crm-primary)] flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--crm-text)] tracking-tight">
              Conversion Funnel & Lead Loss Diagnostics
            </h2>
            <p className="text-xs text-[var(--crm-text-secondary)] mt-0.5">
              Live qualification funnel, drop-off stages, and lost lead re-engagement opportunities
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCounselorFilter}
            onChange={(e) => setSelectedCounselorFilter(e.target.value)}
            className="text-xs bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] rounded-xl px-3 py-2 outline-none focus:border-[var(--crm-primary)]"
          >
            <option value="all">All Counselors ({allUsers.length})</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} {u.id === currentUser.id ? '(You)' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenTargetModal}
            className="text-xs px-3.5 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] hover:border-[var(--crm-primary)] text-[var(--crm-text)] font-semibold transition-colors flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-[var(--crm-primary)]" />
            <span>Monthly Goals</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--crm-surface)] border border-[var(--crm-border)]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">Conversion Rate</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
            {stats.conversionRate}%
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            {stats.admissions} enrolled out of {stats.total} total leads
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--crm-surface)] border border-[var(--crm-border)]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">Total Calls Logged</div>
          <div className="text-2xl font-bold text-[var(--crm-text)] mt-1 tabular-nums">
            {totalCalls}
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            Average {(totalCalls / Math.max(1, stats.total)).toFixed(1)} calls per lead
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--crm-surface)] border border-[var(--crm-border)]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">Demo Attendance Rate</div>
          <div className="text-2xl font-bold text-[var(--crm-primary)] mt-1 tabular-nums">
            {stats.demosScheduled > 0 ? Math.round((stats.demosAttended / stats.demosScheduled) * 100) : 0}%
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            {stats.demosAttended} attended of {stats.demosScheduled} booked
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--crm-surface)] border border-[var(--crm-border)]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">Lost / NPU Leads</div>
          <div className="text-2xl font-bold text-rose-400 mt-1 tabular-nums">
            {lostLeads.length}
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            Available for re-engagement nurture
          </div>
        </div>
      </div>

      {/* Visual Funnel Progression */}
      <div className="p-5 rounded-2xl bg-[var(--crm-surface)] border border-[var(--crm-border)] space-y-4">
        <h3 className="text-sm font-bold text-[var(--crm-text)]">Enrollment Conversion Funnel</h3>
        <div className="space-y-3">
          {funnelSteps.map((step, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[var(--crm-text)]">{step.label}</span>
                <span className="font-bold text-[var(--crm-text)] tabular-nums">
                  {step.count} leads ({step.pct}%)
                </span>
              </div>
              <div className="w-full bg-[var(--crm-input)] h-3 rounded-full overflow-hidden border border-[var(--crm-border)]">
                <div
                  className={`h-full ${step.color} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.max(5, step.pct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lost Leads Section with Re-assignment Option */}
      <div className="p-5 rounded-2xl bg-[var(--crm-surface)] border border-[var(--crm-border)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-[var(--crm-text)]">Lost / Not Interested Leads Ledger</h3>
          </div>
          <span className="text-xs text-[var(--crm-text-secondary)]">
            Total {lostLeads.length} drop-outs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--crm-input)] border-b border-[var(--crm-border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Course</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Last Remark / Reason</th>
                <th className="py-2.5 px-3">Assigned Counselor</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--crm-border)] text-[var(--crm-text)]">
              {lostLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-[var(--crm-text-secondary)]">
                    No disqualified or lost leads found in this view.
                  </td>
                </tr>
              ) : (
                lostLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[var(--crm-elevated)] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[var(--crm-text)]">
                      {lead.name}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[var(--crm-text-secondary)]">
                      {lead.course || 'Candidate'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[var(--crm-text-secondary)]">
                      {lead.phone}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[var(--crm-text-secondary)] italic max-w-xs truncate">
                      "{lead.feedback || 'Not interested at current fee'}"
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={lead.assignedTo}
                        onChange={(e) => onReassignLead(lead.id, e.target.value)}
                        className="text-[11px] bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] rounded-lg px-2 py-1 outline-none"
                      >
                        {allUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onOpenClientDetail(lead)}
                        className="text-[11px] px-2 py-1 rounded-lg bg-[var(--crm-input)] hover:bg-[var(--crm-primary)] hover:text-white text-[var(--crm-text)] transition-colors border border-[var(--crm-border)]"
                      >
                        Review Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
