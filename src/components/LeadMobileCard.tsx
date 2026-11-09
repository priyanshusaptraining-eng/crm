import React, { useState } from 'react';
import { Lead, User, CallStatus } from '../types/crm';
import { 
  Phone, 
  MapPin, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Video, 
  Edit3, 
  Clock, 
  UserCheck, 
  MessageSquare,
  FileText,
  DollarSign
} from 'lucide-react';
import { PhoneActionGroup } from './PhoneActionGroup';

interface LeadMobileCardProps {
  lead: Lead;
  currentUser: User;
  onOpenLeadProfile: (lead: Lead) => void;
  onOpenEditModal: (lead: Lead) => void;
  onOpenDemoScheduler: (lead: Lead) => void;
  onInitiateCall: (lead: Lead) => void;
  onOpenWhatsAppModal: (lead: Lead) => void;
  onNotifyToast: (msg: string) => void;
}

export const LeadMobileCard: React.FC<LeadMobileCardProps> = ({
  lead,
  currentUser,
  onOpenLeadProfile,
  onOpenEditModal,
  onOpenDemoScheduler,
  onInitiateCall,
  onOpenWhatsAppModal,
  onNotifyToast,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSuperAdmin = currentUser.role === 'super_admin';

  const latestNote = lead.notesHistory?.[0]?.text || lead.feedback;

  const getStatusBadge = (status: CallStatus) => {
    switch (status) {
      case 'new_lead':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30">New Lead</span>;
      case 'interested':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">Interested</span>;
      case 'call_later':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">Call Later</span>;
      case 'demo_scheduled':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">Demo Scheduled</span>;
      case 'npu':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-500/15 text-slate-300 border border-slate-500/30">NPU (No Pickup)</span>;
      case 'ni':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">Not Interested</span>;
      case 'admission_joined':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Admitted</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-4 shadow-xl space-y-3.5 transition hover:border-[#23324E]">
      {/* 1. Card Header: Candidate Name, Status, and Expand toggle */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 
              onClick={() => onOpenLeadProfile(lead)}
              className="text-base font-bold text-white hover:text-amber-400 cursor-pointer truncate transition"
            >
              {lead.name}
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">{lead.course}</span>
            {lead.location && (
              <span className="flex items-center gap-0.5 text-slate-400">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">{lead.location}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {getStatusBadge(lead.status)}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#151F35] transition"
            aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. One-Tap Phone Calling & WhatsApp Action Row */}
      <div className="pt-0.5">
        <PhoneActionGroup
          phone={lead.phone}
          candidateName={lead.name}
          courseName={lead.course}
          counselorName={currentUser.name}
          onInitiateCall={() => onInitiateCall(lead)}
          onOpenWhatsAppModal={() => onOpenWhatsAppModal(lead)}
          onNotifyToast={onNotifyToast}
          size="md"
          className="w-full justify-between"
        />
      </div>

      {/* 3. Call Outcome / Latest Feedback Snippet */}
      {latestNote && (
        <div className="p-2.5 bg-[#151F35]/70 border border-[#1E2D4A] rounded-xl text-xs text-slate-300 flex items-start gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="line-clamp-2 leading-relaxed text-[11px] text-slate-300">
            {latestNote}
          </p>
        </div>
      )}

      {/* 4. Next Scheduled Demo / Meeting if present */}
      {lead.demoDetails?.date && (
        <div className="flex items-center justify-between p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs">
          <span className="flex items-center gap-1.5 text-purple-300 font-semibold text-[11px]">
            <Video className="w-3.5 h-3.5 text-purple-400" />
            Scheduled Demo: {lead.demoDetails.date} at {lead.demoDetails.time}
          </span>
          <button
            type="button"
            onClick={() => onOpenDemoScheduler(lead)}
            className="text-[10px] font-bold text-purple-300 hover:underline"
          >
            Details →
          </button>
        </div>
      )}

      {/* 5. Quick Touch Actions (Call, WhatsApp, Schedule Demo, Edit) */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#1E2D4A]/50">
        <button
          type="button"
          onClick={() => onInitiateCall(lead)}
          className="py-2.5 px-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Now</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenDemoScheduler(lead)}
          className="py-2.5 px-2 bg-[#151F35] hover:bg-[#1E2D4A] border border-[#1E2D4A] text-slate-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Video className="w-3.5 h-3.5 text-blue-400" />
          <span>Demo</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenEditModal(lead)}
          className="py-2.5 px-2 bg-[#151F35] hover:bg-[#1E2D4A] border border-[#1E2D4A] text-slate-300 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
          <span>Update</span>
        </button>
      </div>

      {/* 6. Expandable Deep Details */}
      {isExpanded && (
        <div className="pt-3 border-t border-[#1E2D4A] space-y-3 text-xs animate-in fade-in duration-150">
          <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
            <div>
              <span className="text-slate-500 block">Email Address:</span>
              <span className="text-white font-medium break-all">{lead.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Counselor:</span>
              <span className="text-white font-semibold">{lead.assignedUserName || 'Unassigned'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Lead Source:</span>
              <span className="text-slate-300">{lead.source || 'Website'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Deal Value:</span>
              <span className="text-emerald-400 font-bold">
                {lead.dealValue ? `₹${lead.dealValue.toLocaleString('en-IN')}` : '₹35,000'}
              </span>
            </div>
          </div>

          {/* Full Notes History */}
          {lead.notesHistory && lead.notesHistory.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-[#1E2D4A]/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Call & Outreach History ({lead.notesHistory.length})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {lead.notesHistory.map((n) => (
                  <div key={n.id} className="p-2 bg-[#151F35] rounded-xl border border-[#1E2D4A] text-[11px]">
                    <div className="flex items-center justify-between text-slate-400 mb-0.5 text-[10px]">
                      <span className="font-bold text-amber-400 capitalize">{n.type}</span>
                      <span>{n.timestamp} • {n.author}</span>
                    </div>
                    <p className="text-slate-300">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => onOpenLeadProfile(lead)}
            className="w-full py-2 bg-[#151F35] hover:bg-[#1E2D4A] text-slate-200 text-xs font-semibold rounded-xl border border-[#1E2D4A] transition text-center"
          >
            Open Complete Candidate Dossier →
          </button>
        </div>
      )}
    </div>
  );
};
