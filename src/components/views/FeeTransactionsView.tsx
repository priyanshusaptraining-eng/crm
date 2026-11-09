import React, { useState } from 'react';
import { Lead, User } from '../../types/crm';
import { CreditCard, ArrowDownRight, Search, ShieldCheck, Download, Calendar, CheckCircle2 } from 'lucide-react';

interface FeeTransactionsViewProps {
  leads: Lead[];
  currentUser: User;
}

export const FeeTransactionsView: React.FC<FeeTransactionsViewProps> = ({ leads, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const isSuperAdmin = currentUser.role === 'super_admin';

  // Filter leads that have payment details recorded
  const scopedLeads = leads.filter((l) => {
    if (!isSuperAdmin && l.assignedTo !== currentUser.id) return false;
    return l.paymentDetails && l.paymentDetails.amountPaid > 0;
  });

  const transactions = scopedLeads
    .map((l) => ({
      id: l.paymentDetails?.receiptNumber || `REC-${l.id.toUpperCase()}`,
      leadId: l.id,
      studentName: l.name,
      phone: l.phone,
      amount: l.paymentDetails?.amountPaid || 0,
      totalFee: l.paymentDetails?.totalCourseFee || l.dealValue,
      isToken: l.paymentDetails?.isRegistrationOnly || false,
      date: l.paymentDetails?.paymentDate || l.createdAt.slice(0, 10),
      mode: l.paymentDetails?.paymentMode || 'UPI',
      batch: l.paymentDetails?.courseBatch || l.course || 'Batch FS-2026A',
      counselor: l.assignedUserName,
      counselorId: l.assignedTo,
    }))
    .filter((tx) => {
      const matchesSearch =
        tx.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.phone.includes(searchTerm);
      const matchesMode = modeFilter === 'all' || tx.mode === modeFilter;
      return matchesSearch && matchesMode;
    });

  const totalCollected = transactions.reduce((acc, t) => acc + t.amount, 0);
  const upiTotal = transactions.filter((t) => t.mode === 'UPI').reduce((acc, t) => acc + t.amount, 0);
  const netBankingTotal = transactions.filter((t) => t.mode === 'NetBanking').reduce((acc, t) => acc + t.amount, 0);

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Student', 'Phone', 'Amount Paid', 'Course Batch', 'Payment Mode', 'Date', 'Counselor'];
    const rows = transactions.map((t) => [
      t.id,
      `"${t.studentName}"`,
      `"${t.phone}"`,
      t.amount,
      `"${t.batch}"`,
      t.mode,
      t.date,
      `"${t.counselor}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fee_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--crm-surface)] border border-[var(--crm-border)] p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--crm-primary)]/10 text-[var(--crm-primary)] flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--crm-text)] tracking-tight">
              Fee Transactions & Receipts Ledger
            </h2>
            <p className="text-xs text-[var(--crm-text-secondary)] mt-0.5">
              {isSuperAdmin
                ? 'Master cash register: all verified payments across all counselors'
                : `Personal collected payments ledger for counselor ${currentUser.name}`}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] p-4 rounded-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)] flex items-center justify-between">
            <span>Total Realized Collections</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight mt-1 tabular-nums">
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            Across {transactions.length} verified payment settlements
          </div>
        </div>

        <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] p-4 rounded-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
            UPI Instant Transfers
          </div>
          <div className="text-2xl font-bold text-[var(--crm-text)] tracking-tight mt-1 tabular-nums">
            ₹{upiTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            Real-time digital payment receipts
          </div>
        </div>

        <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] p-4 rounded-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
            Bank Transfers & NEFT
          </div>
          <div className="text-2xl font-bold text-[var(--crm-primary)] tracking-tight mt-1 tabular-nums">
            ₹{netBankingTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            Direct institutional bank account deposits
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--crm-surface)] border border-[var(--crm-border)] p-3 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-secondary)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search receipt, student or phone..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] placeholder-[var(--crm-text-secondary)] outline-none focus:border-[var(--crm-primary)]"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {['all', 'UPI', 'NetBanking'].map((mode) => (
            <button
              key={mode}
              onClick={() => setModeFilter(mode)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
                modeFilter === mode
                  ? 'bg-[var(--crm-primary)] text-white'
                  : 'bg-[var(--crm-input)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text)]'
              }`}
            >
              {mode === 'all' ? 'All Modes' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--crm-input)] border-b border-[var(--crm-border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
                <th className="py-3 px-4">Receipt Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Course / Program</th>
                <th className="py-3 px-4 text-right">Amount Received</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Counselor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--crm-border)] text-[var(--crm-text)]">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[var(--crm-text-secondary)]">
                    No payment transactions found matching the filter.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[var(--crm-elevated)] transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-[var(--crm-primary)] text-xs">
                      {tx.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[var(--crm-text)]">
                      {tx.studentName}
                    </td>
                    <td className="py-3 px-4 font-mono text-[var(--crm-text-secondary)]">
                      {tx.phone}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[var(--crm-text-secondary)]">
                      {tx.batch}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400 tabular-nums">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)]">
                        {tx.mode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[var(--crm-text-secondary)]">
                      {tx.date}
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)]">
                        {tx.counselor}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
