import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Calendar, 
  Clock, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { User, DPRRecord } from '../../types/crm';

interface DailyDprViewProps {
  currentUser: User;
  allUsers: User[];
  dprRecords: DPRRecord[];
  onOpenUploadModal: (date?: string) => void;
  onNotifyToast: (msg: string) => void;
}

export const DailyDprView: React.FC<DailyDprViewProps> = ({
  currentUser,
  allUsers,
  dprRecords,
  onOpenUploadModal,
  onNotifyToast,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const counselors = allUsers.filter(u => u.status === 'active' && (u.role === 'counselor' || u.role === 'sales_user'));
  
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>(
    isSuperAdmin ? 'all' : currentUser.id
  );
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<DPRRecord | null>(null);

  // Filter records based on selected counselor or role
  const filteredRecords = dprRecords.filter(rec => {
    if (!isSuperAdmin) {
      return rec.counselorId === currentUser.id;
    }
    if (selectedCounselorId === 'all') return true;
    return rec.counselorId === selectedCounselorId;
  });

  const todayStr = '2026-11-08';
  const todayRecord = dprRecords.find(
    r => r.date === todayStr && (isSuperAdmin ? (selectedCounselorId === 'all' ? r.counselorId === 'usr_deepti' : r.counselorId === selectedCounselorId) : r.counselorId === currentUser.id)
  );

  const isTodayPending = !todayRecord || todayRecord.status === 'missing' || todayRecord.status === 'pending_verification';

  // Find yesterday's record for reference
  const yesterdayRecord = dprRecords.find(
    r => r.date === '2026-11-07' && r.counselorId === (isSuperAdmin && selectedCounselorId !== 'all' ? selectedCounselorId : 'usr_deepti')
  );

  return (
    <div className="space-y-6">
      {/* Top Header Bento Card */}
      <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <FileText className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                Daily Performance Report (DPR)
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Sunday, 08 Nov 2026
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Call Logs & Activity Verification
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Upload end-of-day phone call summary screenshots. CorporateAcademy AI automatically extracts 
              11 verified metrics including incoming/outgoing durations, missed calls, and non-pickup counts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isSuperAdmin && (
              <div className="flex items-center gap-2 bg-[#151F35] border border-[#1E2D4A] rounded-xl px-3 py-2">
                <span className="text-xs text-slate-400">Counselor:</span>
                <select
                  value={selectedCounselorId}
                  onChange={(e) => setSelectedCounselorId(e.target.value)}
                  className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#111827] text-white">All Active Counselors</option>
                  {counselors.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#111827] text-white">{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => onOpenUploadModal(todayStr)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20"
            >
              <Upload className="w-4 h-4" />
              Submit Today's DPR
            </button>
          </div>
        </div>
      </div>

      {/* Today's Submission Status Bento Banner */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isTodayPending 
          ? 'bg-amber-500/10 border-amber-500/30' 
          : 'bg-emerald-500/10 border-emerald-500/30'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`p-3 rounded-xl border ${
              isTodayPending
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            }`}>
              {isTodayPending ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">
                  {isTodayPending ? "Today's DPR Status: Action Required (Pending)" : "Today's DPR Confirmed & Verified"}
                </h3>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isTodayPending
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {isTodayPending ? 'Not Submitted' : 'Verified'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isTodayPending
                  ? 'Call log screenshot must be submitted by 18:00 IST for admissions pacing compliance.'
                  : `Successfully extracted and confirmed. Total calls logged: ${todayRecord?.confirmedMetrics.totalCalls} (${todayRecord?.confirmedMetrics.totalDuration}).`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center">
            {isTodayPending ? (
              <button
                onClick={() => onOpenUploadModal(todayStr)}
                className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Upload Screenshot Now
              </button>
            ) : (
              <button
                onClick={() => setSelectedRecordForDetail(todayRecord || null)}
                className="w-full sm:w-auto px-3.5 py-2 bg-[#151F35] hover:bg-[#1E2D4A] text-slate-200 text-xs font-medium rounded-xl border border-[#1E2D4A] transition flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                View Today's DPR Detail
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Yesterday's Reference Card (Exact Reference values from user screenshot) */}
      {yesterdayRecord && (
        <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E2D4A]">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-white">
                  Yesterday's Verified DPR — 07 Nov 2026 ({yesterdayRecord.counselorName})
                </h2>
                <p className="text-xs text-slate-400">
                  Exact OCR Extracted Call Metrics (Verified via mobile screenshot)
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedRecordForDetail(yesterdayRecord)}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition"
            >
              Inspect Proof & Screenshot
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 11 Metrics Bento Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[#151F35] border border-[#1E2D4A] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium block">1. Total Phone Calls</span>
              <span className="text-2xl font-bold text-white mt-1 block">
                {yesterdayRecord.confirmedMetrics.totalCalls}
              </span>
              <span className="text-[10px] text-slate-500">All dialed/received</span>
            </div>

            <div className="bg-[#151F35] border border-[#1E2D4A] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium block">2. Incoming Calls</span>
              <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                {yesterdayRecord.confirmedMetrics.incomingCalls}
              </span>
              <span className="text-[10px] text-slate-500">Duration: {yesterdayRecord.confirmedMetrics.incomingDuration}</span>
            </div>

            <div className="bg-[#151F35] border border-[#1E2D4A] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium block">3. Outgoing Calls</span>
              <span className="text-2xl font-bold text-blue-400 mt-1 block">
                {yesterdayRecord.confirmedMetrics.outgoingCalls}
              </span>
              <span className="text-[10px] text-slate-500">Duration: {yesterdayRecord.confirmedMetrics.outgoingDuration}</span>
            </div>

            <div className="bg-[#151F35] border border-[#1E2D4A] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium block">4. Missed Calls</span>
              <span className="text-2xl font-bold text-amber-400 mt-1 block">
                {yesterdayRecord.confirmedMetrics.missedCalls}
              </span>
              <span className="text-[10px] text-slate-500">Unanswered</span>
            </div>

            <div className="bg-[#151F35] border border-[#1E2D4A] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium block">5. Rejected Calls</span>
              <span className="text-2xl font-bold text-rose-400 mt-1 block">
                {yesterdayRecord.confirmedMetrics.rejectedCalls}
              </span>
              <span className="text-[10px] text-slate-500">Declined</span>
            </div>

            <div className="bg-[#151F35] border border-[#1E2D4A] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium block">6. Never Attended</span>
              <span className="text-2xl font-bold text-purple-400 mt-1 block">
                {yesterdayRecord.confirmedMetrics.neverAttendedCalls}
              </span>
              <span className="text-[10px] text-slate-500">Zero pickup attempt</span>
            </div>

            <div className="bg-[#151F35] border border-[#1E2D4A] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium block">7. Not Pickup (NPU)</span>
              <span className="text-2xl font-bold text-amber-400 mt-1 block">
                {yesterdayRecord.confirmedMetrics.npuCalls}
              </span>
              <span className="text-[10px] text-slate-500">Rung out</span>
            </div>

            <div className="bg-[#151F35] border border-[#1E2D4A] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium block">8. Unique Calls</span>
              <span className="text-2xl font-bold text-indigo-400 mt-1 block">
                {yesterdayRecord.confirmedMetrics.uniqueCalls}
              </span>
              <span className="text-[10px] text-slate-500">Distinct contacts</span>
            </div>

            <div className="bg-[#151F35] border border-[#1E2D4A] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium block">9. Total Duration</span>
              <span className="text-xl font-bold text-white mt-1 block">
                {yesterdayRecord.confirmedMetrics.totalDuration}
              </span>
              <span className="text-[10px] text-emerald-400">Total talk time</span>
            </div>

            <div className="bg-[#151F35] border border-[#1E2D4A] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium block">10. Incoming Dur.</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">
                {yesterdayRecord.confirmedMetrics.incomingDuration}
              </span>
              <span className="text-[10px] text-slate-500">3 calls</span>
            </div>

            <div className="bg-[#151F35] border border-[#1E2D4A] p-3.5 rounded-xl col-span-2 sm:col-span-1 lg:col-span-2">
              <span className="text-[11px] text-slate-400 font-medium block">11. Outgoing Dur.</span>
              <span className="text-xl font-bold text-blue-400 mt-1 block">
                {yesterdayRecord.confirmedMetrics.outgoingDuration}
              </span>
              <span className="text-[10px] text-slate-500">11 calls dialed</span>
            </div>
          </div>
        </div>
      )}

      {/* DPR Submission History Table */}
      <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-white">Daily Performance Reports History</h2>
            <p className="text-xs text-slate-400">
              Audit log of daily screenshots submitted by counselors with OCR confidence scores
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Showing {filteredRecords.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E2D4A] text-slate-400 font-semibold bg-[#151F35]/60">
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Counselor</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-center">Total Calls</th>
                <th className="py-3 px-3.5 text-center">In / Out</th>
                <th className="py-3 px-3.5 text-center">Missed / NPU</th>
                <th className="py-3 px-3.5">Total Duration</th>
                <th className="py-3 px-3.5">Submission Time</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D4A]/60">
              {filteredRecords.map((record) => {
                const isMissing = record.status === 'missing';
                const isVerified = record.status === 'verified';
                const isPending = record.status === 'pending_verification';

                return (
                  <tr 
                    key={record.id}
                    className="hover:bg-[#151F35]/40 transition group"
                  >
                    <td className="py-3.5 px-3.5 font-semibold text-white whitespace-nowrap">
                      {record.date}
                      {record.date === todayStr && (
                        <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                          Today
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3.5 font-medium text-slate-300">
                      {record.counselorName}
                    </td>
                    <td className="py-3.5 px-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        isVerified
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : isPending
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {isVerified && <CheckCircle2 className="w-3 h-3" />}
                        {isPending && <Clock className="w-3 h-3" />}
                        {isMissing && <AlertTriangle className="w-3 h-3" />}
                        {isVerified ? 'Verified' : isPending ? 'Pending OCR' : 'Not Submitted'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 text-center font-bold text-white">
                      {isMissing ? (
                        <span className="text-rose-400 font-semibold">—</span>
                      ) : (
                        record.confirmedMetrics.totalCalls
                      )}
                    </td>
                    <td className="py-3.5 px-3.5 text-center text-slate-300">
                      {isMissing ? (
                        <span className="text-slate-600">—</span>
                      ) : (
                        <span>
                          <span className="text-emerald-400 font-medium">{record.confirmedMetrics.incomingCalls}</span>
                          <span className="text-slate-500 mx-1">/</span>
                          <span className="text-blue-400 font-medium">{record.confirmedMetrics.outgoingCalls}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3.5 text-center text-slate-300">
                      {isMissing ? (
                        <span className="text-slate-600">—</span>
                      ) : (
                        <span>
                          <span className="text-amber-400">{record.confirmedMetrics.missedCalls}</span>
                          <span className="text-slate-500 mx-1">/</span>
                          <span className="text-purple-400">{record.confirmedMetrics.npuCalls}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3.5 text-slate-300 font-mono text-[11px]">
                      {isMissing ? <span className="text-slate-600">—</span> : record.confirmedMetrics.totalDuration}
                    </td>
                    <td className="py-3.5 px-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                      {record.submissionTimestamp 
                        ? new Date(record.submissionTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : <span className="text-rose-400 italic">No entry</span>
                      }
                    </td>
                    <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                      {isMissing ? (
                        <button
                          onClick={() => onOpenUploadModal(record.date)}
                          className="px-2.5 py-1 text-[11px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg border border-amber-500/40 transition font-medium"
                        >
                          Upload Now
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedRecordForDetail(record)}
                          className="px-2.5 py-1 text-[11px] bg-[#151F35] hover:bg-[#1E2D4A] text-slate-300 hover:text-white rounded-lg border border-[#1E2D4A] transition font-medium flex items-center gap-1 inline-flex"
                        >
                          <Eye className="w-3 h-3 text-blue-400" />
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Detail Modal */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2D4A] mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  DPR Details — {selectedRecordForDetail.date}
                </h3>
                <p className="text-xs text-slate-400">
                  Counselor: {selectedRecordForDetail.counselorName} • Submitted:{' '}
                  {selectedRecordForDetail.submissionTimestamp || 'Manual Entry'}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-[#151F35]"
              >
                ✕
              </button>
            </div>

            {/* Proof Screenshot if present */}
            {selectedRecordForDetail.screenshotUrl && (
              <div className="mb-5 bg-[#0B1020] border border-[#1E2D4A] rounded-xl p-3">
                <span className="text-xs text-slate-400 font-semibold mb-2 block flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  Attached Mobile Call Log Screenshot
                </span>
                <div className="relative rounded-lg overflow-hidden border border-[#1E2D4A] max-h-56 flex items-center justify-center bg-black">
                  <img
                    src={selectedRecordForDetail.screenshotUrl}
                    alt="DPR Proof Screenshot"
                    className="max-h-56 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Confirmed Metrics Table */}
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              11 Confirmed Metrics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
              {Object.entries({
                'Total Calls': selectedRecordForDetail.confirmedMetrics.totalCalls,
                'Incoming Calls': selectedRecordForDetail.confirmedMetrics.incomingCalls,
                'Outgoing Calls': selectedRecordForDetail.confirmedMetrics.outgoingCalls,
                'Missed Calls': selectedRecordForDetail.confirmedMetrics.missedCalls,
                'Rejected Calls': selectedRecordForDetail.confirmedMetrics.rejectedCalls,
                'Never Attended': selectedRecordForDetail.confirmedMetrics.neverAttendedCalls,
                'Not Picked (NPU)': selectedRecordForDetail.confirmedMetrics.npuCalls,
                'Unique Contacts': selectedRecordForDetail.confirmedMetrics.uniqueCalls,
                'Total Duration': selectedRecordForDetail.confirmedMetrics.totalDuration,
                'Incoming Duration': selectedRecordForDetail.confirmedMetrics.incomingDuration,
                'Outgoing Duration': selectedRecordForDetail.confirmedMetrics.outgoingDuration,
              }).map(([label, val]) => (
                <div key={label} className="bg-[#151F35] border border-[#1E2D4A] p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">{label}</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">{String(val)}</span>
                </div>
              ))}
            </div>

            {selectedRecordForDetail.notes && (
              <div className="p-3 bg-[#151F35]/60 border border-[#1E2D4A] rounded-xl text-xs text-slate-300 mb-4">
                <span className="font-semibold text-slate-200 block mb-0.5">Notes:</span>
                {selectedRecordForDetail.notes}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[#1E2D4A]">
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="px-4 py-2 bg-[#151F35] hover:bg-[#1E2D4A] text-white text-xs font-semibold rounded-xl border border-[#1E2D4A] transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
