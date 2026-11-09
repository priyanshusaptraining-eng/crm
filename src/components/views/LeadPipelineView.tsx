import React, { useState } from 'react';
import { Lead, User, CallStatus } from '../../types/crm';
import { 
  Columns3, 
  Phone, 
  Calendar, 
  ChevronRight, 
  Plus, 
  GraduationCap, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  ArrowRight
} from 'lucide-react';

interface LeadPipelineViewProps {
  leads: Lead[];
  currentUser: User;
  allUsers: User[];
  onOpenClientDetail: (lead: Lead) => void;
  onOpenDemoScheduler: (lead: Lead) => void;
  onOpenAdmissionModal: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: CallStatus) => void;
  onAddNewLead: () => void;
  onNotifyToast: (msg: string) => void;
}

interface ColumnConfig {
  id: CallStatus;
  title: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}

const PIPELINE_COLUMNS: ColumnConfig[] = [
  { id: 'new', title: 'New Leads', badgeBg: 'bg-blue-500/10', badgeText: 'text-blue-400', dotColor: 'bg-blue-400' },
  { id: 'interested', title: 'Interested', badgeBg: 'bg-indigo-500/10', badgeText: 'text-indigo-400', dotColor: 'bg-indigo-400' },
  { id: 'demo_scheduled', title: 'Demo Scheduled', badgeBg: 'bg-purple-500/10', badgeText: 'text-purple-400', dotColor: 'bg-purple-400' },
  { id: 'call_later', title: 'Follow-up Required', badgeBg: 'bg-amber-500/10', badgeText: 'text-amber-400', dotColor: 'bg-amber-400' },
  { id: 'admission_joined', title: 'Admission Joined', badgeBg: 'bg-emerald-500/10', badgeText: 'text-emerald-400', dotColor: 'bg-emerald-400' },
  { id: 'not_interested', title: 'Lost / Disqualified', badgeBg: 'bg-rose-500/10', badgeText: 'text-rose-400', dotColor: 'bg-rose-400' },
];

export const LeadPipelineView: React.FC<LeadPipelineViewProps> = ({
  leads,
  currentUser,
  allUsers,
  onOpenClientDetail,
  onOpenDemoScheduler,
  onOpenAdmissionModal,
  onStatusChange,
  onAddNewLead,
  onNotifyToast,
}) => {
  const [counselorFilter, setCounselorFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  const filteredLeads = leads.filter((lead) => {
    if (counselorFilter !== 'all' && lead.assignedTo !== counselorFilter) return false;
    if (courseFilter !== 'all' && lead.course !== courseFilter) return false;
    return true;
  });

  const uniqueCourses = Array.from(new Set(leads.map((l) => l.course).filter(Boolean)));

  const totalPipelineValue = filteredLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);

  const getNextStatus = (current: CallStatus): CallStatus | null => {
    switch (current) {
      case 'new': return 'interested';
      case 'interested': return 'demo_scheduled';
      case 'demo_scheduled': return 'call_later';
      case 'call_later': return 'admission_joined';
      default: return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--crm-surface)] border border-[var(--crm-border)] p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--crm-primary)]/10 text-[var(--crm-primary)] flex items-center justify-center font-bold">
            <Columns3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--crm-text)] tracking-tight">
              Lead Pipeline Kanban
            </h2>
            <p className="text-xs text-[var(--crm-text-secondary)] mt-0.5">
              Drag, track, and advance student applicants through enrollment qualification stages
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Counselor filter */}
          <select
            value={counselorFilter}
            onChange={(e) => setCounselorFilter(e.target.value)}
            className="text-xs bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] rounded-xl px-3 py-2 outline-none focus:border-[var(--crm-primary)]"
          >
            <option value="all">All Counselors ({allUsers.length})</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="text-xs bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] rounded-xl px-3 py-2 outline-none focus:border-[var(--crm-primary)]"
          >
            <option value="all">All Courses</option>
            {uniqueCourses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Add lead button */}
          <button
            onClick={onAddNewLead}
            className="text-xs px-3.5 py-2 rounded-xl bg-[var(--crm-primary)] text-white hover:opacity-90 font-medium flex items-center gap-1.5 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student Lead</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[var(--crm-surface)] border border-[var(--crm-border)]">
          <div className="text-[11px] font-medium text-[var(--crm-text-secondary)] uppercase tracking-wider">Active Pipeline Leads</div>
          <div className="text-2xl font-bold text-[var(--crm-text)] mt-1 tabular-nums">{filteredLeads.length}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--crm-surface)] border border-[var(--crm-border)]">
          <div className="text-[11px] font-medium text-[var(--crm-text-secondary)] uppercase tracking-wider">Total Pipeline Value</div>
          <div className="text-2xl font-bold text-[var(--crm-primary)] mt-1 tabular-nums">₹{totalPipelineValue.toLocaleString('en-IN')}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--crm-surface)] border border-[var(--crm-border)]">
          <div className="text-[11px] font-medium text-[var(--crm-text-secondary)] uppercase tracking-wider">Demo Stage Leads</div>
          <div className="text-2xl font-bold text-purple-400 mt-1 tabular-nums">
            {filteredLeads.filter((l) => l.status === 'demo_scheduled').length}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--crm-surface)] border border-[var(--crm-border)]">
          <div className="text-[11px] font-medium text-[var(--crm-text-secondary)] uppercase tracking-wider">Enrollment Conversions</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
            {filteredLeads.filter((l) => l.status === 'admission_joined').length}
          </div>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 items-start">
        {PIPELINE_COLUMNS.map((column) => {
          const colLeads = filteredLeads.filter((l) => {
            if (column.id === 'not_interested') {
              return l.status === 'not_interested' || l.status === 'npu';
            }
            return l.status === column.id;
          });

          const columnTotalValue = colLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);

          return (
            <div
              key={column.id}
              className="bg-[var(--crm-surface)] border border-[var(--crm-border)] rounded-2xl flex flex-col h-[calc(100vh-290px)] min-h-[500px]"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-[var(--crm-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${column.dotColor}`} />
                  <span className="text-xs font-semibold text-[var(--crm-text)]">{column.title}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${column.badgeBg} ${column.badgeText} tabular-nums`}>
                    {colLeads.length}
                  </span>
                </div>
                <div className="text-[10px] font-medium text-[var(--crm-text-secondary)] tabular-nums">
                  ₹{(columnTotalValue / 1000).toFixed(0)}k
                </div>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                {colLeads.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-3 border border-dashed border-[var(--crm-border)] rounded-xl">
                    <p className="text-[11px] text-[var(--crm-text-secondary)]">No leads in stage</p>
                  </div>
                ) : (
                  colLeads.map((lead) => {
                    const nextStage = getNextStatus(lead.status);

                    return (
                      <div
                        key={lead.id}
                        className="bg-[var(--crm-elevated)] border border-[var(--crm-border)] hover:border-[var(--crm-primary)]/50 rounded-xl p-3 transition-colors shadow-sm cursor-pointer group"
                        onClick={() => onOpenClientDetail(lead)}
                      >
                        {/* Student Name & Value */}
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <div className="text-xs font-bold text-[var(--crm-text)] group-hover:text-[var(--crm-primary)] transition-colors">
                              {lead.name}
                            </div>
                            <div className="text-[10px] text-[var(--crm-text-secondary)] truncate max-w-[130px]">
                              {lead.course || 'Training Candidate'}
                            </div>
                          </div>
                          <div className="text-xs font-semibold text-emerald-400 tabular-nums">
                            ₹{(lead.dealValue || 0).toLocaleString('en-IN')}
                          </div>
                        </div>

                        {/* Location & Counselor */}
                        <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--crm-text-secondary)]">
                          <span>{lead.location || 'India'}</span>
                          <span className="px-1.5 py-0.5 rounded bg-[var(--crm-input)] border border-[var(--crm-border)]">
                            {lead.assignedUserName.split(' ')[0]}
                          </span>
                        </div>

                        {/* Demo or Remark Info */}
                        {lead.demoDetails?.date && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            <Calendar className="w-3 h-3" />
                            <span>Demo: {lead.demoDetails.date}</span>
                          </div>
                        )}

                        {lead.feedback && !lead.demoDetails?.date && (
                          <div className="mt-2 text-[10px] text-[var(--crm-text-secondary)] truncate italic">
                            "{lead.feedback}"
                          </div>
                        )}

                        {/* Quick action bar */}
                        <div 
                          className="mt-3 pt-2.5 border-t border-[var(--crm-border)] flex items-center justify-between gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-1.5 rounded-lg bg-[var(--crm-input)] hover:bg-[var(--crm-primary)] hover:text-white text-[var(--crm-text-secondary)] transition-colors"
                            title="Call student"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {lead.status !== 'admission_joined' && (
                            <button
                              onClick={() => onOpenAdmissionModal(lead)}
                              className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-white font-medium transition-colors flex items-center gap-1"
                              title="Convert to Admission"
                            >
                              <GraduationCap className="w-3 h-3" />
                              <span>Enroll</span>
                            </button>
                          )}

                          {nextStage && (
                            <button
                              onClick={() => {
                                onStatusChange(lead.id, nextStage);
                                onNotifyToast(`Moved ${lead.name} to next stage!`);
                              }}
                              className="text-[10px] px-2 py-1 rounded-lg bg-[var(--crm-primary)]/15 text-[var(--crm-primary)] hover:bg-[var(--crm-primary)] hover:text-white font-medium transition-colors flex items-center gap-1"
                              title="Advance to next stage"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
