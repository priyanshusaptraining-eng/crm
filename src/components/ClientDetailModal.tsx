import React, { useState } from 'react';
import { Lead, User, CallStatus, NoteHistoryItem } from '../types/crm';
import { canUserAssignLead, canUserEditLead } from '../utils/crmLogic';
import { 
  User as UserIcon, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Calendar, 
  IndianRupee, 
  MessageSquare, 
  Plus, 
  Edit3, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  UserCheck,
  Video
} from 'lucide-react';

interface ClientDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  allUsers: User[];
  onReassignLead: (leadId: string, newUserId: string) => void;
  onStatusChange: (leadId: string, newStatus: CallStatus) => void;
  onAddNote: (leadId: string, noteText: string, noteType: NoteHistoryItem['type']) => void;
  onOpenEditModal: (lead: Lead) => void;
  onOpenDemoScheduler: (lead: Lead) => void;
  onOpenAdmissionModal: (lead: Lead) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onReassignLead,
  onStatusChange,
  onAddNote,
  onOpenEditModal,
  onOpenDemoScheduler,
  onOpenAdmissionModal,
}) => {
  if (!isOpen || !lead) return null;

  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteType, setNewNoteType] = useState<NoteHistoryItem['type']>('call');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const canEdit = canUserEditLead(currentUser, lead);
  const canAssign = canUserAssignLead(currentUser, lead);

  const notes = lead.notesHistory || [];
  const latestNote = notes[0];
  const previousNotes = notes.slice(1);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setIsSubmittingNote(true);
    onAddNote(lead.id, newNoteText.trim(), newNoteType);
    setNewNoteText('');
    setIsSubmittingNote(false);
  };

  const getStatusBadge = (status: CallStatus) => {
    switch (status) {
      case 'new_lead':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E4EBFC] text-[#1D45C9]">New Lead</span>;
      case 'interested':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">Interested</span>;
      case 'call_later':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FDEFD2] text-[#9A5B00]">Call Later</span>;
      case 'npu':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">NPU (No Pick Up)</span>;
      case 'ni':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FBE3E1] text-[#B3261E]">Not Interested (NI)</span>;
      case 'admission_joined':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DDF3E8] text-[#0E7C4A]">Admission Joined</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0F1B3D]/50 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#DCE3EE] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-[#DCE3EE] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#E4EBFC] text-[#1D45C9] flex items-center justify-center font-extrabold text-lg font-display">
              {lead.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-[#0F1B3D] font-display">
                  {lead.name}
                </h2>
                {getStatusBadge(lead.status)}
              </div>
              <p className="text-xs text-[#5B6786] font-medium mt-0.5 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#5B6786]" />
                  <span>{lead.location || 'Location Not Specified'}</span>
                </span>
                <span>•</span>
                <span>{lead.callsCount} calls logged</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEditModal(lead);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1D45C9] text-white hover:bg-blue-700 text-xs font-bold shadow-xs transition-colors"
              title="Edit full lead details (Sahi Karein)"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Lead</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#0F1B3D]">
          
          {/* Top Quick Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Contact Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#DCE3EE] space-y-2">
              <div className="text-[11px] font-bold text-[#5B6786] uppercase tracking-wider">
                Contact Info
              </div>
              <div className="space-y-1.5">
                <a 
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-2 font-mono font-bold text-slate-900 hover:text-[#1D45C9] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lead.phone}</span>
                </a>
                <a 
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-2 text-slate-700 hover:text-[#1D45C9] transition-colors truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{lead.email}</span>
                </a>
              </div>
            </div>

            {/* Assignment & Counselor Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#DCE3EE] space-y-2">
              <div className="text-[11px] font-bold text-[#5B6786] uppercase tracking-wider flex items-center justify-between">
                <span>Assigned Counselor</span>
                {canAssign && <span className="text-[10px] text-[#1D45C9] font-bold">Reassignable</span>}
              </div>
              <div className="space-y-1">
                {canAssign ? (
                  <select
                    value={lead.assignedTo}
                    onChange={(e) => onReassignLead(lead.id, e.target.value)}
                    className="w-full text-xs font-bold rounded-xl px-2.5 py-1.5 border border-[#DCE3EE] bg-white text-[#0F1B3D] focus:outline-none focus:ring-2 focus:ring-[#1D45C9]/20 cursor-pointer"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role === 'super_admin' ? 'Super Admin' : 'Counselor'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="font-bold text-sm text-[#0F1B3D] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#0E7C4A]" />
                    <span>{lead.assignedUserName}</span>
                  </div>
                )}
                <div className="text-[10px] text-[#5B6786]">
                  Status: {lead.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            </div>

            {/* Fee & Deal Value Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#DCE3EE] space-y-2">
              <div className="text-[11px] font-bold text-[#5B6786] uppercase tracking-wider">
                Fee & Deal Value
              </div>
              <div>
                <div className="text-base font-extrabold text-[#0E7C4A] font-display flex items-center gap-1">
                  <span>₹{(lead.paymentDetails?.amountPaid || lead.revenue || 0).toLocaleString('en-IN')}</span>
                  <span className="text-slate-400 text-xs font-normal font-sans">
                    / ₹{(lead.paymentDetails?.totalCourseFee || lead.dealValue).toLocaleString('en-IN')}
                  </span>
                </div>
                {lead.paymentDetails?.remainingAmount ? (
                  <div className="text-[10px] font-bold text-[#B3261E] mt-0.5">
                    Balance ₹{lead.paymentDetails.remainingAmount.toLocaleString('en-IN')} due {lead.paymentDetails.remainingDueDate}
                  </div>
                ) : (
                  <div className="text-[10px] text-[#5B6786] mt-0.5">
                    {lead.status === 'admission_joined' ? 'Fee Cleared' : 'In Pipeline'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDemoScheduler(lead);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E4EBFC] text-[#1D45C9] hover:bg-blue-100 font-bold text-xs transition-colors"
            >
              <Video className="w-4 h-4" />
              <span>{lead.demoDetails?.date ? 'View / Reschedule Demo' : 'Schedule Google Meet Demo'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdmissionModal(lead);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#DDF3E8] text-[#0E7C4A] hover:bg-emerald-100 font-bold text-xs transition-colors"
            >
              <IndianRupee className="w-4 h-4" />
              <span>{lead.paymentDetails ? 'Update Fee Details' : 'Enroll & Collect Fee'}</span>
            </button>

            {canEdit && (
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-[#5B6786] font-bold">Change Status:</span>
                <select
                  value={lead.status}
                  onChange={(e) => onStatusChange(lead.id, e.target.value as CallStatus)}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-[#DCE3EE] bg-white cursor-pointer"
                >
                  <option value="new_lead">New Lead</option>
                  <option value="interested">Interested</option>
                  <option value="call_later">Call Later</option>
                  <option value="npu">NPU (No Pick)</option>
                  <option value="ni">Not Interested (NI)</option>
                  <option value="admission_joined">Admission Joined</option>
                </select>
              </div>
            )}
          </div>

          {/* Reason If Lost */}
          {lead.lostReason && (
            <div className="p-3 rounded-2xl bg-[#FBE3E1] border border-rose-200 flex items-start gap-2.5 text-[#B3261E]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Loss / Objection Reason:</span> {lead.lostReason}
              </div>
            </div>
          )}

          {/* CONVERSATION HISTORY SECTION ("Iske baare mein kya ab last baat hui thi, usse pehle kya baat hui thi") */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#0F1B3D] font-display flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#1D45C9]" />
                  <span>Conversation History & Counseling Timeline</span>
                </h3>
                <p className="text-xs text-[#5B6786] mt-0.5">
                  Chronological records of client calls, parent consultations, WhatsApp updates, and objections
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#0F1B3D] font-bold text-xs">
                {notes.length} Records
              </span>
            </div>

            {/* 1. LATEST CONVERSATION HIGHLIGHT ("Abhi last baat kya hui thi") */}
            {latestNote ? (
              <div className="p-4 rounded-2xl bg-[#E4EBFC]/60 border border-[#1D45C9]/30 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#1D45C9] text-white">
                    Abhi Last Baat Hui Thi (Most Recent Conversation)
                  </span>
                  <span className="text-[11px] text-[#5B6786] font-mono font-medium">
                    {latestNote.timestamp}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#0F1B3D] leading-relaxed">
                  {latestNote.text}
                </p>
                <div className="mt-2 text-[11px] text-[#5B6786] font-medium flex items-center gap-2">
                  <span>Logged by: <strong className="text-[#0F1B3D]">{latestNote.author}</strong></span>
                  <span>•</span>
                  <span className="capitalize">Channel: {latestNote.type}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-[#5B6786]">
                No conversation recorded yet. Add the first note below!
              </div>
            )}

            {/* 2. PREVIOUS CONVERSATIONS ("Usse pehle kya baat hui thi") */}
            {previousNotes.length > 0 && (
              <div className="space-y-2.5">
                <div className="text-[11px] font-extrabold text-[#5B6786] uppercase tracking-wider px-1">
                  Usse Pehle Ki Baat (Earlier Discussions Timeline)
                </div>
                <div className="space-y-2 border-l-2 border-[#DCE3EE] ml-3 pl-4">
                  {previousNotes.map((note) => (
                    <div key={note.id} className="p-3 rounded-xl bg-slate-50 border border-[#DCE3EE] space-y-1 relative">
                      <div className="absolute -left-[23px] top-4 w-2.5 h-2.5 rounded-full bg-[#1D45C9] ring-4 ring-white" />
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#0F1B3D]">{note.author}</span>
                        <span className="text-[#5B6786] font-mono">{note.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-snug">
                        {note.text}
                      </p>
                      <div className="text-[10px] text-[#5B6786] capitalize">
                        Channel: {note.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. LOG NEW CONVERSATION FORM */}
            <form onSubmit={handleCreateNote} className="p-4 rounded-2xl bg-slate-50 border border-[#DCE3EE] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0F1B3D] block">
                  + Nayi Baat / Conversation Note Likhein
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#5B6786] font-medium">Type:</span>
                  <select
                    value={newNoteType}
                    onChange={(e) => setNewNoteType(e.target.value as NoteHistoryItem['type'])}
                    className="text-xs font-bold bg-white border border-[#DCE3EE] rounded-lg px-2 py-1 cursor-pointer"
                  >
                    <option value="call">Phone Call</option>
                    <option value="whatsapp">WhatsApp Message</option>
                    <option value="counseling">Counseling Session</option>
                    <option value="meeting">Meeting / Demo</option>
                    <option value="objection">Client Objection / Reason</option>
                    <option value="general">General Note</option>
                  </select>
                </div>
              </div>

              <textarea
                rows={2}
                required
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Client se kya baat hui? E.g., 'Parents ready hain, next Monday fee pay karenge...'"
                className="w-full text-xs font-medium text-[#0F1B3D] bg-white border border-[#DCE3EE] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1D45C9]/20 focus:border-[#1D45C9]"
              />

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingNote || !newNoteText.trim()}
                  className="px-4 py-2 rounded-xl bg-[#1D45C9] hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Conversation Record</span>
                </button>
              </div>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
};
