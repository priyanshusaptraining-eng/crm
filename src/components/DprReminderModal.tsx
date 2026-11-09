import React from 'react';
import { User, DPRRecord } from '../types/crm';
import { AlertCircle, Clock, UploadCloud, CheckCircle2, X, FileText, Sparkles } from 'lucide-react';

interface DprReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  todayDate: string;
  todayDprRecord?: DPRRecord;
  onOpenUpload: () => void;
}

export const DprReminderModal: React.FC<DprReminderModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  todayDate,
  todayDprRecord,
  onOpenUpload,
}) => {
  if (!isOpen) return null;

  const isAlreadySubmitted = todayDprRecord && todayDprRecord.status !== 'missing';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#151F35] border border-[#23324E] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 border-b border-[#23324E] flex items-center justify-between ${
          isAlreadySubmitted ? 'bg-emerald-500/10' : 'bg-amber-500/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isAlreadySubmitted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-[#F59E0B]'
            }`}>
              {isAlreadySubmitted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC]">
                {isAlreadySubmitted ? 'DPR Submitted Successfully' : 'Daily DPR Pending'}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Reporting Date: <strong className="text-white">{todayDate}</strong> · Counselor: {currentUser.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#0C1425] hover:bg-[#1E2D4A] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {!isAlreadySubmitted ? (
            <>
              <div className="p-4 rounded-2xl bg-[#0C1425] border border-[#23324E] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F59E0B] flex items-center gap-1.5 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mandatory Daily Performance Report</span>
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Due Today
                  </span>
                </div>
                <p className="text-xs text-[#F8FAFC] font-medium leading-relaxed">
                  "Please upload today's call report screenshot before completing your day."
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Our system will process your screenshot using AI OCR to extract call counts and talk times for your monthly report.
                </p>
              </div>

              {/* Requirements Bento Checklist */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#94A3B8]">
                <div className="p-2.5 rounded-xl bg-[#1B2942]/60 border border-[#23324E] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>JPG, PNG or PDF supported</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#1B2942]/60 border border-[#23324E] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>All 11 metrics extracted</span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-2xl bg-[#0C1425] border border-[#23324E] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Report on Record</span>
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                  Submitted at: {new Date(todayDprRecord.submissionTimestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                <div className="p-2 rounded-xl bg-[#151F35] border border-[#23324E]">
                  <div className="text-[10px] text-[#94A3B8]">Total Calls</div>
                  <div className="text-sm font-bold text-white tabular-nums">{todayDprRecord.confirmedMetrics.totalCalls}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#151F35] border border-[#23324E]">
                  <div className="text-[10px] text-[#94A3B8]">Incoming</div>
                  <div className="text-sm font-bold text-blue-400 tabular-nums">{todayDprRecord.confirmedMetrics.incomingCalls}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#151F35] border border-[#23324E]">
                  <div className="text-[10px] text-[#94A3B8]">Outgoing</div>
                  <div className="text-sm font-bold text-amber-400 tabular-nums">{todayDprRecord.confirmedMetrics.outgoingCalls}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#151F35] border border-[#23324E]">
                  <div className="text-[10px] text-[#94A3B8]">Unique</div>
                  <div className="text-sm font-bold text-emerald-400 tabular-nums">{todayDprRecord.confirmedMetrics.uniqueCalls}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            {!isAlreadySubmitted ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#0C1425] hover:bg-[#1E2D4A] border border-[#23324E] text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
                >
                  Remind Me Later
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUpload();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-black text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Today's DPR</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#F59E0B] text-black text-xs font-bold transition-all shadow-xs"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
