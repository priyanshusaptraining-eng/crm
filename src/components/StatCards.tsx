import React from 'react';
import { DashboardMetrics } from '../types/crm';
import { PhoneCall, UserPlus, Video, IndianRupee, TrendingUp, ChevronDown } from 'lucide-react';

interface StatCardsProps {
  metrics: DashboardMetrics;
}

export const StatCards: React.FC<StatCardsProps> = ({ metrics }) => {
  const {
    totalRevenue,
    totalCalls,
    newLeadsCount,
    leadsAddedTodayCount,
    scheduledLeadsCount,
    achievementPercentage,
  } = metrics;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      
      {/* 2x2 Grid of Main KPI Cards on Left */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Card 1: Featured Royal Blue Card (Total Sales / Revenue) */}
        <div className="bg-[#1D45C9] text-white rounded-3xl p-6 shadow-xl shadow-blue-500/15 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-white text-[#1D45C9] flex items-center justify-center shadow-xs">
              <IndianRupee className="w-5 h-5 font-bold" />
            </div>
            <span className="text-xs font-bold text-[#0E7C4A] bg-[#DDF3E8] px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+{achievementPercentage}%</span>
            </span>
          </div>

          <div>
            <div className="text-xs font-medium text-white/80">
              Total Realized Sales
            </div>
            <div className="text-3xl font-black tracking-tight text-white mt-1 font-display font-num">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-white/70 mt-1">
              Collected admission tuition across all batches
            </div>
          </div>
        </div>

        {/* Card 2: Total Calls Logged */}
        <div className="bg-white rounded-3xl p-6 border border-[#DCE3EE] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#E4EBFC] text-[#1D45C9] flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#0E7C4A] bg-[#DDF3E8] px-2.5 py-1 rounded-full">
              +12,4%
            </span>
          </div>

          <div>
            <div className="text-xs font-medium text-[#5B6786]">
              Total Calls Logged
            </div>
            <div className="text-3xl font-black tracking-tight text-[#0F1B3D] mt-1 font-display font-num">
              {totalCalls}
            </div>
            <div className="text-xs text-[#5B6786] mt-1">
              Outbound calls across active prospect pipelines
            </div>
          </div>
        </div>

        {/* Card 3: New Leads & Today's Ingestion */}
        <div className="bg-white rounded-3xl p-6 border border-[#DCE3EE] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#E4EBFC] text-[#1D45C9] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#1D45C9] bg-[#E4EBFC] px-2.5 py-1 rounded-full">
              +{leadsAddedTodayCount} today
            </span>
          </div>

          <div>
            <div className="text-xs font-medium text-[#5B6786]">
              New Leads Ingested
            </div>
            <div className="text-3xl font-black tracking-tight text-[#0F1B3D] mt-1 font-display font-num">
              {newLeadsCount}
            </div>
            <div className="text-xs text-[#5B6786] mt-1">
              {leadsAddedTodayCount} prospects added on current date
            </div>
          </div>
        </div>

        {/* Card 4: Scheduled Demos */}
        <div className="bg-white rounded-3xl p-6 border border-[#DCE3EE] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#E4EBFC] text-[#1D45C9] flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2.5 py-1 rounded-full">
              Scheduled
            </span>
          </div>

          <div>
            <div className="text-xs font-medium text-[#5B6786]">
              Demos & Webinars
            </div>
            <div className="text-3xl font-black tracking-tight text-[#0F1B3D] mt-1 font-display font-num">
              {scheduledLeadsCount}
            </div>
            <div className="text-xs text-[#5B6786] mt-1">
              Confirmed Google Meet live demo sessions
            </div>
          </div>
        </div>

      </div>

      {/* Right Product Statistic / Concentric Rings Panel */}
      <div className="bg-white rounded-3xl p-6 border border-[#DCE3EE] shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-black text-[#0F1B3D] font-display">
              Pipeline Ratio
            </h3>
            <span className="text-xs font-bold text-[#5B6786] bg-[#EEF2F7] px-2.5 py-1 rounded-lg">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-[#5B6786]">
            Conversion achievement vs targets
          </p>

          {/* Circular Rings Visualization */}
          <div className="flex items-center justify-center py-6">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                {/* Outer Blue Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="66"
                  stroke="#EEF2F7"
                  strokeWidth="9"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="66"
                  stroke="#1D45C9"
                  strokeWidth="9"
                  strokeDasharray="414"
                  strokeDashoffset="120"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Middle Ok Green Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="52"
                  stroke="#EEF2F7"
                  strokeWidth="9"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="52"
                  stroke="#0E7C4A"
                  strokeWidth="9"
                  strokeDasharray="326"
                  strokeDashoffset="150"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Inner Light Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="38"
                  stroke="#EEF2F7"
                  strokeWidth="9"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="38"
                  stroke="#CBD5E1"
                  strokeWidth="9"
                  strokeDasharray="238"
                  strokeDashoffset="60"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              {/* Center Stat Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-[#0F1B3D] font-display font-num tracking-tight">
                  {achievementPercentage}%
                </span>
                <span className="text-[10px] text-[#5B6786] font-medium">
                  Goal Achievement
                </span>
                <span className="text-[10px] text-[#0E7C4A] font-bold bg-[#DDF3E8] px-1.5 py-0.2 rounded-full mt-0.5">
                  Target Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Legend / Category breakdown list */}
        <div className="space-y-2.5 pt-2 border-t border-[#DCE3EE] text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1D45C9]" />
              <span className="text-[#0F1B3D] font-medium">Calls & Engagement</span>
            </div>
            <div className="flex items-center gap-2 font-num">
              <span className="font-bold text-[#0F1B3D]">{totalCalls}</span>
              <span className="text-[11px] font-semibold text-[#0E7C4A] bg-[#DDF3E8] px-1.5 py-0.5 rounded">
                +1,8%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0E7C4A]" />
              <span className="text-[#0F1B3D] font-medium">Admissions Closed</span>
            </div>
            <div className="flex items-center gap-2 font-num">
              <span className="font-bold text-[#0F1B3D]">{metrics.admissionsCount || 2}</span>
              <span className="text-[11px] font-semibold text-[#0E7C4A] bg-[#DDF3E8] px-1.5 py-0.5 rounded">
                Paid
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-[#0F1B3D] font-medium">Scheduled & Due</span>
            </div>
            <div className="flex items-center gap-2 font-num">
              <span className="font-bold text-[#0F1B3D]">{scheduledLeadsCount}</span>
              <span className="text-[11px] font-semibold text-[#9A5B00] bg-[#FDEFD2] px-1.5 py-0.5 rounded">
                Pending
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
