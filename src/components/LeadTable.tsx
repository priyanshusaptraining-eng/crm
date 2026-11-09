import React, { useState, useMemo } from 'react';
import { Lead, User, CallStatus, AdvancedFilterQuery, LeadStatus } from '../types/crm';
import {
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  UserCheck,
  Edit,
  Eye,
  Copy,
  Check,
  ArrowUpDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Video,
  Download,
  GraduationCap,
  FileSpreadsheet,
} from 'lucide-react';
import { AdvancedFilterBar } from './AdvancedFilterBar';
import { LeadMobileCard } from './LeadMobileCard';
import { PhoneActionGroup } from './PhoneActionGroup';

interface LeadTableProps {
  leads: Lead[];
  currentUser: User;
  allUsers: User[];
  onOpenLeadProfile: (lead: Lead) => void;
  onOpenEditModal: (lead: Lead) => void;
  onOpenDemoScheduler: (lead: Lead) => void;
  onOpenAdmissionModal: (lead: Lead) => void;
  onReassignCounselor: (leadId: string, counselorId: string) => void;
  onStatusChange: (leadId: string, status: CallStatus) => void;
  onAddNewLead: () => void;
  onOpenBulkImport?: () => void;
  onLogCall: (leadId: string) => void;
  onInitiateCall?: (lead: Lead) => void;
  onOpenWhatsAppModal?: (lead: Lead) => void;
  onNotifyToast: (msg: string) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  currentUser,
  allUsers,
  onOpenLeadProfile,
  onOpenEditModal,
  onOpenDemoScheduler,
  onOpenAdmissionModal,
  onReassignCounselor,
  onStatusChange,
  onAddNewLead,
  onOpenBulkImport,
  onLogCall,
  onInitiateCall,
  onOpenWhatsAppModal,
  onNotifyToast,
}) => {
  // Advanced Filter Query State
  const [filterQuery, setFilterQuery] = useState<AdvancedFilterQuery>({
    search: '',
    status: [],
    counselorId: currentUser.role === 'super_admin' ? 'all' : currentUser.id,
    datePreset: 'all',
    conditions: [],
    conditionLogic: 'AND',
    notInterestedScope: 'none',
  });

  const [sortField, setSortField] = useState<'name' | 'calls' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered & Sorted Leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // 1. Search Query
        const searchStr = (filterQuery.search || '').trim();
        if (searchStr) {
          const q = searchStr.toLowerCase();
          const matchName = lead.name.toLowerCase().includes(q);
          const matchPhone = lead.phone.toLowerCase().includes(q);
          const matchEmail = lead.email.toLowerCase().includes(q);
          const matchLocation = (lead.location || '').toLowerCase().includes(q);
          const matchCourse = (lead.course || '').toLowerCase().includes(q);
          if (!matchName && !matchPhone && !matchEmail && !matchLocation && !matchCourse) {
            return false;
          }
        }

        // 2. Counselor Filter
        if (filterQuery.counselorId && filterQuery.counselorId !== 'all') {
          if (filterQuery.counselorId === 'unassigned') {
            if (lead.assignedTo) return false;
          } else if (lead.assignedTo !== filterQuery.counselorId) {
            return false;
          }
        }

        // 3. Status Filter (Multi-select)
        const activeStatuses = filterQuery.status || [];
        if (activeStatuses.length > 0) {
          const statusMatch = activeStatuses.some((s) => {
            if (s === 'New Lead') return lead.status === 'new_lead' || lead.status === 'new';
            if (s === 'Demo Scheduled') return lead.status === 'demo_scheduled' || Boolean(lead.demoDetails?.date);
            if (s === 'Demo Attended') return Boolean(lead.demoDetails?.attended);
            if (s === 'Fee Due') return Boolean(lead.paymentDetails && lead.paymentDetails.remainingAmount > 0);
            if (s === 'Admitted') return lead.status === 'admission_joined';
            if (s === 'Lost') return lead.status === 'ni' || lead.status === 'not_interested';
            if (s === 'NPU') return lead.status === 'npu';
            return (lead.status as string) === s;
          });
          if (!statusMatch) return false;
        }

        // 4. Not Interested Scope Filter
        if (filterQuery.notInterestedScope === 'all') {
          if (lead.status !== 'ni' && lead.status !== 'not_interested') return false;
        } else if (filterQuery.notInterestedScope === 'my') {
          if (lead.status !== 'ni' && lead.status !== 'not_interested') return false;
          if (lead.assignedTo !== currentUser.id) return false;
        }

        // 5. Date Filter (Custom or Preset)
        if (filterQuery.datePreset === 'today') {
          if (lead.createdAt && !lead.createdAt.startsWith('2026-11-08')) return false;
        } else if (filterQuery.datePreset === 'yesterday') {
          if (lead.createdAt && !lead.createdAt.startsWith('2026-11-07')) return false;
        } else if (filterQuery.datePreset === 'custom' && (filterQuery.startDate || filterQuery.endDate)) {
          const itemDate = lead.createdAt ? lead.createdAt.slice(0, 10) : '';
          if (filterQuery.startDate && itemDate < filterQuery.startDate) return false;
          if (filterQuery.endDate && itemDate > filterQuery.endDate) return false;
        }

        // 6. Multi-Condition Builder
        if ((filterQuery.conditions || []).length > 0) {
          const evaluateRule = (cond: typeof filterQuery.conditions[0]) => {
            let actualValue: any = '';
            if (cond.field === 'name') actualValue = lead.name;
            else if (cond.field === 'location') actualValue = lead.location || '';
            else if (cond.field === 'course') actualValue = lead.course || '';
            else if (cond.field === 'fee') actualValue = lead.dealValue || lead.revenue || 0;
            else if (cond.field === 'source') actualValue = lead.source || '';
            else if (cond.field === 'counselor') actualValue = lead.assignedUserName || '';

            const targetVal = cond.value.trim().toLowerCase();
            if (!targetVal) return true;

            if (cond.operator === 'contains') {
              return String(actualValue).toLowerCase().includes(targetVal);
            }
            if (cond.operator === 'equals') {
              return String(actualValue).toLowerCase() === targetVal;
            }
            if (cond.operator === 'greater_than') {
              return Number(actualValue) > Number(targetVal);
            }
            if (cond.operator === 'less_than') {
              return Number(actualValue) < Number(targetVal);
            }
            return true;
          };

          if (filterQuery.conditionLogic === 'AND') {
            const allPass = (filterQuery.conditions || []).every(evaluateRule);
            if (!allPass) return false;
          } else {
            const anyPass = (filterQuery.conditions || []).some(evaluateRule);
            if (!anyPass) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a.createdAt;
        let valB: any = b.createdAt;

        if (sortField === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortField === 'calls') {
          valA = a.callsCount || a.callsMade || 0;
          valB = b.callsCount || b.callsMade || 0;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [leads, filterQuery, sortField, sortDirection, currentUser]);

  // Paginated leads
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Copy ONLY email address
  const handleCopyEmail = (email: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      navigator.clipboard.writeText(email);
    } catch {
      const el = document.createElement('textarea');
      el.value = email;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedEmailId(id);
    onNotifyToast(`Copied email: ${email}`);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  const getStatusBadge = (status: CallStatus) => {
    switch (status) {
      case 'new_lead':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">New Lead</span>;
      case 'interested':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">Interested</span>;
      case 'call_later':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">Call Later</span>;
      case 'demo_scheduled':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">Demo Scheduled</span>;
      case 'npu':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">NPU (No Pickup)</span>;
      case 'ni':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">Not Interested</span>;
      case 'admission_joined':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Admitted</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">{status}</span>;
    }
  };

  const handleExportCSV = () => {
    const headers = ['Candidate Name', 'Location', 'Phone', 'Email', 'Course', 'Source', 'Status', 'Counselor'];
    const rows = filteredLeads.map((l) => [
      `"${l.name}"`,
      `"${l.location || ''}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.course || ''}"`,
      `"${l.source || ''}"`,
      `"${l.status}"`,
      `"${l.assignedUserName}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CorporateAcademy_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotifyToast('Exported leads to CSV');
  };

  return (
    <div className="space-y-4">
      {/* 1. Advanced Multi-Condition Filter Bar */}
      <AdvancedFilterBar
        currentUser={currentUser}
        allUsers={allUsers}
        filterQuery={filterQuery}
        onFilterChange={(q) => {
          setFilterQuery(q);
          setCurrentPage(1);
        }}
        onResetFilters={() => {
          setFilterQuery({
            search: '',
            status: [],
            counselorId: currentUser.role === 'super_admin' ? 'all' : currentUser.id,
            datePreset: 'all',
            conditions: [],
            conditionLogic: 'AND',
            notInterestedScope: 'none',
          });
          setCurrentPage(1);
        }}
        totalResultsCount={filteredLeads.length}
      />

      {/* 2. Top Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">
            Page {currentPage} of {totalPages} ({filteredLeads.length} Total Matches)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151F35] hover:bg-[#1E2D4A] border border-[#1E2D4A] text-xs font-semibold text-slate-300 hover:text-white transition shadow"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {onOpenBulkImport && (
            <button
              type="button"
              onClick={onOpenBulkImport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition shadow-sm active:scale-95"
              title="Bulk import 100, 200, 500+ leads directly from Excel clipboard"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Bulk Excel Import</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAddNewLead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Lead</span>
          </button>
        </div>
      </div>

      {/* 3. Mobile Card View (< 768px): Dedicated Clean Bento Cards */}
      <div className="md:hidden space-y-3">
        {paginatedLeads.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs bg-[#111827] rounded-2xl border border-[#1E2D4A] p-6">
            No candidate leads match your active filters. Try clearing filter rules.
          </div>
        ) : (
          paginatedLeads.map((lead) => (
            <LeadMobileCard
              key={lead.id}
              lead={lead}
              currentUser={currentUser}
              onOpenLeadProfile={onOpenLeadProfile}
              onOpenEditModal={onOpenEditModal}
              onOpenDemoScheduler={onOpenDemoScheduler}
              onInitiateCall={(targetLead) => {
                if (onInitiateCall) onInitiateCall(targetLead);
              }}
              onOpenWhatsAppModal={(targetLead) => {
                if (onOpenWhatsAppModal) onOpenWhatsAppModal(targetLead);
              }}
              onNotifyToast={onNotifyToast}
            />
          ))
        )}
      </div>

      {/* 4. Desktop Bento Table View (>= 768px): 9 Columns with One-Tap Actions */}
      <div className="hidden md:flex flex-col rounded-2xl bg-[#111827] border border-[#1E2D4A] shadow-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="border-b border-[#1E2D4A] bg-[#151F35]/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-[170px]">
                  <button
                    type="button"
                    onClick={() => {
                      setSortField('name');
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <span>Candidate Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 w-[120px]">Location</th>
                <th className="py-3 px-3 w-[220px]">Phone & WhatsApp</th>
                <th className="py-3 px-3 w-[170px]">Email Address</th>
                <th className="py-3 px-3 w-[140px]">Lead Status</th>
                <th className="py-3 px-4 w-[210px]">Feedback & History</th>
                <th className="py-3 px-3 w-[130px]">Demo Schedule</th>
                <th className="py-3 px-3 w-[140px]">Counselor</th>
                <th className="py-3 px-4 w-[130px] text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1E2D4A]/60 text-xs">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                    No candidate leads match your active filters. Try clearing filter rules.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const latestNote = lead.notesHistory?.[0]?.text || lead.feedback;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-[#151F35]/40 transition group"
                    >
                      {/* 1. Candidate Name */}
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <button
                          type="button"
                          onClick={() => onOpenLeadProfile(lead)}
                          className="text-left hover:text-amber-400 hover:underline flex items-center gap-1.5 transition-colors"
                        >
                          <span className="truncate max-w-[150px]">{lead.name}</span>
                        </button>
                      </td>

                      {/* 2. Location */}
                      <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{lead.location || '—'}</span>
                        </div>
                      </td>

                      {/* 3. Phone & WhatsApp - Click-to-dial & WhatsApp */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
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
                      </td>

                      {/* 4. Email Address - Copies ONLY Email Address */}
                      <td className="py-3.5 px-3 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleCopyEmail(lead.email, lead.id, e)}
                            className="text-slate-300 hover:text-amber-400 transition-colors truncate max-w-[135px] block text-left"
                            title="Click to copy email address only"
                          >
                            {lead.email}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleCopyEmail(lead.email, lead.id, e)}
                            className="text-slate-500 hover:text-amber-400 transition-colors p-1 rounded hover:bg-[#151F35] shrink-0"
                            title="Copy email address"
                          >
                            {copiedEmailId === lead.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* 5. Lead Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getStatusBadge(lead.status)}
                      </td>

                      {/* 6. Feedback & Notes */}
                      <td className="py-3.5 px-4 text-xs text-slate-300">
                        <button
                          type="button"
                          onClick={() => onOpenLeadProfile(lead)}
                          className="text-left hover:text-white transition-colors block w-full"
                          title={latestNote}
                        >
                          <p className="line-clamp-1 max-w-[200px]">
                            {latestNote || 'No notes logged yet.'}
                          </p>
                        </button>
                      </td>

                      {/* 7. Demo / Meeting Schedule */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-300">
                        {lead.demoDetails ? (
                          <div className="flex flex-col tabular-nums leading-tight">
                            <span className="font-semibold text-amber-400">
                              {lead.demoDetails.date}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {lead.demoDetails.time} ({lead.demoDetails.webinarTopic || 'Google Meet'})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* 8. Assigned Counselor */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-200">
                          {lead.assignedUserName || 'Unassigned'}
                        </span>
                      </td>

                      {/* 9. Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenEditModal(lead)}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-[#151F35] hover:bg-[#1E2D4A] rounded-lg border border-[#1E2D4A] transition"
                            title="Edit Lead Details"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenDemoScheduler(lead)}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition shadow-xs"
                            title="Schedule or Join Demo"
                          >
                            Demo
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

      {/* 5. Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-3.5 rounded-2xl border border-[#1E2D4A] bg-[#111827] flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px] sm:text-xs">
            {(currentPage - 1) * pageSize + 1}–{Math.min(filteredLeads.length, currentPage * pageSize)} of {filteredLeads.length} candidates
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-[#1E2D4A] text-slate-400 hover:text-white disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white font-semibold px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-[#1E2D4A] text-slate-400 hover:text-white disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
