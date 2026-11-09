import React, { useState } from 'react';
import { Lead, User, CallStatus, NoteHistoryItem } from '../types/crm';
import { 
  PhoneCall, 
  X, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  MessageSquare, 
  AlertCircle, 
  ThumbsUp, 
  ThumbsDown, 
  PhoneMissed, 
  Video, 
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { normalizePhoneNumber } from '../utils/phoneUtils';

interface CallOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  currentUser: User;
  onSaveOutcome: (
    leadId: string,
    newStatus: CallStatus,
    noteText: string,
    nextFollowupDate?: string,
    nextFollowupTime?: string,
    callConnected?: boolean
  ) => void;
  onNotifyToast: (msg: string) => void;
}

export const CallOutcomeModal: React.FC<CallOutcomeModalProps> = ({
  isOpen,
  onClose,
  lead,
  currentUser,
  onSaveOutcome,
  onNotifyToast,
}) => {
  if (!isOpen || !lead) return null;

  const [callConnected, setCallConnected] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<CallStatus>('interested');
  const [noteText, setNoteText] = useState<string>('');
  const [nextFollowupDate, setNextFollowupDate] = useState<string>('2026-11-09');
  const [nextFollowupTime, setNextFollowupTime] = useState<string>('15:00');
  const [quickChip, setQuickChip] = useState<string>('');

  const norm = normalizePhoneNumber(lead.phone);

  const outcomeChips = callConnected
    ? [
        { label: 'Interested & Warm', status: 'interested' as CallStatus, icon: ThumbsUp },
        { label: 'Requested Callback', status: 'call_later' as CallStatus, icon: Clock },
        { label: 'Demo Scheduled', status: 'demo_scheduled' as CallStatus, icon: Video },
        { label: 'Admission Joined', status: 'admission_joined' as CallStatus, icon: GraduationCap },
        { label: 'Not Interested / Lost', status: 'ni' as CallStatus, icon: ThumbsDown },
      ]
    : [
        { label: 'Rung Out / Not Picked Up (NPU)', status: 'npu' as CallStatus, icon: PhoneMissed },
        { label: 'Call Busy / Disconnected', status: 'call_later' as CallStatus, icon: Clock },
        { label: 'Number Switched Off', status: 'call_later' as CallStatus, icon: PhoneMissed },
        { label: 'Invalid / Wrong Number', status: 'ni' as CallStatus, icon: ThumbsDown },
      ];

  const quickNotesSuggestions = callConnected
    ? [
        'Candidate is looking for 0% EMI installment plan.',
        'Spoke regarding course syllabus and batch timings.',
        'Requested live demo slot on Saturday afternoon.',
        'Ready to enroll after discussing with family.',
        'Already joined another institute / not interested.',
      ]
    : [
        'Called 3 times, phone rang out without answer.',
        'Client was busy in office, asked to call after 7 PM.',
        'Number busy on another call.',
        'Phone switched off / out of network.',
      ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalNote = noteText.trim() || (callConnected ? 'Call completed with candidate.' : 'Call attempt: Client did not pick up.');

    onSaveOutcome(
      lead.id,
      selectedStatus,
      finalNote,
      nextFollowupDate ? `${nextFollowupDate} ${nextFollowupTime}` : undefined,
      nextFollowupTime,
      callConnected
    );

    onNotifyToast(`Logged call outcome for ${lead.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#111827] border border-[#1E2D4A] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2D4A] bg-[#151F35] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[220px]">
                  Log Call Outcome: {lead.name}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Call Workflow
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {norm.display || lead.phone} • {lead.course || 'Admissions'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#1E2D4A] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Step 1: Did the call connect? */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              1. Call Connection Status *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setCallConnected(true);
                  setSelectedStatus('interested');
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition active:scale-98 ${
                  callConnected
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-[#151F35] border-[#1E2D4A] text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Call Connected / Spoke
              </button>

              <button
                type="button"
                onClick={() => {
                  setCallConnected(false);
                  setSelectedStatus('npu');
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition active:scale-98 ${
                  !callConnected
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-md shadow-rose-500/10'
                    : 'bg-[#151F35] border-[#1E2D4A] text-slate-400 hover:text-white'
                }`}
              >
                <PhoneMissed className="w-4 h-4 text-rose-400" />
                Did Not Connect / NPU
              </button>
            </div>
          </div>

          {/* Step 2: Select Updated Lead Status */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              2. Updated Lead Status *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {outcomeChips.map((chip) => {
                const IconComponent = chip.icon;
                const isSelected = selectedStatus === chip.status;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setSelectedStatus(chip.status)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs font-semibold transition active:scale-98 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-xs'
                        : 'bg-[#151F35] border-[#1E2D4A] text-slate-300 hover:bg-[#1E2D4A]'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate">{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Quick Notes & Discussion Summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Discussion Notes & Call Feedback
              </label>
              <span className="text-[10px] text-slate-500">Recorded by {currentUser.name}</span>
            </div>

            {/* Quick Suggestions Pills */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {quickNotesSuggestions.slice(0, 3).map((snippet) => (
                <button
                  key={snippet}
                  type="button"
                  onClick={() => {
                    setNoteText((prev) => (prev ? `${prev} ${snippet}` : snippet));
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-[#151F35] hover:bg-[#1E2D4A] border border-[#1E2D4A] text-slate-400 hover:text-slate-200 transition text-left"
                >
                  + {snippet}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record candidate feedback, objections, preferred timings, or financial questions..."
              className="w-full p-3 bg-[#151F35] border border-[#1E2D4A] rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition resize-none"
            />
          </div>

          {/* Step 4: Next Follow-Up Schedule */}
          <div className="bg-[#151F35]/70 border border-[#1E2D4A] p-4 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Next Scheduled Follow-up
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Date</label>
                <input
                  type="date"
                  value={nextFollowupDate}
                  onChange={(e) => setNextFollowupDate(e.target.value)}
                  className="w-full p-2 bg-[#111827] border border-[#1E2D4A] rounded-xl text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Time (IST)</label>
                <input
                  type="time"
                  value={nextFollowupTime}
                  onChange={(e) => setNextFollowupTime(e.target.value)}
                  className="w-full p-2 bg-[#111827] border border-[#1E2D4A] rounded-xl text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#1E2D4A]/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#151F35] hover:bg-[#1E2D4A] border border-[#1E2D4A] transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Call Outcome & Notes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
