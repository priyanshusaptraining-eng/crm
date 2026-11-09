import React, { useState } from 'react';
import { TargetConfig } from '../types/crm';
import { Target, PhoneCall, GraduationCap, IndianRupee, Save, X, Sparkles } from 'lucide-react';

interface TargetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTargets: TargetConfig;
  onSaveTargets: (newTargets: TargetConfig) => void;
}

export const TargetSettingsModal: React.FC<TargetSettingsModalProps> = ({
  isOpen,
  onClose,
  currentTargets,
  onSaveTargets,
}) => {
  if (!isOpen) return null;

  const [dailyCalls, setDailyCalls] = useState(currentTargets.dailyCalls.toString());
  const [monthlyAdmissions, setMonthlyAdmissions] = useState(currentTargets.monthlyAdmissions.toString());
  const [monthlyRevenue, setMonthlyRevenue] = useState(currentTargets.monthlyRevenue.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const calls = parseInt(dailyCalls, 10) || currentTargets.dailyCalls;
    const admissions = parseInt(monthlyAdmissions, 10) || currentTargets.monthlyAdmissions;
    const revenue = parseInt(monthlyRevenue, 10) || currentTargets.monthlyRevenue;

    onSaveTargets({
      dailyCalls: calls,
      monthlyAdmissions: admissions,
      monthlyRevenue: revenue,
      period: currentTargets.period || 'monthly',
      history: currentTargets.history,
    });
    onClose();
  };

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate() + 1;
  const targetAdmNum = parseInt(monthlyAdmissions, 10) || 1;
  const paceNeeded = (targetAdmNum / daysInMonth).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1B3D]/50 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#DCE3EE] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#DCE3EE] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E4EBFC] text-[#1D45C9] flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0F1B3D] font-display">
                Set Performance Targets (Aaj Ka Target)
              </h3>
              <p className="text-xs text-[#5B6786]">
                Configure daily call benchmarks, monthly admission goals, and revenue targets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium text-[#0F1B3D]">
          
          {/* Target 1: Daily Calls */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-[#DCE3EE] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#0F1B3D]">
              <PhoneCall className="w-4 h-4 text-[#1D45C9]" />
              <span>Daily Call Target (Per Counselor)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="500"
                required
                value={dailyCalls}
                onChange={(e) => setDailyCalls(e.target.value)}
                className="w-full text-sm font-bold font-mono text-[#0F1B3D] bg-white border border-[#DCE3EE] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D45C9]/20"
              />
              <span className="text-[#5B6786] font-semibold whitespace-nowrap">calls / day</span>
            </div>
            <p className="text-[11px] text-[#5B6786]">
              All logged outbound client inquiries contribute to daily % achievement.
            </p>
          </div>

          {/* Target 2: Monthly Admissions */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-[#DCE3EE] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#0F1B3D]">
              <GraduationCap className="w-4 h-4 text-[#0E7C4A]" />
              <span>Monthly Admissions Target</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="500"
                required
                value={monthlyAdmissions}
                onChange={(e) => setMonthlyAdmissions(e.target.value)}
                className="w-full text-sm font-bold font-mono text-[#0F1B3D] bg-white border border-[#DCE3EE] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0E7C4A]/20"
              />
              <span className="text-[#5B6786] font-semibold whitespace-nowrap">admissions / month</span>
            </div>
            <div className="p-2 rounded-xl bg-[#DDF3E8]/80 text-[#0E7C4A] text-[11px] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Calculated Pace: ~{paceNeeded} admissions/day required for the month</span>
            </div>
          </div>

          {/* Target 3: Monthly Revenue Goal */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-[#DCE3EE] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#0F1B3D]">
              <IndianRupee className="w-4 h-4 text-[#9A5B00]" />
              <span>Monthly Course Revenue Target (₹)</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#5B6786]">₹</span>
              <input
                type="number"
                min="1000"
                step="5000"
                required
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(e.target.value)}
                className="w-full text-sm font-bold font-mono text-[#0F1B3D] bg-white border border-[#DCE3EE] rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9A5B00]/20"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-[#DCE3EE] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[#5B6786] hover:bg-slate-100 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#1D45C9] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save & Apply Targets</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
