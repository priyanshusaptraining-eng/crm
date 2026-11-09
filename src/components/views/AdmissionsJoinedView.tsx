import React, { useState } from 'react';
import { Lead, User } from '../../types/crm';
import { 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  Receipt, 
  Calendar, 
  Search, 
  Download, 
  CreditCard,
  Building,
  UserCheck
} from 'lucide-react';

interface AdmissionsJoinedViewProps {
  leads: Lead[];
  currentUser: User;
  onOpenPaymentModal: (lead: Lead) => void;
}

export const AdmissionsJoinedView: React.FC<AdmissionsJoinedViewProps> = ({
  leads,
  currentUser,
  onOpenPaymentModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'full' | 'token'>('all');
  const isSuperAdmin = currentUser.role === 'super_admin';

  // Filter leads that have admission_joined status or fee payment details
  const scopedLeads = leads.filter((l) => {
    if (!isSuperAdmin && l.assignedTo !== currentUser.id) return false;
    return l.status === 'admission_joined' || (l.paymentDetails && l.paymentDetails.amountPaid > 0);
  });

  const filteredLeads = scopedLeads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm) ||
      (l.paymentDetails?.receiptNumber && l.paymentDetails.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.paymentDetails?.courseBatch && l.paymentDetails.courseBatch.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.course && l.course.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === 'full') {
      return l.paymentDetails && !l.paymentDetails.isRegistrationOnly && l.paymentDetails.remainingAmount === 0;
    }
    if (filterMode === 'token') {
      return l.paymentDetails?.isRegistrationOnly || (l.paymentDetails && l.paymentDetails.remainingAmount > 0);
    }
    return true;
  });

  const totalCollected = scopedLeads.reduce((acc, l) => acc + (l.paymentDetails?.amountPaid || 0), 0);
  const totalPendingBalance = scopedLeads.reduce((acc, l) => acc + (l.paymentDetails?.remainingAmount || 0), 0);
  const totalDealValue = scopedLeads.reduce((acc, l) => acc + (l.paymentDetails?.totalCourseFee || l.dealValue || 0), 0);
  const fullyPaidCount = scopedLeads.filter((l) => l.paymentDetails && !l.paymentDetails.isRegistrationOnly && l.paymentDetails.remainingAmount === 0).length;
  const tokenOnlyCount = scopedLeads.filter((l) => l.paymentDetails?.isRegistrationOnly).length;

  const handleExportCSV = () => {
    const headers = ['Receipt No', 'Student Name', 'Phone', 'Course Batch', 'Total Tuition', 'Paid Amount', 'Pending Due', 'Payment Date', 'Counselor'];
    const rows = filteredLeads.map((l) => [
      l.paymentDetails?.receiptNumber || 'N/A',
      `"${l.name}"`,
      `"${l.phone}"`,
      `"${l.paymentDetails?.courseBatch || l.course || 'SAP Batch'}"`,
      l.paymentDetails?.totalCourseFee || l.dealValue || 0,
      l.paymentDetails?.amountPaid || 0,
      l.paymentDetails?.remainingAmount || 0,
      l.paymentDetails?.paymentDate || '2026-11-06',
      `"${l.assignedUserName}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `admissions_joined_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--crm-surface)] border border-[var(--crm-border)] p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--crm-text)] tracking-tight">
              Admissions Joined & Enrollment Ledger
            </h2>
            <p className="text-xs text-[var(--crm-text-secondary)] mt-0.5">
              {isSuperAdmin
                ? 'Official academy tuition ledger, confirmed batch allotments, and fee reconciliation'
                : `Confirmed student enrollments attributed to ${currentUser.name}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="text-xs px-3.5 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] hover:border-[var(--crm-primary)] text-[var(--crm-text)] font-semibold transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] p-4 rounded-2xl relative overflow-hidden">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
            Total Collected Tuition
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight mt-1 tabular-nums">
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            Realized cash inflow across {scopedLeads.length} students
          </div>
        </div>

        <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] p-4 rounded-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)] flex items-center justify-between">
            <span>Pending Installments</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight mt-1 tabular-nums">
            ₹{totalPendingBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            Remaining balance scheduled across {tokenOnlyCount} tokens
          </div>
        </div>

        <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] p-4 rounded-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
            Fully Paid Clearances
          </div>
          <div className="text-2xl font-bold text-[var(--crm-primary)] tracking-tight mt-1 tabular-nums">
            {fullyPaidCount}
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            100% course tuition settled up front
          </div>
        </div>

        <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] p-4 rounded-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
            Total Enrolled Value
          </div>
          <div className="text-2xl font-bold text-[var(--crm-text)] tracking-tight mt-1 tabular-nums">
            ₹{totalDealValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            Gross tuition commitment value
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--crm-surface)] border border-[var(--crm-border)] p-3 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-secondary)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student, receipt, or batch..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] placeholder-[var(--crm-text-secondary)] outline-none focus:border-[var(--crm-primary)]"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
              filterMode === 'all'
                ? 'bg-[var(--crm-primary)] text-white'
                : 'bg-[var(--crm-input)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text)]'
            }`}
          >
            All Enrollments ({scopedLeads.length})
          </button>
          <button
            onClick={() => setFilterMode('full')}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
              filterMode === 'full'
                ? 'bg-emerald-600 text-white'
                : 'bg-[var(--crm-input)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text)]'
            }`}
          >
            Fully Paid ({fullyPaidCount})
          </button>
          <button
            onClick={() => setFilterMode('token')}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
              filterMode === 'token'
                ? 'bg-amber-600 text-white'
                : 'bg-[var(--crm-input)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text)]'
            }`}
          >
            Installments Pending ({tokenOnlyCount})
          </button>
        </div>
      </div>

      {/* Admissions Table */}
      <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--crm-input)] border-b border-[var(--crm-border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
                <th className="py-3 px-4">Receipt / Batch</th>
                <th className="py-3 px-4">Student Candidate</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4 text-right">Total Tuition</th>
                <th className="py-3 px-4 text-right">Paid Amount</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Counselor</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--crm-border)] text-[var(--crm-text)]">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-[var(--crm-text-secondary)]">
                    No confirmed admissions matching the current filter.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const pay = lead.paymentDetails;
                  const isFullyPaid = pay && !pay.isRegistrationOnly && (pay.remainingAmount || 0) === 0;

                  return (
                    <tr key={lead.id} className="hover:bg-[var(--crm-elevated)] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs font-semibold text-[var(--crm-primary)]">
                          {pay?.receiptNumber || `RCPT-${lead.id.slice(0, 5)}`}
                        </div>
                        <div className="text-[10px] text-[var(--crm-text-secondary)] mt-0.5">
                          {pay?.courseBatch || lead.course || 'SAP Global Track'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--crm-text)]">{lead.name}</div>
                        <div className="text-[10px] text-[var(--crm-text-secondary)]">{lead.location}</div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[var(--crm-text-secondary)]">
                        {lead.phone}
                      </td>

                      <td className="py-3 px-4 text-right font-medium tabular-nums">
                        ₹{(pay?.totalCourseFee || lead.dealValue || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-emerald-400 tabular-nums">
                        ₹{(pay?.amountPaid || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right tabular-nums">
                        {isFullyPaid ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                            Clear
                          </span>
                        ) : (
                          <span className="font-bold text-amber-400">
                            ₹{(pay?.remainingAmount || 0).toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[11px] text-[var(--crm-text-secondary)]">
                        {isFullyPaid ? 'Settled' : pay?.nextDueDate || 'Pending Schedule'}
                      </td>

                      <td className="py-3 px-4 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)]">
                          {lead.assignedUserName}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onOpenPaymentModal(lead)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-[var(--crm-input)] hover:bg-[var(--crm-primary)] hover:text-white text-[var(--crm-text)] transition-colors border border-[var(--crm-border)]"
                        >
                          Update Fee
                        </button>
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
