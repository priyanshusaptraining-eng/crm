import React, { useState } from 'react';
import { Lead, User } from '../types/crm';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  Share2,
  DollarSign,
  UserCheck,
  Clock,
  Video,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

import { PhoneActionGroup } from './PhoneActionGroup';

interface LeadProfileDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  allUsers: User[];
  currentUser: User;
  onReassignCounselor: (leadId: string, counselorId: string) => void;
  onAddNote: (leadId: string, text: string, type: 'call' | 'whatsapp' | 'meeting' | 'counseling' | 'objection' | 'general') => void;
  onOpenDemoScheduler: (lead: Lead) => void;
  onOpenAdmissionModal: (lead: Lead) => void;
  onInitiateCall?: (lead: Lead) => void;
  onOpenWhatsAppModal?: (lead: Lead) => void;
  onNotifyToast: (msg: string) => void;
}

export const LeadProfileDrawer: React.FC<LeadProfileDrawerProps> = ({
  lead,
  isOpen,
  onClose,
  allUsers,
  currentUser,
  onReassignCounselor,
  onAddNote,
  onOpenDemoScheduler,
  onOpenAdmissionModal,
  onInitiateCall,
  onOpenWhatsAppModal,
  onNotifyToast,
}) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [noteType, setNoteType] = useState<'call' | 'whatsapp' | 'meeting' | 'counseling' | 'objection' | 'general'>('call');
  const [isCopiedPhone, setIsCopiedPhone] = useState(false);

  if (!isOpen || !lead) return null;

  const handleCopyPhone = () => {
    try {
      navigator.clipboard.writeText(lead.phone);
    } catch {
      const el = document.createElement('textarea');
      el.value = lead.phone;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setIsCopiedPhone(true);
    onNotifyToast(`Copied ${lead.phone} to clipboard`);
    setTimeout(() => setIsCopiedPhone(false), 2000);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(lead.id, newNoteText.trim(), noteType);
    setNewNoteText('');
    onNotifyToast('Note added to student history');
  };

  const notes = lead.notesHistory || [];
  const latestNote = notes[0];
  const earlierNotes = notes.slice(1);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="flex-1" onClick={onClose} />

      <aside className="w-full max-w-xl bg-[var(--card-bg)] border-l border-[var(--border)] shadow-2xl flex flex-col h-full overflow-hidden text-[var(--text-primary)] animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--elevated-bg)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] font-bold flex items-center justify-center text-sm border border-[var(--accent)]/30">
              {lead.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  {lead.name}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30 uppercase">
                  {lead.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Inquiry registered: {lead.createdAt} · Priority: {lead.priority || 'Normal'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-[200px]">
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
                size="md"
                className="w-full justify-between"
              />
            </div>

            <button
              type="button"
              onClick={() => onOpenDemoScheduler(lead)}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#151F35] hover:bg-[#1E2D4A] text-xs font-semibold text-slate-200 border border-[#1E2D4A] transition-colors"
            >
              <Video className="w-3.5 h-3.5 text-blue-400" />
              <span>Schedule Demo</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAdmissionModal(lead)}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-xs font-semibold text-emerald-400 border border-emerald-500/30 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Record Fee</span>
            </button>
          </div>

          {/* Candidate Profile Info Grid */}
          <div className="p-4 rounded-xl bg-[var(--elevated-bg)] border border-[var(--border)] grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Location
              </span>
              <div className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
                <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                <span>{lead.location || 'Not Specified'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Course Interest
              </span>
              <div className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
                <BookOpen className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span className="truncate">{lead.course || 'Full Stack Engineering'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Phone & WhatsApp
              </span>
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
            </div>

            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Email Address
              </span>
              <div className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)] truncate">
                <Mail className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                <span className="truncate">{lead.email}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Lead Source
              </span>
              <div className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
                <Share2 className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                <span>{lead.source || 'Meta Ads'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Assigned Counselor
              </span>
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <select
                  value={lead.assignedTo}
                  onChange={(e) => onReassignCounselor(lead.id, e.target.value)}
                  className="bg-[var(--input-bg)] border border-[var(--border)] rounded px-1.5 py-0.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id} className="bg-[var(--card-bg)]">
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Fee & Enrollment Status (if present) */}
          <div className="p-4 rounded-xl bg-[var(--elevated-bg)] border border-[var(--border)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[var(--success)]" />
                <span>Enrollment & Fee Status</span>
              </span>
              <span className="font-bold text-[var(--success)] tabular-nums">
                ₹{(lead.paymentDetails?.amountPaid || lead.revenue || 0).toLocaleString('en-IN')} / ₹{(lead.dealValue || 30000).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="w-full bg-[var(--input-bg)] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[var(--success)] h-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      ((lead.paymentDetails?.amountPaid || lead.revenue || 0) / (lead.dealValue || 30000)) * 100
                    )
                  )}%`,
                }}
              />
            </div>

            {lead.paymentDetails?.remainingAmount ? (
              <p className="text-[11px] text-[var(--warning)] font-medium">
                Pending balance of ₹{lead.paymentDetails.remainingAmount.toLocaleString('en-IN')} due on {lead.paymentDetails.remainingDueDate}.
              </p>
            ) : lead.status === 'admission_joined' ? (
              <p className="text-[11px] text-[var(--success)] font-medium">
                Full payment verified. Enrolled in cohort batch.
              </p>
            ) : (
              <p className="text-[11px] text-[var(--text-muted)]">
                No fee collected yet. Program deal value: ₹{(lead.dealValue || 25000).toLocaleString('en-IN')}.
              </p>
            )}
          </div>

          {/* Scheduled Webinar/Demo Card */}
          {lead.demoDetails && (
            <div className="p-4 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--accent)] flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" />
                  <span>Scheduled Webinar Demo</span>
                </span>
                <span className="text-[11px] font-bold text-[var(--text-primary)] tabular-nums">
                  {lead.demoDetails.date} · {lead.demoDetails.time}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Topic: {lead.demoDetails.webinarTopic}
              </p>
              <div className="flex items-center justify-between text-xs pt-1">
                <a
                  href={lead.demoDetails.googleMeetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
                >
                  Join Meeting URL
                </a>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-secondary)]">
                  {lead.demoDetails.attended === true
                    ? 'Attended'
                    : lead.demoDetails.attended === false
                    ? 'Missed'
                    : 'Upcoming'}
                </span>
              </div>
            </div>
          )}

          {/* Add New Conversation Note Form */}
          <form onSubmit={handleSaveNote} className="p-4 rounded-xl bg-[var(--elevated-bg)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="drawer-new-note" className="text-xs font-semibold text-[var(--text-primary)]">
                Log New Interaction / Remark
              </label>
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as any)}
                className="bg-[var(--input-bg)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="call">Phone Call</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="counseling">Counseling Session</option>
                <option value="meeting">Demo / Meeting</option>
                <option value="objection">Objection Raised</option>
                <option value="general">General Remark</option>
              </select>
            </div>

            <textarea
              id="drawer-new-note"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Record call outcome, parent feedback, token commitment, or questions..."
              rows={3}
              className="w-full p-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] resize-none"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--accent)] hover:opacity-90 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-opacity"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>
          </form>

          {/* Chronological Conversation History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Conversation History ({notes.length})
              </h3>
              <span className="text-[11px] text-[var(--text-muted)]">
                Total Outbound Calls: {lead.callsCount}
              </span>
            </div>

            {/* Latest Discussion (Prominently Highlighted) */}
            {latestNote && (
              <div className="p-3.5 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--accent)] flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>Most Recent Conversation</span>
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] tabular-nums">
                    {latestNote.timestamp} · {latestNote.author}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                  {latestNote.text}
                </p>
              </div>
            )}

            {/* Earlier Discussion Timeline */}
            {earlierNotes.length > 0 && (
              <div className="space-y-2 pt-1 border-l-2 border-[var(--border)] ml-3 pl-4">
                {earlierNotes.map((n) => (
                  <div key={n.id} className="relative pb-2">
                    <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[var(--border)]" />
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-0.5">
                      <span className="font-semibold text-[var(--text-secondary)] capitalize">{n.type} by {n.author}</span>
                      <span className="tabular-nums">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {n.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {notes.length === 0 && (
              <div className="p-6 text-center text-xs text-[var(--text-muted)] rounded-xl bg-[var(--elevated-bg)] border border-[var(--border)]">
                No recorded interactions yet. Use the form above to log the first discussion.
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
