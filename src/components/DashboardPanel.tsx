import React from 'react';
import { DashboardMetrics } from '../types/crm';
import { motion } from 'motion/react';
import { PhoneCall, UserPlus, Calendar, Clock, Video, IndianRupee, Target, Award } from 'lucide-react';

interface DashboardPanelProps {
  metrics: DashboardMetrics;
  onUpdateTarget?: (newTarget: number) => void;
  isSuperAdmin: boolean;
}

export const DashboardPanel: React.FC<DashboardPanelProps> = ({
  metrics,
  onUpdateTarget,
  isSuperAdmin,
}) => {
  const {
    dailyCallTarget,
    dailyCallCount,
    achievementPercentage,
    totalCalls,
    newLeadsCount,
    leadsAddedTodayCount,
    pendingLeadsTodayCount,
    scheduledLeadsCount,
    totalRevenue,
  } = metrics;

  const isAchieved = achievementPercentage >= 100;

  return (
    <div className="space-y-6">
      {/* Primary Dashboard Panel: Target Metrics, Daily Call Count, Percentage Achievement */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          {/* Target & Call Count Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Daily Performance Target
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">
                Automated Goal Tracking
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Sales Outreach & Conversion Target
            </h2>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 pt-1">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-400" />
                <span>Daily Call Target:</span>
                <span className="font-semibold text-slate-900 font-mono tabular-nums">
                  {dailyCallTarget} calls
                </span>
                {isSuperAdmin && onUpdateTarget && (
                  <button
                    onClick={() => {
                      const newTarget = prompt('Enter new daily call target:', String(dailyCallTarget));
                      if (newTarget && !isNaN(Number(newTarget)) && Number(newTarget) > 0) {
                        onUpdateTarget(Number(newTarget));
                      }
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline ml-1"
                  >
                    Adjust
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-indigo-500" />
                <span>Daily Call Count:</span>
                <span className="font-semibold text-indigo-700 font-mono tabular-nums">
                  {dailyCallCount} calls logged
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Award className={`w-4 h-4 ${isAchieved ? 'text-emerald-500' : 'text-amber-500'}`} />
                <span>Goal Status:</span>
                <span className={`font-semibold ${isAchieved ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {isAchieved ? 'Target Achieved' : `${Math.max(0, dailyCallTarget - dailyCallCount)} calls remaining`}
                </span>
              </div>
            </div>
          </div>

          {/* Percentage Achievement Gauge Card */}
          <div className="lg:w-80 bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">Percentage Achievement</span>
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {achievementPercentage}%
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(achievementPercentage, 100)}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded-full transition-colors ${
                  isAchieved ? 'bg-emerald-600' : achievementPercentage > 50 ? 'bg-indigo-600' : 'bg-amber-500'
                }`}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span>0 calls</span>
              <span className="font-mono tabular-nums">{Math.round(dailyCallTarget * 0.5)} calls (50%)</span>
              <span className="font-mono tabular-nums">{dailyCallTarget} calls (100%)</span>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Lead Management KPI Strip: Total Calls, New Leads, Today's Leads, Pending Leads, Scheduled Leads, Revenue */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Metric 1: Total Calls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Calls</span>
            <PhoneCall className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalCalls}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across active leads
          </div>
        </motion.div>

        {/* Metric 2: Number of New Leads */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">New Leads</span>
            <UserPlus className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {newLeadsCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Awaiting first outreach
          </div>
        </motion.div>

        {/* Metric 3: Leads Added Today */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Added Today</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {leadsAddedTodayCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Ingested current date
          </div>
        </motion.div>

        {/* Metric 4: Pending Leads for the Day */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.2 }}
          className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pending Today</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {pendingLeadsTodayCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Action required today
          </div>
        </motion.div>

        {/* Metric 5: Scheduled Leads */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.25 }}
          className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Scheduled Leads</span>
            <Video className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {scheduledLeadsCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Demos & webinars
          </div>
        </motion.div>

        {/* Metric 6: Revenue Tracking Per Lead & Aggregate */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.3 }}
          className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Revenue Realized</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Total fee collected
          </div>
        </motion.div>

      </div>
    </div>
  );
};
