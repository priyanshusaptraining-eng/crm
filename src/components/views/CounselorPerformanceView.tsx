import React, { useState } from 'react';
import { Lead, User, TargetConfig } from '../../types/crm';
import { 
  Users, 
  Trophy, 
  Award, 
  PhoneCall, 
  GraduationCap, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  DollarSign
} from 'lucide-react';

interface CounselorPerformanceViewProps {
  leads: Lead[];
  currentUser: User;
  allUsers: User[];
  targets: TargetConfig;
  onOpenTargetModal: () => void;
  onReassignLead?: (leadId: string, newCounselorId: string) => void;
}

export const CounselorPerformanceView: React.FC<CounselorPerformanceViewProps> = ({
  leads,
  currentUser,
  allUsers,
  targets,
  onOpenTargetModal,
}) => {
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>('all');

  // Compute performance per user
  const counselorStats = allUsers.map((user) => {
    const userLeads = leads.filter((l) => l.assignedTo === user.id);
    const admissions = userLeads.filter((l) => l.status === 'admission_joined');
    const revenue = admissions.reduce((acc, l) => acc + (l.paymentDetails?.amountPaid || l.dealValue || 0), 0);
    const totalCalls = userLeads.reduce((acc, l) => acc + (l.callsMade || 0), 0);
    const scheduledDemos = userLeads.filter((l) => l.status === 'demo_scheduled' || l.demoDetails).length;
    const conversionRate = userLeads.length > 0 ? (admissions.length / userLeads.length) * 100 : 0;

    // Quota math (evenly divided among counselors)
    const perCounselorAdmissionTarget = Math.max(1, Math.round(targets.monthlyAdmissions / Math.max(1, allUsers.length)));
    const perCounselorRevenueTarget = Math.max(10000, Math.round(targets.monthlyRevenue / Math.max(1, allUsers.length)));

    const admissionProgress = Math.min(100, Math.round((admissions.length / perCounselorAdmissionTarget) * 100));
    const revenueProgress = Math.min(100, Math.round((revenue / perCounselorRevenueTarget) * 100));

    return {
      user,
      totalLeads: userLeads.length,
      admissionsCount: admissions.length,
      revenue,
      totalCalls,
      scheduledDemos,
      conversionRate,
      admissionProgress,
      revenueProgress,
      perCounselorAdmissionTarget,
      perCounselorRevenueTarget,
    };
  });

  // Sort by revenue descending for leaderboard
  const sortedStats = [...counselorStats].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--crm-surface)] border border-[var(--crm-border)] p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--crm-primary)]/10 text-[var(--crm-primary)] flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--crm-text)] tracking-tight">
              Counselor Performance & Sales Leaderboard
            </h2>
            <p className="text-xs text-[var(--crm-text-secondary)] mt-0.5">
              Individual and team revenue attainment, daily call activity, and conversion pace against monthly targets
            </p>
          </div>
        </div>

        <button
          onClick={onOpenTargetModal}
          className="text-xs px-3.5 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] hover:border-[var(--crm-primary)] text-[var(--crm-text)] font-semibold transition-colors flex items-center gap-1.5 self-start lg:self-auto"
        >
          <TrendingUp className="w-4 h-4 text-[var(--crm-primary)]" />
          <span>Adjust Monthly Quotas</span>
        </button>
      </div>

      {/* Leaderboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedStats.map((stat, idx) => {
          const isLeader = idx === 0;

          return (
            <div
              key={stat.user.id}
              className={`bg-[var(--crm-surface)] border rounded-2xl p-5 relative overflow-hidden transition-all ${
                isLeader 
                  ? 'border-[var(--crm-primary)] shadow-lg shadow-[var(--crm-primary)]/10 ring-1 ring-[var(--crm-primary)]/30' 
                  : 'border-[var(--crm-border)] hover:border-[var(--crm-border)]'
              }`}
            >
              {isLeader && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-[var(--crm-primary)] to-[var(--crm-primary)]/80 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
                  <Award className="w-3.5 h-3.5" />
                  <span>Top Performer</span>
                </div>
              )}

              {/* Counselor Identity */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[var(--crm-elevated)] border border-[var(--crm-border)] flex items-center justify-center text-sm font-bold text-[var(--crm-primary)] shadow-inner">
                  {stat.user.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--crm-text)]">{stat.user.name}</h3>
                  <div className="text-[11px] text-[var(--crm-text-secondary)] font-mono">{stat.user.id}</div>
                  <div className="text-[10px] text-[var(--crm-primary)] capitalize mt-0.5 font-medium">
                    {stat.user.role.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Core Metrics */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[var(--crm-border)]">
                <div className="p-2.5 rounded-xl bg-[var(--crm-elevated)] border border-[var(--crm-border)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--crm-text-secondary)] font-medium">Admissions</div>
                  <div className="text-xl font-bold text-emerald-400 mt-0.5 tabular-nums">
                    {stat.admissionsCount} <span className="text-xs text-[var(--crm-text-secondary)] font-normal">/ {stat.perCounselorAdmissionTarget}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--crm-elevated)] border border-[var(--crm-border)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--crm-text-secondary)] font-medium">Revenue</div>
                  <div className="text-xl font-bold text-[var(--crm-text)] mt-0.5 tabular-nums">
                    ₹{(stat.revenue / 1000).toFixed(0)}k
                  </div>
                </div>
              </div>

              {/* Quota Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--crm-text-secondary)]">Target Achievement</span>
                  <span className="font-bold text-[var(--crm-text)] tabular-nums">{stat.admissionProgress}%</span>
                </div>
                <div className="w-full bg-[var(--crm-input)] h-2 rounded-full overflow-hidden border border-[var(--crm-border)]">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--crm-primary)] to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, stat.admissionProgress)}%` }}
                  />
                </div>
              </div>

              {/* Additional operational details */}
              <div className="mt-4 pt-3 border-t border-[var(--crm-border)] grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-[10px] text-[var(--crm-text-secondary)]">Calls Logged</div>
                  <div className="font-bold text-[var(--crm-text)] mt-0.5 tabular-nums">{stat.totalCalls}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--crm-text-secondary)]">Demos Taken</div>
                  <div className="font-bold text-[var(--crm-text)] mt-0.5 tabular-nums">{stat.scheduledDemos}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--crm-text-secondary)]">Conversion %</div>
                  <div className="font-bold text-emerald-400 mt-0.5 tabular-nums">{stat.conversionRate.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
