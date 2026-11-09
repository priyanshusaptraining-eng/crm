import React, { useState } from 'react';
import { Lead, NoteHistoryItem } from '../types/crm';
import { X, MessageSquare, Phone, MessageCircle, Users, CheckCircle2, Calendar, User as UserIcon } from 'lucide-react';

interface LeadNotesModalProps {
  lead: Lead | null;
  currentUserName: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveNotes: (leadId: string, updatedFeedback: string, newHistoryItem?: NoteHistoryItem) => void;
}

export const LeadNotesModal: React.FC<LeadNotesModalProps> = ({
  lead,
  currentUserName,
  isOpen,
  onClose,
  onSaveNotes,
}) => {
  if (!isOpen || !lead) return null;

  const [notesText, setNotesText] = useState(lead.feedback || '');
  const [noteType, setNoteType] = useState<NoteHistoryItem['type']>('counseling');
  const [quickRemark, setQuickRemark] = useState('');

  const quickChips = [
    'Interested in weekend batch',
    'Requested EMI & loan breakdown',
    'Consulting parents tonight',
    'Follow up tomorrow at 11:00 AM',
    'Full fee payment promised soon',
    'Asked for placement brochure',
    'Ringing continuously, no response',
  ];

  const handleAppendChip = (chip: string) => {
    setNotesText((prev) => (prev ? `${prev}. ${chip}` : chip));
  };

  const handleSave = () => {
    const trimmed = notesText.trim();
    if (!trimmed) return;

    const newHistoryItem: NoteHistoryItem = {
      id: `note_${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }),
      author: currentUserName,
      type: noteType,
      text: quickRemark.trim() || trimmed,
    };

    onSaveNotes(lead.id, trimmed, newHistoryItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#3B5BFE]/10 text-[#3B5BFE] flex items-center justify-center font-bold text-lg shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                  Feedback & Counselor Notes
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-[#3B5BFE] font-semibold">
                  {lead.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Contact: <span className="font-semibold text-slate-700">{lead.phone}</span> | Assigned: <span className="font-semibold text-slate-700">{lead.assignedUserName}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main Notes Editor Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span>Detailed Feedback & Remarks</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Saves directly into lead table and history
              </span>
            </div>
            
            <textarea
              rows={4}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Enter comprehensive counseling feedback, candidate background, objections, fee commitments, or follow-up instructions..."
              className="w-full text-sm font-normal text-slate-800 bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#3B5BFE]/30 focus:border-[#3B5BFE] transition-all resize-y shadow-inner leading-relaxed"
            />
          </div>

          {/* Quick Remarks Chips */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Quick One-Tap Feedback Snippets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAppendChip(chip)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#3B5BFE] hover:border-blue-200 border border-slate-200/60 text-slate-700 font-medium transition-all text-left"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Interaction Type Selector */}
          <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2.5">
              Interaction Channel / Channel Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'counseling' as const, label: 'Counseling', icon: Users },
                { type: 'call' as const, label: 'Phone Call', icon: Phone },
                { type: 'whatsapp' as const, label: 'WhatsApp', icon: MessageCircle },
                { type: 'general' as const, label: 'General Remark', icon: MessageSquare },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = noteType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setNoteType(item.type)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-[#3B5BFE] text-white border-[#3B5BFE] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes History Timeline */}
          {lead.notesHistory && lead.notesHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Previous Interaction History ({lead.notesHistory.length})</span>
                </label>
              </div>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {lead.notesHistory.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3.5 rounded-xl bg-white border border-slate-100 shadow-sm flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <UserIcon className="w-3 h-3 text-slate-400" />
                        <span>{item.author}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] uppercase font-bold text-slate-600">
                          {item.type}
                        </span>
                      </div>
                      <span>{item.timestamp}</span>
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed mt-0.5">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Recorded as <span className="font-semibold text-slate-700">{currentUserName}</span>
          </p>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#3B5BFE] hover:bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Feedback & Notes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
