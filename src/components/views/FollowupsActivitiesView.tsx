import React, { useState } from 'react';
import { Lead, User, ActivityTask } from '../../types/crm';
import { 
  Clock, 
  Calendar, 
  Phone, 
  Video, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowUpRight,
  UserCheck,
  Plus
} from 'lucide-react';

import { PhoneActionGroup } from '../PhoneActionGroup';

interface FollowupsActivitiesViewProps {
  leads: Lead[];
  currentUser: User;
  allUsers: User[];
  onOpenClientDetail: (lead: Lead) => void;
  onOpenDemoScheduler: (lead: Lead) => void;
  onLogCall: (leadId: string) => void;
  onInitiateCall?: (lead: Lead) => void;
  onOpenWhatsAppModal?: (lead: Lead) => void;
  onNotifyToast: (msg: string) => void;
}

export const FollowupsActivitiesView: React.FC<FollowupsActivitiesViewProps> = ({
  leads,
  currentUser,
  allUsers,
  onOpenClientDetail,
  onOpenDemoScheduler,
  onLogCall,
  onInitiateCall,
  onOpenWhatsAppModal,
  onNotifyToast,
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'demos' | 'all'>('today');
  const [counselorFilter, setCounselorFilter] = useState<string>('all');
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  const todayStr = '2026-11-07';

  // Leads with follow-up or demo scheduled
  const actionableLeads = leads.filter((l) => {
    if (counselorFilter !== 'all' && l.assignedTo !== counselorFilter) return false;
    return l.status === 'call_later' || l.status === 'demo_scheduled' || l.status === 'interested';
  });

  // Categorize
  const todayTasks = actionableLeads.filter((l) => {
    return l.followUpDate === 'Today' || l.demoDetails?.date === 'Today' || l.demoDetails?.date === todayStr;
  });

  const overdueTasks = actionableLeads.filter((l) => {
    return l.followUpDate === 'Overdue' || (l.followUpDate && l.followUpDate < todayStr && l.followUpDate !== 'Today');
  });

  const demoTasks = actionableLeads.filter((l) => {
    return l.status === 'demo_scheduled' || Boolean(l.demoDetails?.date);
  });

  const getFilteredList = () => {
    switch (activeTab) {
      case 'today': return todayTasks;
      case 'overdue': return overdueTasks;
      case 'demos': return demoTasks;
      case 'all': return actionableLeads;
    }
  };

  const currentList = getFilteredList();

  const handleToggleDone = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        onNotifyToast('Task marked as active');
      } else {
        next.add(id);
        onNotifyToast('Activity completed successfully!');
      }
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--crm-surface)] border border-[var(--crm-border)] p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--crm-text)] tracking-tight">
              Follow-ups & Scheduled Activities
            </h2>
            <p className="text-xs text-[var(--crm-text-secondary)] mt-0.5">
              Daily high-priority action queue for calls, webinars, and pending student consultations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
        </div>
      </div>

      {/* Tabs and Counts */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--crm-border)] pb-3">
        <button
          onClick={() => setActiveTab('today')}
          className={`text-xs px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'today'
              ? 'bg-[var(--crm-primary)] text-white shadow-sm'
              : 'bg-[var(--crm-surface)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text)] border border-[var(--crm-border)]'
          }`}
        >
          <span>Today's Follow-ups</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${activeTab === 'today' ? 'bg-white/20' : 'bg-[var(--crm-input)]'}`}>
            {todayTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`text-xs px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'overdue'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-[var(--crm-surface)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text)] border border-[var(--crm-border)]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Overdue Tasks</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${activeTab === 'overdue' ? 'bg-white/20' : 'bg-[var(--crm-input)]'}`}>
            {overdueTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('demos')}
          className={`text-xs px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'demos'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-[var(--crm-surface)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text)] border border-[var(--crm-border)]'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-purple-400" />
          <span>Upcoming Demos</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${activeTab === 'demos' ? 'bg-white/20' : 'bg-[var(--crm-input)]'}`}>
            {demoTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`text-xs px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-[var(--crm-surface)] text-[var(--crm-text)] border-2 border-[var(--crm-primary)]'
              : 'bg-[var(--crm-surface)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text)] border border-[var(--crm-border)]'
          }`}
        >
          <span>All Scheduled Queue</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--crm-input)] tabular-nums">
            {actionableLeads.length}
          </span>
        </button>
      </div>

      {/* Task Queue List */}
      <div className="space-y-3">
        {currentList.length === 0 ? (
          <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] rounded-2xl p-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-bold text-[var(--crm-text)]">All clear! No tasks in this queue</h3>
            <p className="text-xs text-[var(--crm-text-secondary)] mt-1">
              You are completely caught up on your scheduled follow-up calls and demo sessions.
            </p>
          </div>
        ) : (
          currentList.map((lead) => {
            const isCompleted = completedTaskIds.has(lead.id);

            return (
              <div
                key={lead.id}
                onClick={() => onOpenClientDetail(lead)}
                className={`bg-[var(--crm-surface)] border border-[var(--crm-border)] hover:border-[var(--crm-primary)]/50 rounded-2xl p-4 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCompleted ? 'opacity-60 bg-[var(--crm-surface)]/60' : ''
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={(e) => handleToggleDone(lead.id, e)}
                    className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                      isCompleted 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-[var(--crm-border)] hover:border-[var(--crm-primary)] bg-[var(--crm-input)]'
                    }`}
                    title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold text-[var(--crm-text)] ${isCompleted ? 'line-through text-[var(--crm-text-secondary)]' : ''}`}>
                        {lead.name}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text-secondary)]">
                        {lead.course || 'Candidate'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[var(--crm-text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[var(--crm-primary)]" />
                        <span className="font-mono text-[var(--crm-text)]">{lead.phone}</span>
                      </span>

                      <span>Location: <strong className="text-[var(--crm-text)] font-medium">{lead.location}</strong></span>

                      <span>Counselor: <strong className="text-[var(--crm-text)] font-medium">{lead.assignedUserName}</strong></span>

                      {lead.demoDetails?.date && (
                        <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-medium">
                          Demo: {lead.demoDetails.date} at {lead.demoDetails.time || '11:00 AM'}
                        </span>
                      )}
                    </div>

                    {lead.feedback && (
                      <div className="mt-2 text-xs text-[var(--crm-text-secondary)] italic bg-[var(--crm-input)]/60 p-2 rounded-lg border border-[var(--crm-border)] max-w-2xl">
                        "{lead.feedback}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side actions */}
                <div 
                  className="flex flex-wrap items-center gap-2 self-start md:self-center"
                  onClick={(e) => e.stopPropagation()}
                >
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
                    onClick={() => onOpenDemoScheduler(lead)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-purple-500/15 text-purple-400 hover:bg-purple-500 hover:text-white font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Demo Link</span>
                  </button>

                  <button
                    onClick={() => onOpenClientDetail(lead)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-[var(--crm-input)] hover:bg-[var(--crm-border)] text-[var(--crm-text)] font-medium transition-colors flex items-center gap-1"
                  >
                    <span>Notes</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
