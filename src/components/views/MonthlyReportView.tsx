import React, { useState } from 'react';
import { 
  CalendarDays, 
  Download, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Search, 
  ChevronRight,
  Sparkles,
  PhoneCall,
  Clock,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { User, DPRRecord } from '../../types/crm';

interface MonthlyReportViewProps {
  currentUser: User;
  allUsers: User[];
  dprRecords: DPRRecord[];
  onOpenUploadModal: (date?: string) => void;
  onNotifyToast: (msg: string) => void;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  currentUser,
  allUsers,
  dprRecords,
  onOpenUploadModal,
  onNotifyToast,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const counselors = allUsers.filter(u => u.status === 'active' && (u.role === 'counselor' || u.role === 'sales_user'));
  
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>(
    isSuperAdmin ? 'usr_deepti' : currentUser.id
  );
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [selectedRecordForDrawer, setSelectedRecordForDrawer] = useState<DPRRecord | null>(null);

  // Generate all 30 days of November 2026
  const daysInMonth = Array.from({ length: 30 }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    return `2026-11-${day}`;
  });

  // Current effective counselor
  const effectiveCounselor = allUsers.find(u => u.id === selectedCounselorId) || counselors[0];

  // Map each day of the month to a record or an unsubmitted day
  const monthData = daysInMonth.map((dateStr) => {
    const existing = dprRecords.find(
      r => r.date === dateStr && r.counselorId === selectedCounselorId
    );

    const isFuture = dateStr > '2026-11-08';

    if (existing) {
      return {
        date: dateStr,
        record: existing,
        status: existing.status,
        isFuture,
      };
    }

    return {
      date: dateStr,
      record: null,
      status: isFuture ? 'upcoming' : 'missing',
      isFuture,
    };
  });

  // Calculate monthly summaries
  const submittedDays = monthData.filter(d => d.record && d.record.status === 'verified');
  const missingDays = monthData.filter(d => !d.isFuture && d.status === 'missing');
  const totalCalls = submittedDays.reduce((acc, d) => acc + (d.record?.confirmedMetrics.totalCalls || 0), 0);
  const avgCalls = submittedDays.length > 0 ? Math.round(totalCalls / submittedDays.length) : 0;
  const complianceRate = Math.round((submittedDays.length / (submittedDays.length + missingDays.length || 1)) * 100);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Counselor',
      'Status',
      'Total Calls',
      'Incoming Calls',
      'Outgoing Calls',
      'Missed Calls',
      'Rejected Calls',
      'Never Attended',
      'NPU Calls',
      'Unique Calls',
      'Total Duration',
      'Incoming Duration',
      'Outgoing Duration',
      'Submission Timestamp',
    ];

    const rows = monthData.map((d) => {
      if (d.record && d.record.status === 'verified') {
        const m = d.record.confirmedMetrics;
        return [
          d.date,
          d.record.counselorName,
          'Confirmed / Verified',
          m.totalCalls,
          m.incomingCalls,
          m.outgoingCalls,
          m.missedCalls,
          m.rejectedCalls,
          m.neverAttendedCalls,
          m.npuCalls,
          m.uniqueCalls,
          `"${m.totalDuration}"`,
          `"${m.incomingDuration}"`,
          `"${m.outgoingDuration}"`,
          d.record.submissionTimestamp || 'N/A',
        ];
      } else {
        return [
          d.date,
          effectiveCounselor?.name || 'Counselor',
          d.isFuture ? 'Upcoming Day' : 'Not Submitted',
          'N/A',
          'N/A',
          'N/A',
          'N/A',
          'N/A',
          'N/A',
          'N/A',
          'N/A',
          'N/A',
          'N/A',
          'N/A',
          'N/A',
        ];
      }
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CorporateAcademy_DPR_Monthly_Report_${selectedMonth}_${effectiveCounselor?.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotifyToast('Monthly DPR report exported successfully as CSV/Excel.');
  };

  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <CalendarDays className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                Monthly Performance Ledger
              </span>
              <span className="text-xs text-slate-400">November 2026 (01 Nov – 30 Nov)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Day-Wise Calling Compliance & OCR Report
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Complete calendar breakdown of phone call activity. Unsubmitted days are highlighted as 
              <span className="text-rose-400 font-semibold mx-1">"Not Submitted"</span>
              and never zeroed out.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isSuperAdmin && (
              <div className="flex items-center gap-2 bg-[#151F35] border border-[#1E2D4A] rounded-xl px-3 py-2">
                <span className="text-xs text-slate-400">Counselor:</span>
                <select
                  value={selectedCounselorId}
                  onChange={(e) => setSelectedCounselorId(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                >
                  {counselors.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#111827] text-white">
                      {c.name} ({c.designation || 'Counselor'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#151F35] hover:bg-[#1E2D4A] border border-[#1E2D4A] transition shadow"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Export to Excel / CSV
            </button>
          </div>
        </div>
      </div>

      {/* Bento Monthly KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-[#1E2D4A] p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium block">Total Calls Logged</span>
          <span className="text-2xl font-bold text-white mt-1 block">{totalCalls} calls</span>
          <span className="text-[11px] text-emerald-400 mt-1 block">Across {submittedDays.length} submitted days</span>
        </div>

        <div className="bg-[#111827] border border-[#1E2D4A] p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium block">Daily Average</span>
          <span className="text-2xl font-bold text-blue-400 mt-1 block">{avgCalls} calls/day</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Target: 45 calls/day</span>
        </div>

        <div className="bg-[#111827] border border-[#1E2D4A] p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium block">Missing DPRs</span>
          <span className={`text-2xl font-bold mt-1 block ${missingDays.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {missingDays.length} Days
          </span>
          <span className="text-[11px] text-rose-400/80 mt-1 block">Pending screenshot submission</span>
        </div>

        <div className="bg-[#111827] border border-[#1E2D4A] p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium block">DPR Compliance Rate</span>
          <span className="text-2xl font-bold text-amber-400 mt-1 block">{complianceRate}%</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Monthly pacing index</span>
        </div>
      </div>

      {/* Day-Wise Table */}
      <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-[#1E2D4A]">
          <div>
            <h2 className="text-base font-bold text-white">November 2026 Calendar Calling Table</h2>
            <p className="text-xs text-slate-400">
              Complete audit of every calendar day for {effectiveCounselor?.name}. Click any row to inspect original screenshot & OCR data.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Verified ({submittedDays.length})
            </span>
            <span className="flex items-center gap-1.5 text-rose-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Not Submitted ({missingDays.length})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E2D4A] text-slate-400 font-semibold bg-[#151F35]/60">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-2.5 text-center">Total</th>
                <th className="py-3 px-2.5 text-center">In</th>
                <th className="py-3 px-2.5 text-center">Out</th>
                <th className="py-3 px-2.5 text-center">Missed</th>
                <th className="py-3 px-2.5 text-center">Rejected</th>
                <th className="py-3 px-2.5 text-center">Never Att.</th>
                <th className="py-3 px-2.5 text-center">NPU</th>
                <th className="py-3 px-2.5 text-center">Unique</th>
                <th className="py-3 px-3">Total Duration</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D4A]/60 font-mono text-[11px]">
              {monthData.map(({ date, record, status, isFuture }) => {
                const isVerified = record && record.status === 'verified';
                const isPending = record && record.status === 'pending_verification';
                const isMissing = status === 'missing' && !isFuture;

                return (
                  <tr 
                    key={date}
                    className={`hover:bg-[#151F35]/40 transition ${
                      date === '2026-11-08' ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-sans font-semibold text-white whitespace-nowrap">
                      {date}
                      {date === '2026-11-08' && (
                        <span className="ml-1.5 font-mono text-[10px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded border border-amber-500/30">
                          Today
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-sans">
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Verified
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          <Clock className="w-2.5 h-2.5" />
                          Pending OCR
                        </span>
                      )}
                      {isMissing && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/40 font-sans">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Not Submitted
                        </span>
                      )}
                      {isFuture && (
                        <span className="text-[10px] text-slate-500 font-sans">
                          Upcoming
                        </span>
                      )}
                    </td>

                    {/* Total Calls */}
                    <td className="py-3 px-2.5 text-center font-bold font-sans">
                      {record ? (
                        <span className="text-white text-xs">{record.confirmedMetrics.totalCalls}</span>
                      ) : (
                        <span className={isMissing ? "text-rose-400 font-bold font-sans" : "text-slate-600"}>
                          {isMissing ? "Not Submitted" : "—"}
                        </span>
                      )}
                    </td>

                    {/* Incoming Calls */}
                    <td className="py-3 px-2.5 text-center">
                      {record ? (
                        <span className="text-emerald-400">{record.confirmedMetrics.incomingCalls}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Outgoing Calls */}
                    <td className="py-3 px-2.5 text-center">
                      {record ? (
                        <span className="text-blue-400">{record.confirmedMetrics.outgoingCalls}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Missed Calls */}
                    <td className="py-3 px-2.5 text-center">
                      {record ? (
                        <span className="text-amber-400">{record.confirmedMetrics.missedCalls}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Rejected Calls */}
                    <td className="py-3 px-2.5 text-center">
                      {record ? (
                        <span className="text-rose-400">{record.confirmedMetrics.rejectedCalls}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Never Attended */}
                    <td className="py-3 px-2.5 text-center">
                      {record ? (
                        <span className="text-purple-400">{record.confirmedMetrics.neverAttendedCalls}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Not Picked (NPU) */}
                    <td className="py-3 px-2.5 text-center">
                      {record ? (
                        <span className="text-amber-400">{record.confirmedMetrics.npuCalls}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Unique Calls */}
                    <td className="py-3 px-2.5 text-center">
                      {record ? (
                        <span className="text-indigo-400">{record.confirmedMetrics.uniqueCalls}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Total Duration */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {record ? (
                        <span className="text-slate-200">{record.confirmedMetrics.totalDuration}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right font-sans whitespace-nowrap">
                      {record ? (
                        <button
                          onClick={() => setSelectedRecordForDrawer(record)}
                          className="px-2.5 py-1 text-[11px] bg-[#151F35] hover:bg-[#1E2D4A] text-slate-300 hover:text-white rounded-lg border border-[#1E2D4A] transition flex items-center gap-1 inline-flex"
                        >
                          <Eye className="w-3 h-3 text-blue-400" />
                          Inspect Proof
                        </button>
                      ) : isMissing ? (
                        <button
                          onClick={() => onOpenUploadModal(date)}
                          className="px-2.5 py-1 text-[11px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg border border-amber-500/40 transition font-medium"
                        >
                          Submit DPR
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Inspection Drawer */}
      {selectedRecordForDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="bg-[#111827] border-l border-[#1E2D4A] w-full max-w-xl h-full overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2D4A]">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-400" />
                  DPR Proof & Verification — {selectedRecordForDrawer.date}
                </h3>
                <p className="text-xs text-slate-400">
                  Counselor: {selectedRecordForDrawer.counselorName} • Status: {selectedRecordForDrawer.status.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecordForDrawer(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-[#151F35]"
              >
                ✕
              </button>
            </div>

            {/* Proof Screenshot */}
            {selectedRecordForDrawer.screenshotUrl ? (
              <div className="bg-[#0B1020] border border-[#1E2D4A] rounded-2xl p-4">
                <span className="text-xs font-semibold text-slate-300 mb-2 block flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  Original Mobile Screenshot Proof
                </span>
                <div className="rounded-xl overflow-hidden border border-[#1E2D4A] bg-black flex items-center justify-center">
                  <img
                    src={selectedRecordForDrawer.screenshotUrl}
                    alt="Proof"
                    className="max-h-72 object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#151F35]/50 border border-[#1E2D4A] rounded-2xl text-xs text-slate-400 text-center">
                Manual entry without image attachment
              </div>
            )}

            {/* Side-by-side OCR vs Confirmed Table */}
            <div className="bg-[#151F35] border border-[#1E2D4A] rounded-2xl p-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                OCR Extracted vs Confirmed Metrics
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#1E2D4A] text-slate-400 pb-2">
                      <th className="pb-2">Metric</th>
                      <th className="pb-2 text-center text-blue-400">OCR Extracted</th>
                      <th className="pb-2 text-center text-emerald-400">Confirmed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2D4A]/50">
                    {[
                      ['1. Total Calls', selectedRecordForDrawer.ocrRawMetrics.totalCalls, selectedRecordForDrawer.confirmedMetrics.totalCalls],
                      ['2. Incoming Calls', selectedRecordForDrawer.ocrRawMetrics.incomingCalls, selectedRecordForDrawer.confirmedMetrics.incomingCalls],
                      ['3. Outgoing Calls', selectedRecordForDrawer.ocrRawMetrics.outgoingCalls, selectedRecordForDrawer.confirmedMetrics.outgoingCalls],
                      ['4. Missed Calls', selectedRecordForDrawer.ocrRawMetrics.missedCalls, selectedRecordForDrawer.confirmedMetrics.missedCalls],
                      ['5. Rejected Calls', selectedRecordForDrawer.ocrRawMetrics.rejectedCalls, selectedRecordForDrawer.confirmedMetrics.rejectedCalls],
                      ['6. Never Attended', selectedRecordForDrawer.ocrRawMetrics.neverAttendedCalls, selectedRecordForDrawer.confirmedMetrics.neverAttendedCalls],
                      ['7. Not Picked (NPU)', selectedRecordForDrawer.ocrRawMetrics.npuCalls, selectedRecordForDrawer.confirmedMetrics.npuCalls],
                      ['8. Unique Calls', selectedRecordForDrawer.ocrRawMetrics.uniqueCalls, selectedRecordForDrawer.confirmedMetrics.uniqueCalls],
                      ['9. Total Duration', selectedRecordForDrawer.ocrRawMetrics.totalDuration, selectedRecordForDrawer.confirmedMetrics.totalDuration],
                      ['10. Incoming Dur.', selectedRecordForDrawer.ocrRawMetrics.incomingDuration, selectedRecordForDrawer.confirmedMetrics.incomingDuration],
                      ['11. Outgoing Dur.', selectedRecordForDrawer.ocrRawMetrics.outgoingDuration, selectedRecordForDrawer.confirmedMetrics.outgoingDuration],
                    ].map(([label, ocrVal, confVal]) => (
                      <tr key={String(label)} className="py-2">
                        <td className="py-2 text-slate-300 font-medium">{label}</td>
                        <td className="py-2 text-center text-slate-400 font-mono">{String(ocrVal)}</td>
                        <td className="py-2 text-center text-white font-mono font-bold">{String(confVal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedRecordForDrawer.correctionHistory && selectedRecordForDrawer.correctionHistory.length > 0 && (
              <div className="bg-[#151F35] border border-[#1E2D4A] rounded-2xl p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Manual Adjustments History
                </h4>
                <div className="space-y-2">
                  {selectedRecordForDrawer.correctionHistory.map((item) => (
                    <div key={item.id} className="text-xs bg-[#111827] p-2.5 rounded-xl border border-[#1E2D4A]">
                      <span className="font-semibold text-white">Call Metrics Adjustment:</span>{' '}
                      <span className="text-rose-400 line-through">Total: {item.previousMetrics?.totalCalls}</span>{' '}
                      → <span className="text-emerald-400 font-bold">Total: {item.updatedMetrics?.totalCalls}</span>
                      <p className="text-[11px] text-slate-400 mt-1 italic">"{item.reason}" • {item.modifiedBy}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedRecordForDrawer(null)}
              className="w-full py-2.5 bg-[#151F35] hover:bg-[#1E2D4A] text-white font-semibold text-xs rounded-xl border border-[#1E2D4A] transition"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
