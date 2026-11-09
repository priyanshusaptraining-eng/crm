import React, { useState } from 'react';
import { TargetConfig, User, DashboardMetrics } from '../../types/crm';
import { Target, TrendingUp, Save, X, History, ShieldAlert, Check, DollarSign, GraduationCap, Calendar } from 'lucide-react';

interface TargetsGoalsViewProps {
  targets: TargetConfig;
  metrics: DashboardMetrics;
  currentUser: User;
  onSaveTargets: (newTargets: TargetConfig) => void;
  onNotifyToast: (msg: string) => void;
}

export const TargetsGoalsView: React.FC<TargetsGoalsViewProps> = ({
  targets,
  metrics,
  currentUser,
  onSaveTargets,
  onNotifyToast,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';

  // Form state
  const [admissionTarget, setAdmissionTarget] = useState<number>(targets.monthlyAdmissions || 20);
  const [revenueTarget, setRevenueTarget] = useState<number>(targets.monthlyRevenue || 300000);
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>(targets.period || 'monthly');
  const [showConfirm, setShowConfirm] = useState(false);

  // Live preview calculations
  const remainingAdmissions = Math.max(0, admissionTarget - metrics.admissionsCount);
  const admissionPct = admissionTarget > 0 ? Math.min(100, Math.round((metrics.admissionsCount / admissionTarget) * 100)) : 0;
  
  const remainingRevenue = Math.max(0, revenueTarget - metrics.totalRevenue);
  const revenuePct = revenueTarget > 0 ? Math.min(100, Math.round((metrics.totalRevenue / revenueTarget) * 100)) : 0;

  const requiredDailyAdmissions = Math.round((remainingAdmissions / Math.max(1, metrics.daysRemainingInMonth)) * 10) / 10;
  const requiredDailyRevenue = Math.round(remainingRevenue / Math.max(1, metrics.daysRemainingInMonth));

  const handleResetToCurrent = () => {
    setAdmissionTarget(targets.monthlyAdmissions);
    setRevenueTarget(targets.monthlyRevenue);
    setPeriod(targets.period || 'monthly');
    setShowConfirm(false);
  };

  const handleConfirmSave = () => {
    const newAudit = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      modifiedBy: `${currentUser.name} (${isSuperAdmin ? 'Super Admin' : 'Counselor'})`,
      admissionTarget,
      revenueTarget,
      period,
    };

    const updated: TargetConfig = {
      ...targets,
      monthlyAdmissions: admissionTarget,
      monthlyRevenue: revenueTarget,
      period,
      history: [newAudit, ...(targets.history || [])],
    };

    onSaveTargets(updated);
    setShowConfirm(false);
    onNotifyToast('Target metrics saved and synchronized across all dashboards');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Targets & Goals Configuration
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Establish admissions and revenue quotas with automatic pacing calculations throughout DealDeck CRM.
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center p-1 rounded-lg bg-[var(--input-bg)] border border-[var(--border)]">
          {(['monthly', 'quarterly', 'yearly'] as const).map((p) => (
            <button
              key={p}
              type="button"
              disabled={!isSuperAdmin}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                period === p
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {!isSuperAdmin && (
        <div className="p-4 rounded-xl bg-[var(--warning-soft)] border border-[var(--warning)]/30 text-xs text-[var(--warning)] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>
            You are viewing targets in Read-Only counselor mode. Global quota adjustments require Super Admin authorization.
          </span>
        </div>
      )}

      {/* Target Sliders and Live Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admission Target Control */}
        <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[var(--accent)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {period.charAt(0).toUpperCase() + period.slice(1)} Admissions Quota
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={100}
                disabled={!isSuperAdmin}
                value={admissionTarget}
                onChange={(e) => setAdmissionTarget(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-20 px-2.5 py-1 text-right text-sm font-bold bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] tabular-nums"
              />
              <span className="text-xs text-[var(--text-muted)] font-medium">Seats</span>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min={1}
              max={100}
              disabled={!isSuperAdmin}
              value={admissionTarget}
              onChange={(e) => setAdmissionTarget(Number(e.target.value))}
              className="w-full accent-[var(--accent)] cursor-pointer h-2 bg-[var(--input-bg)] rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-medium">
              <span>1 Seat</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100 Seats</span>
            </div>
          </div>

          {/* Live Automatic Calculations Card */}
          <div className="p-4 rounded-lg bg-[var(--elevated-bg)] border border-[var(--border)] space-y-2.5 text-xs">
            <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Live Admission Pacing Preview
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Current Admissions Achieved:</span>
              <strong className="text-[var(--text-primary)] tabular-nums">{metrics.admissionsCount} students ({admissionPct}%)</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Remaining Admissions to Target:</span>
              <strong className="text-[var(--warning)] tabular-nums">{remainingAdmissions} enrollments</strong>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">Required Daily Admission Pace:</span>
              <strong className="text-[var(--accent)] tabular-nums font-bold">{requiredDailyAdmissions} admissions / day</strong>
            </div>
          </div>
        </div>

        {/* Revenue Target Control */}
        <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[var(--success)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {period.charAt(0).toUpperCase() + period.slice(1)} Revenue Goal
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--text-muted)] font-medium">₹</span>
              <input
                type="number"
                min={50000}
                max={1000000}
                step={5000}
                disabled={!isSuperAdmin}
                value={revenueTarget}
                onChange={(e) => setRevenueTarget(Math.max(50000, Math.min(1000000, Number(e.target.value) || 50000)))}
                className="w-28 px-2.5 py-1 text-right text-sm font-bold bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] tabular-nums"
              />
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min={50000}
              max={1000000}
              step={5000}
              disabled={!isSuperAdmin}
              value={revenueTarget}
              onChange={(e) => setRevenueTarget(Number(e.target.value))}
              className="w-full accent-[var(--success)] cursor-pointer h-2 bg-[var(--input-bg)] rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-medium">
              <span>₹50K</span>
              <span>₹2.5L</span>
              <span>₹5.0L</span>
              <span>₹7.5L</span>
              <span>₹10.0L</span>
            </div>
          </div>

          {/* Live Automatic Calculations Card */}
          <div className="p-4 rounded-lg bg-[var(--elevated-bg)] border border-[var(--border)] space-y-2.5 text-xs">
            <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Live Revenue Pacing Preview
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Current Realized Revenue:</span>
              <strong className="text-[var(--success)] tabular-nums">₹{metrics.totalRevenue.toLocaleString('en-IN')} ({revenuePct}%)</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Remaining Target Revenue Gap:</span>
              <strong className="text-[var(--warning)] tabular-nums">₹{remainingRevenue.toLocaleString('en-IN')}</strong>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">Required Daily Revenue Pace:</span>
              <strong className="text-[var(--success)] tabular-nums font-bold">₹{requiredDailyRevenue.toLocaleString('en-IN')} / day</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Save and Cancel Action Bar */}
      {isSuperAdmin && (
        <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            Changes will immediately recalculate completion percentages and daily required paces across the CRM.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToCurrent}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--elevated-bg)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="px-5 py-2 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 transition-opacity shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Target Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--warning-soft)] text-[var(--warning)] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Confirm Target Update
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Update global admissions to {admissionTarget} seats and revenue to ₹{revenueTarget.toLocaleString('en-IN')}?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--elevated-bg)] border border-[var(--border)] text-xs space-y-1.5 text-[var(--text-secondary)]">
              <div>• Admissions: {targets.monthlyAdmissions} → <strong className="text-[var(--text-primary)]">{admissionTarget}</strong></div>
              <div>• Revenue: ₹{targets.monthlyRevenue.toLocaleString('en-IN')} → <strong className="text-[var(--text-primary)]">₹{revenueTarget.toLocaleString('en-IN')}</strong></div>
              <div>• Period: <strong className="text-[var(--text-primary)] capitalize">{period}</strong></div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--elevated-bg)]"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="px-5 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold"
              >
                Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail & History Log */}
      <div className="p-5 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
          <History className="w-4 h-4 text-[var(--text-muted)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Target Modification Audit Trail
          </h3>
        </div>

        <div className="space-y-2">
          {(targets.history || []).map((audit) => (
            <div
              key={audit.id}
              className="p-3 rounded-lg bg-[var(--elevated-bg)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--text-primary)]">{audit.modifiedBy ?? audit.updatedBy ?? 'Admin'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--input-bg)] text-[var(--text-muted)] capitalize">
                  {audit.period}
                </span>
              </div>

              <div className="flex items-center gap-4 text-[var(--text-secondary)] tabular-nums">
                <span>Admissions: <strong className="text-[var(--text-primary)]">{audit.admissionTarget ?? audit.monthlyAdmissions ?? 0}</strong></span>
                <span>Revenue: <strong className="text-[var(--success)]">₹{(audit.revenueTarget ?? audit.monthlyRevenue ?? 0).toLocaleString('en-IN')}</strong></span>
                <span className="text-[var(--text-muted)] text-[11px]">{audit.timestamp ?? audit.updatedAt ?? ''}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
