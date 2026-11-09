import React, { useState } from 'react';
import { Lead, User } from '../../types/crm';
import { Video, Calendar, Clock, ExternalLink, Copy, Check, Users, CheckCircle2, XCircle } from 'lucide-react';

interface DemosWebinarsViewProps {
  leads: Lead[];
  currentUser: User;
  onOpenDemoModal: (lead: Lead) => void;
  onToggleAttendance: (leadId: string, attended: boolean) => void;
  onNotifyToast: (msg: string) => void;
}

export const DemosWebinarsView: React.FC<DemosWebinarsViewProps> = ({
  leads,
  currentUser,
  onOpenDemoModal,
  onToggleAttendance,
  onNotifyToast,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isSuperAdmin = currentUser.role === 'super_admin';

  const scheduledLeads = leads.filter((l) => {
    if (!isSuperAdmin && l.assignedTo !== currentUser.id) return false;
    return Boolean(l.demoDetails?.date);
  });

  const totalDemos = scheduledLeads.length;
  const attendedCount = scheduledLeads.filter((l) => l.demoDetails?.attended === true).length;
  const pendingAttendanceCount = scheduledLeads.filter((l) => l.demoDetails?.attended === null).length;

  const handleCopyInvite = (lead: Lead) => {
    const text =
      lead.demoDetails?.messageText ||
      `Hi ${lead.name}, your webinar is scheduled on ${lead.demoDetails?.date} at ${lead.demoDetails?.time}. Join via Google Meet: ${lead.demoDetails?.googleMeetLink || 'https://meet.google.com/crm-demo-live'}`;
    
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    setCopiedId(lead.id);
    onNotifyToast(`Webinar invite message copied for ${lead.name}!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--crm-surface)] border border-[var(--crm-border)] p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--crm-text)] tracking-tight">
              Demos & Webinars Command Center
            </h2>
            <p className="text-xs text-[var(--crm-text-secondary)] mt-0.5">
              {isSuperAdmin
                ? 'Company Google Meet calendar schedule, participant tracking, and attendance verification'
                : `Google Meet sessions managed by ${currentUser.name}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>{scheduledLeads.length} Scheduled Sessions</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] p-4 rounded-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
            Total Sessions Scheduled
          </div>
          <div className="text-2xl font-bold text-purple-400 tracking-tight mt-1 tabular-nums">
            {totalDemos}
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            Active Google Meet webinar invites issued
          </div>
        </div>

        <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] p-4 rounded-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
            Confirmed Attendees
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight mt-1 tabular-nums">
            {attendedCount}
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            Candidates who attended full live demo
          </div>
        </div>

        <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] p-4 rounded-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
            Pending Sessions
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight mt-1 tabular-nums">
            {pendingAttendanceCount}
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            Upcoming sessions awaiting candidate check-in
          </div>
        </div>
      </div>

      {/* Demos Table */}
      <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--crm-input)] border-b border-[var(--crm-border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
                <th className="py-3 px-4">Candidate Student</th>
                <th className="py-3 px-4">Course Program</th>
                <th className="py-3 px-4">Session Date & Time</th>
                <th className="py-3 px-4">Meeting URL</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4">Assigned Counselor</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--crm-border)] text-[var(--crm-text)]">
              {scheduledLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[var(--crm-text-secondary)]">
                    No Google Meet webinars scheduled yet.
                  </td>
                </tr>
              ) : (
                scheduledLeads.map((lead) => {
                  const demo = lead.demoDetails;
                  const isCopied = copiedId === lead.id;

                  return (
                    <tr key={lead.id} className="hover:bg-[var(--crm-elevated)] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--crm-text)]">{lead.name}</div>
                        <div className="text-[10px] text-[var(--crm-text-secondary)] font-mono">{lead.phone}</div>
                      </td>

                      <td className="py-3 px-4 text-[11px] text-[var(--crm-text-secondary)]">
                        {lead.course || 'Global Training'}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-[var(--crm-text)]">{demo?.date || 'Today'}</div>
                        <div className="text-[10px] text-[var(--crm-text-secondary)]">{demo?.time || '11:00 AM'}</div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="text-[var(--crm-primary)] truncate max-w-[140px] inline-block">
                          {demo?.googleMeetLink || 'meet.google.com/crm-demo-live'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {demo?.attended === true ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                            Attended
                          </span>
                        ) : demo?.attended === false ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20">
                            No Show
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                onToggleAttendance(lead.id, true);
                                onNotifyToast(`Marked ${lead.name} as attended!`);
                              }}
                              className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                            >
                              Present
                            </button>
                            <button
                              onClick={() => {
                                onToggleAttendance(lead.id, false);
                                onNotifyToast(`Marked ${lead.name} as absent.`);
                              }}
                              className="text-[10px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                            >
                              Absent
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)]">
                          {lead.assignedUserName}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleCopyInvite(lead)}
                            className="p-1.5 rounded-lg bg-[var(--crm-input)] hover:bg-[var(--crm-primary)] hover:text-white text-[var(--crm-text-secondary)] transition-colors border border-[var(--crm-border)]"
                            title="Copy invite text"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => onOpenDemoModal(lead)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-[var(--crm-input)] hover:bg-[var(--crm-primary)] hover:text-white text-[var(--crm-text)] transition-colors border border-[var(--crm-border)]"
                          >
                            Reschedule
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
